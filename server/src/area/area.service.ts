import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceService } from '../service/service.service';
import { Action, Area, Reaction } from '@prisma/client';
import { areaDetailsDto } from './dto/area.dto';
import { InputJsonValue } from '@prisma/client/runtime/library';

@Injectable()
export class AreaService {
  private readonly logger = new Logger(AreaService.name);

  constructor(
    private prismaService: PrismaService,
    private serviceService: ServiceService,
  ) {}

  /* AREA */

  async registerActionReaction(
    userId: number,
    action: Action,
    reaction: Reaction,
  ) {
    this.logger.debug(`Trigger: ${action?.name}, Reaction: ${reaction?.name}`);

    const area = await this.prismaService.area.create({
      data: {
        name: `${action?.name}-${reaction?.name}`,
        userId: userId,
        actionId: action?.id,
        reactionId: reaction?.id,
      },
    });

    this.logger.log(`AREA created with ID ${area.id}`);
    return area;
  }

  async deleteActionReaction(userId: number, areaId: number) {
    try {
      const area = await this.prismaService.area.delete({
        where: { id: areaId, userId: userId },
      });
      this.logger.log(`Successfully deleted AREA with ID ${areaId}`);
      return area;
    } catch (error) {
      this.logger.error(
        `Error deleting AREA with ID ${areaId}: ${error.message}`,
      );
      throw new NotFoundException('AREA not found');
    }
  }

  async getAreas(userId: number): Promise<Area[]> {
    const areas = this.prismaService.area.findMany({
      where: {
        userId,
      },
    });
    return areas;
  }

  async getAreaById(id: number): Promise<Area | null> {
    const area = await this.prismaService.area.findFirst({
      where: {
        id,
      },
    });
    if (!area) {
      this.logger.warn(`AREA with ID ${id} not found`);
    }
    return area;
  }

  async getAreaByActionId(id: number): Promise<Area | null> {
    const area = await this.prismaService.area.findFirst({
      where: {
        actionId: id,
      },
    });
    if (!area) {
      this.logger.warn(`AREA with ID ${id} not found`);
    }
    return area;
  }

  /* ACTION */

  async updateLastStateAction(actionId: number, data: any) {
    await this.prismaService.action.update({
      where: { id: actionId },
      data: {
        lastState: data,
      },
    });
  }

  async registerActionToService(
    userId: number,
    action: areaDetailsDto,
  ): Promise<Action | null> {
    this.logger.debug(`Registering action...`);
    this.logger.debug(`Action details: ${JSON.stringify(action)}`);
    return await this.registerEntityToService(userId, action, 'action');
  }

  async getActionById(actionId: number): Promise<Action | null> {
    const action = await this.prismaService.action.findFirst({
      where: { id: actionId },
    });
    if (!action) {
      this.logger.warn(`Action with ID ${actionId} not found`);
      throw new NotFoundException('Action not found');
    }

    return action || null;
  }

  async triggerAction(userId: number, actionId: number, body: any) {
    this.logger.log(`Triggering action ID ${actionId} for user ${userId}`);
    const action = await this.getActionById(actionId);
    if (!action) {
      this.logger.error(`Action with ID ${actionId} not found`);
      throw new NotFoundException(`Action ID '${actionId}' not found`);
    }

    const service = await this.serviceService.getServiceById(
      userId,
      action.serviceId,
    );
    const actionToken = await this.serviceService.getServiceAuthTokenById(
      userId,
      service.id,
    );

    if ((!actionToken && actionToken != '') || !service) {
      this.logger.error('Action token or service is not available');
      throw new BadRequestException("Action token isn't available");
    }

    const actionConfig = this.serviceService.getActionFromService(
      service.name,
      action.name,
    );
    return await actionConfig.trigger.request(actionToken, action.payload);
  }

  /* REACTION */

