import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { services } from './service.config';
import { PrismaService } from '../prisma/prisma.service';
import { OAuthToken, Service, ServiceState } from '@prisma/client';
import { OauthTokenFetchResponse, ServiceConfig } from './service.types';

@Injectable()
export class ServiceService {
  private readonly logger = new Logger(ServiceService.name);

  constructor(private prismaService: PrismaService) {}

  listServices(newRedirect: string | undefined) {
    return services.map((service: ServiceConfig) => {
      return {
        name: service.name,
        color: service.color,
        auth: {
          type: service.auth ? service.auth.type : null,
          url:
            service.auth.type == 'oauth2' && service.auth.authorization
              ? service.auth.authorization(newRedirect)
              : null,
          hint:
            service.auth.type == 'apiKey' && service.auth.hint
              ? service.auth.hint
              : null,
        },
        actions: service.actions.map((action: any) => {
          return {
            title: action.title,
            name: action.name,
            description: action.description,
            form: action.form,
          };
        }),
        reactions: service.reactions?.map((reaction: any) => {
          return {
            title: reaction.title,
            name: reaction.name,
            description: reaction.description,
            form: reaction.form,
          };
        }),
      };
    });
  }

  async listMyServices(userId: number): Promise<Partial<Service>[]> {
    const services = await this.prismaService.service.findMany({
      where: { userId },
    });

    return services.map((service) => {
      const serviceConfig = this.getServiceConfig(service.name);
      return {
        id: service.id,
        name: service.name,
        color: serviceConfig.color,
        state: service.state,
        type: serviceConfig.auth.type,
      };
    });
  }

  async listAllServices() {
    return await this.prismaService.area.findMany({});
  }

  async registerOauthService(
    userId: number,
    name: string,
    tokenData: OauthTokenFetchResponse,
  ) {
    const serviceExisting = await this.prismaService.service.findFirst({
      where: {
        userId,
        name,
      },
      include: {
        oauthToken: true,
      },
    });
    if (serviceExisting && serviceExisting.oauthToken) {
      await this.prismaService.oAuthToken.update({
        where: {
          id: serviceExisting.oauthToken.id,
        },
        data: {
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refresh_token,
          expiresAt: tokenData.expiresAt,
          tokenType: tokenData.tokenType,
          metadata: tokenData.metadata,
        },
      });
      await this.prismaService.service.update({
        where: {
          id: serviceExisting.id,
        },
        data: {
          state: ServiceState.ACTIVE,
        },
      });
      return;
    }

    const serviceCreationRes = await this.prismaService.service.create({
      data: {
        userId,
        name,
        state: ServiceState.ACTIVE,
      },
    });

    await this.prismaService.oAuthToken.create({
      data: {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expiresAt,
        tokenType: tokenData.tokenType,
        metadata: tokenData.metadata,
        service: {
          connect: {
            id: serviceCreationRes.id,
          },
        },
      },
    });
  }

  async oauthCallbackProcess(
    userId: number,
    name: string,
    code: string,
    newRedirect: string | undefined,
  ) {
    const service = services.find((service) => {
      return service.name == name;
    });
    if (!service) throw new NotFoundException('Service not found');
    if (service.auth?.type != 'oauth2' || !service.auth.retrieveToken)
      throw new HttpException(
        'Service not working with oauth2',
        HttpStatus.BAD_REQUEST,
      );

    const resToken = await service.auth.retrieveToken(code, newRedirect);
    if (!resToken) {
      throw new BadRequestException('Error in callback with code');
    }
    return this.registerOauthService(userId, name, resToken);
  }

  async checkApiKeyService(name: string, apiKey: string) {
    const service = services.find((service) => {
      return service.name == name;
    });
    if (!service) throw new NotFoundException('Service not found');

    if (service.auth.type != 'apiKey' || !service.auth.testValidity)
      throw new BadRequestException('Service not working with API key');

    try {
      await service.auth.testValidity(apiKey);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Invalid API key');
    }
    return {
      sucess: true,
    };
  }

  async registerNormalService(userId: number, name: string) {
    const service = this.getServiceConfig(name);
    if (!service)
      throw new NotFoundException("Service isn't available/ can't be found");

    const serviceExisting = await this.prismaService.service.findFirst({
      where: {
        userId,
        name,
      },
    });
    if (serviceExisting) {
      return { success: true };
    }

    await this.prismaService.service.create({
      data: {
        name,
        userId,
        ApiToken: null,
        oauthTokenId: null,
        state: ServiceState.ACTIVE,
      },
    });

    return { success: true };
  }

  async registerApikeyService(userId: number, name: string, apiKey: string) {
    const serviceExisting = await this.prismaService.service.findFirst({
      where: {
        userId,
        name,
      },
    });
    if (serviceExisting) {
      await this.prismaService.service.updateMany({
        where: {
          userId,
          name,
        },
        data: {
          ApiToken: apiKey,
          state: ServiceState.ACTIVE,
        },
      });
      return;
    }
    await this.prismaService.service.create({
      data: {
        name,
        userId,
        ApiToken: apiKey,
        oauthTokenId: null,
        state: ServiceState.ACTIVE,
      },
    });
  }

  async deleteService(userId: number, serviceName: string) {
    const serviceConfig = this.getServiceConfig(serviceName);
    if (!serviceConfig) throw new NotFoundException("Service isn't found");
    const service = await this.getServiceByName(userId, serviceName);

    if (service.oauthTokenId) {
      await this.prismaService.oAuthToken.delete({
        where: { id: service.oauthTokenId },
      });
    }
    // do i also delete areas associated
    return await this.prismaService.service.delete({
      where: { id: service.id },
    });
  }

  async refreshToken(userId: number, serviceName: string) {
    const token = await this.getServiceOAuthToken(userId, serviceName);
    const service = await this.getServiceByName(userId, serviceName);
    if (!service) throw new NotFoundException("Service isn't available");
    const serviceConfig = this.getServiceConfig(serviceName);
    if (
      !token?.refreshToken ||
      serviceConfig.auth?.type != 'oauth2' ||
      !serviceConfig.auth.refreshToken
    )
      throw new BadRequestException(
        'Service/ refresh token not working with oauth2',
      );

    const refreshedToken = await serviceConfig.auth.refreshToken(
      token?.refreshToken,
    );
    if (!refreshedToken) {
      throw new InternalServerErrorException('Unsuccessfully refreshed token');
    }

    await this.prismaService.oAuthToken.update({
      where: { id: token?.id },
      data: {
        accessToken: refreshedToken.accessToken,
        refreshToken: refreshedToken.refresh_token,
        tokenType: refreshedToken.tokenType,
      },
    });
    await this.prismaService.service.update({
      where: {
        id: service.id,
      },
      data: {
        state: ServiceState.ACTIVE,
      },
    });
    return { success: true };
  }

  async getServiceOAuthToken(
    userId: number,
    serviceName: string,
  ): Promise<OAuthToken | null> {
    const service = await this.prismaService.service.findFirst({
      where: { userId, name: serviceName, ApiToken: null },
      include: { oauthToken: true },
    });
    if (!service)
      throw new NotFoundException(`Service ${serviceName} not found`);

    return service.oauthToken;
  }

  async getServiceStatus(userId: number, serviceName: string): Promise<any> {
    const service = await this.prismaService.service.findFirst({
      where: { userId, name: serviceName },
    });
    if (!service) {
      throw new NotFoundException(
        `Service ${serviceName} not found/ authenticated`,
      );
    }
    if (service?.state === ServiceState.ACTIVE) {
      return { success: true };
    }
    return { success: false };
  }

  async getServiceAuthToken(
    userId: number,
    serviceName: string,
  ): Promise<string | null> {
    const service = await this.prismaService.service.findFirst({
      where: { userId, name: serviceName },
      include: { oauthToken: true },
    });

    if (!service)
      throw new NotFoundException(`Service ${serviceName} not found`);

    return service.oauthToken?.accessToken || service.ApiToken;
  }