  async registerReactionToService(
    userId: number,
    reaction: areaDetailsDto,
  ): Promise<Reaction | null> {
    this.logger.debug(`Registering reaction...`);
    this.logger.debug(`Reaction details: ${JSON.stringify(reaction)}`);
    return this.registerEntityToService(userId, reaction, 'reaction');
  }

  async getReactionById(reactionId: number): Promise<Reaction | null> {
    const reaction = await this.prismaService.reaction.findFirst({
      where: { id: reactionId },
    });
    if (!reaction) {
      this.logger.warn(`Reaction with ID ${reactionId} not found`);
      throw new NotFoundException('Reaction not found');
    }

    return reaction || null;
  }

  async triggerReaction(userId: number, reactionId: number, body: any) {
    this.logger.log(`Triggering reaction ID ${reactionId} for user ${userId}`);
    const reaction = await this.getReactionById(reactionId);
    if (!reaction) {
      this.logger.error(`Reaction with ID ${reactionId} not found`);
      throw new BadRequestException('Reaction configuration not found');
    }

    const service = await this.serviceService.getServiceById(
      userId,
      reaction?.serviceId,
    );

    const reactionConfig = this.serviceService.getReactionFromService(
      service.name,
      reaction.name,
    );
    if (!reactionConfig) {
      this.logger.error('Reaction configuration not found');
      throw new BadRequestException('Reaction configuration not found');
    }

    const reactionToken = await this.serviceService.getServiceAuthToken(
      userId,
      service.name,
    );
    if (!reactionToken) {
      this.logger.error("Reaction token isn't available");
      throw new BadRequestException("Reaction token isn't set");
    }

    return await reactionConfig.request.request(
      reactionToken,
      reaction?.payload,
    );
  }

  /* HELPER */

  private async registerEntityToService(
    userId: number,
    entity: areaDetailsDto,
    entityType: 'action' | 'reaction',
  ): Promise<any> {
    const service = await this.serviceService.getServiceByName(
      userId,
      entity.service,
    );
    if (!service) {
      this.logger.error(
        `Service ${entity.service} not configured for user ${userId}`,
      );
      throw new BadRequestException(
        `Service ${entity.service} not configured or invalid for user`,
      );
    }

    const entityConfig =
      entityType === 'action'
        ? this.serviceService.getActionFromService(service.name, entity.name)
        : this.serviceService.getReactionFromService(service.name, entity.name);

    if (!entityConfig) {
      this.logger.error(
        `${entityType} configuration not recognized: ${entity.name}`,
      );
      throw new BadRequestException(
        `${entityType} configuration ${entity.name} not recognized`,
      );
    }

    let current_state = {};
    if (entityType == 'action') {
      // Update the state of action for a base on the next trigger fetching
      const actionConfig = this.serviceService.getActionFromService(
        service.name,
        entity.name,
      );
      const auth_token = await this.serviceService.getServiceAuthTokenById(
        service.userId,
        service.id,
      );
      if (!auth_token && auth_token != '') {
        this.logger.error(
          `Failed to retrieve auth token from third-party service ${service.name}`,
        );
        throw new InternalServerErrorException(
          'Failed to retrieve auth token from third-party',
        );
      }

      current_state = await actionConfig.trigger.request(
        auth_token,
        entity.data,
      );
      this.logger.debug(`current_state set to ${current_state}`);
    }

    const createdEntity =
      entityType === 'action'
        ? await this.prismaService.action.create({
            data: {
              serviceId: service.id,
              name: entity.name,
              payload: entity.data ? (entity.data as InputJsonValue) : {},
              lastState: current_state,
            },
          })
        : await this.prismaService.reaction.create({
            data: {
              serviceId: service.id,
              name: entity.name,
              payload: entity.data ? (entity.data as InputJsonValue) : {},
            },
          });

    this.logger.log(
      `${entityType} registered successfully with ID ${createdEntity.id}`,
    );
    return createdEntity;
  }
}