  async getServiceAuthTokenById(
    userId: number,
    serviceId: number,
  ): Promise<string | null> {
    const service = await this.prismaService.service.findFirst({
      where: { userId, id: serviceId },
      include: { oauthToken: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID \'${serviceId}\' not found`);
    } else {
      const serviceNoAuth = await this.prismaService.service.findFirst({
        where: { userId, id: serviceId, oauthToken: null, ApiToken: null },
      });
      if (serviceNoAuth) return '';
    }

    return service.oauthToken?.accessToken || service.ApiToken;
  }

  async getServiceByName(
    userId: number,
    serviceName: string,
  ): Promise<Service> {
    const service = await this.prismaService.service.findFirst({
      where: { userId: userId, name: serviceName },
    });

    if (!service)
      throw new NotFoundException(
        `Service ${serviceName} not found/ authenticated`,
      );

    return service;
  }

  async getServiceByIdForUser(userId: number, serviceId: number): Promise<any> {
    const service = await this.prismaService.service.findFirst({
      where: { id: serviceId, userId },
      include: { oauthToken: true },
    });
    if (!service)
      throw new NotFoundException(`Service with ID \'${serviceId}\' not found`);

    const serviceConfig = this.getServiceConfig(service.name);
    return {
      id: service.id,
      name: service.name,
      color: serviceConfig.color,
      state: service.state,
      type: serviceConfig.auth.type,
    };
  }

  async getServiceById(userId: number, serviceId: number): Promise<Service> {
    const service = await this.prismaService.service.findFirst({
      where: { id: serviceId, userId },
      include: { oauthToken: true },
    });

    if (!service)
      throw new NotFoundException(`Service with ID \'${serviceId}\' not found`);

    return service;
  }

  listServiceActions(serviceName: string) {
    const service = this.getServiceConfig(serviceName);
    if (!service) {
      throw new NotFoundException(`Service couldn't be found`);
    }

    return {
      actions: service?.actions.map((action: any) => {
        return {
          title: action.title,
          name: action.name,
          description: action.description,
          form: action.form,
        };
      }),
    };
  }

  listServiceReactions(serviceName: string) {
    const service = this.getServiceConfig(serviceName);
    if (!service) {
      throw new NotFoundException(`Service couldn't be found`);
    }

    return {
      reactions: service?.reactions?.map((reaction: any) => {
        return {
          title: reaction.title,
          name: reaction.name,
          description: reaction.description,
          form: reaction.form,
        };
      }),
    };
  }

  getServiceConfig(serviceName: string) {
    const service = services.find((s) => s.name === serviceName);
    if (!service)
      throw new NotFoundException(
        `Service ${serviceName} not configured or invalid for user`,
      );

    return service;
  }

  getActionFromService(serviceName: string, actionName: string) {
    const service = this.getServiceConfig(serviceName);
    const action = service.actions?.find((a) => a.name === actionName);
    if (!action) {
      this.logger.warn(`Action ${actionName} not found`);
      throw new NotFoundException(`Action \'${actionName}\' not found`);
    }

    return action;
  }

  async getActionFromServiceId(
    userId: number,
    serviceId: number | undefined,
    actionName: string | undefined,
  ) {
    if (!serviceId || !actionName) {
      throw new NotFoundException(`ServiceId/ action name not found`);
    }
    const service = await this.getServiceById(userId, serviceId);
    const serviceConfig = this.getServiceConfig(service.name);
    const action = serviceConfig.actions?.find((a) => a.name === actionName);
    if (!action) {
      this.logger.warn(`Action ${actionName} not found`);
      throw new NotFoundException(`Action \'${actionName}\' not found`);
    }

    return action;
  }

  getReactionFromService(serviceName: string, reactionName: string) {
    const service = this.getServiceConfig(serviceName);
    const reaction = service.reactions?.find((a) => a.name === reactionName);
    if (!reaction) {
      this.logger.warn(`Reaction ${reactionName} not found`);
      throw new NotFoundException(`Reaction \'${reactionName}\' not found`);
    }
    return reaction;
  }

  async getReactionFromServiceId(
    userId: number,
    serviceId: number | undefined,
    reactionName: string | undefined,
  ) {
    if (!serviceId || !reactionName) {
      throw new NotFoundException(`ServiceId/ reaction name not found`);
    }
    const service = await this.getServiceById(userId, serviceId);
    const serviceConfig = this.getServiceConfig(service.name);
    const reaction = serviceConfig.reactions?.find(
      (a) => a.name === reactionName,
    );
    if (!reaction) {
      this.logger.warn(`Reaction ${reactionName} not found`);
      throw new NotFoundException(`Reaction \'${reactionName}\' not found`);
    }

    return reaction;
  }
}
