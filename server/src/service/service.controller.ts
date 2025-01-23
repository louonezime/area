import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  Request,
  BadRequestException,
  HttpStatus,
  UnauthorizedException,
  NotFoundException,
  Delete,
  Logger,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { ZodValidationPipe } from '../validation.pipe';
import { ApiKeyDto, apiKeyDto, apiKeySchema } from './dto/apikey.dto';
import { JwtAuthGuard } from '../auth/common/jwt-auth.guard';
import { NotFoundError } from 'rxjs';

@ApiTags('Service')
@Controller('service')
export class ServiceController {
  private readonly logger = new Logger(ServiceController.name);

  constructor(private serviceService: ServiceService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List services implemented' })
  @ApiParam({
    name: 'redirect',
    type: 'string',
    description: 'Redirect URI for the OAuth2 provider (optional)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully obained the total of available services',
    schema: {
      example: [
        {
          name: 'notion',
          color: '#000000',
          auth: {
            type: 'oauth2',
            url: 'https://api.notion.com/v1/oauth/authorize?owner=user&client_id=...',
          },
          actions: [
            {
              title: 'New user',
              name: 'new_user',
              description: 'A new user is added in the workspace',
              form: [],
              hint: null,
            },
          ],
          reactions: [
            {
              title: 'Create database',
              name: 'create_database',
              description: 'Create a database',
              form: [
                {
                  title: 'Field Title',
                  name: 'pageName',
                  value: 'string',
                  hint: 'Title of the database title',
                },
              ],
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @HttpCode(HttpStatus.OK)
  @Get('list')
  list(@Query('redirect') newRedirect: string) {
    return this.serviceService.listServices(newRedirect);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List of services authenticated',
  })
  @ApiResponse({
    status: 200,
    description:
      'Successfully obained the total of services authenticated by user',
    schema: {
      example: [
        {
          id: 19,
          name: 'github',
          color: '#404040',
          state: 'ACTIVE',
          type: 'apiKey',
        },
        {
          id: 27,
          name: 'notion',
          color: '#000000',
          state: 'ACTIVE',
          type: 'oauth2',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @Get('myList')
  async myList(@Request() req: any) {
    const userId = req.user.userId;
    return await this.serviceService.listMyServices(userId);
  }

  @ApiOperation({
    summary:
      'Callback redirection from OAuth2 provider that retrieves the code from query directly',
  })
  @ApiParam({
    name: 'serviceName',
    type: 'string',
    description: 'Name of the service',
  })
  @ApiResponse({
    status: 200,
    description:
      'User is successfully returned the code retrieved from OAuth2 provider',
    schema: {
      example: {
        oauth_code: '03997c84-a60d-461f-a83e-fd4fbb7427c0',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: `Callback doesn't contain a code`,
  })
  @ApiResponse({
    status: 404,
    description: `Service can't found; is not available`,
  })
  @HttpCode(HttpStatus.OK)
  @Get(':serviceName/oauth/callback')
  async callbackOauth(
    @Param('serviceName') serviceName: string,
    @Query('code') code: string | null,
  ) {
    if (!serviceName)
      throw new BadRequestException("Service name isn't specified");
    if (!code) throw new BadRequestException("Callback doesn't contain a code");

    const service = this.serviceService.getServiceConfig(serviceName);
    if (!service) {
      throw new NotFoundException("Service isn't found/ available");
    }
    return { oauth_code: code };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Add a secure oauth connection; linking an authenticated service on your account',
  })
  @ApiParam({
    name: 'serviceName',
    type: 'string',
    description: 'Name of the service',
  })
  @ApiParam({
    name: 'redirect',
    type: 'string',
    description: 'Redirect URI for the OAuth2 provider (optional)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated to service',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request, invalid code or state of service oauth2 callback',
  })
  @ApiResponse({
    status: 401,
    description:
      "Unauthorized, user's access token isn't valid or provider callback is invalid",
  })
  @ApiResponse({
    status: 404,
    description: "Not found, service isn't found/ available",
  })
  @Get(':serviceName/oauth/callback/code-add')
  async callbackOauthAuthenticated(
    @Param('serviceName') serviceName: string,
    @Query('code') code: string | null,
    @Query('redirect') newRedirect: string | undefined,
    @Request() req: any,
  ) {
    if (!code) throw new BadRequestException("Callback doesn't contain a code");
    await this.serviceService.oauthCallbackProcess(
      req.user.userId,
      serviceName,
      code,
      newRedirect,
    );

    this.logger.log(`OAuth2 authenticated for ${serviceName} successfully.`);
    return {
      success: true,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check an api key is registered to a service' })
  @ApiParam({
    name: 'serviceName',
    type: 'string',
    description: 'Name of the service',
  })
  @ApiResponse({
    status: 200,
    description: 'Api key is successful',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @ApiResponse({
    status: 404,
    description: "Not found, service isn't found/ available",
  })
  @Get(':serviceName/status')
  async checkServiceStatus(
    @Param('serviceName') serviceName: string,
    @Request() req: any,
  ) {
    return await this.serviceService.getServiceStatus(
      req.user.userId,
      serviceName,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add an api key to a service' })
  @ApiParam({
    name: 'serviceName',
    type: 'string',
    description: 'Name of the service',
  })
  @ApiResponse({
    status: 201,
    description: 'Api key successfully created to service',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, invalid API key',
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @ApiResponse({
    status: 404,
    description: "Not found, service isn't found/ available",
  })
  @ApiBody({ type: ApiKeyDto })
  @HttpCode(HttpStatus.CREATED)
  @Post(':serviceName/add-api-key')
  @UsePipes(new ZodValidationPipe(apiKeySchema))
  async addApiKeyIntegration(
    @Body() apiKeyDto: apiKeyDto,
    @Param('serviceName') serviceName: string,
    @Request() req: any,
  ) {
    const res = await this.serviceService.checkApiKeyService(
      serviceName,
      apiKeyDto.apiKey,
    );
    if (!res) throw new BadRequestException('Error with api key');
    await this.serviceService.registerApikeyService(
      req.user.userId,
      serviceName,
      apiKeyDto.apiKey,
    );

    this.logger.log(`API key added to ${serviceName} successfully.`);
    return {
      success: true,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add a service that has no form of authentication required',
  })
  @ApiParam({
    name: 'serviceName',
    type: 'string',
    description: 'Name of the service',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated to service',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @ApiResponse({
    status: 404,
    description: "Not found, service isn't found/ available",
  })
  @ApiBody({
    description: 'No body required for this request',
    required: false,
  })
  @Post(':serviceName/register-normal')
  async registerNormalService(
    @Param('serviceName') serviceName: string,
    @Request() req: any,
  ) {
    return await this.serviceService.registerNormalService(
      req.user.userId,
      serviceName,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a service' })
  @ApiParam({
    name: 'serviceId',
    type: 'string', // TODO UUID
    description: 'ID of the service',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched a service',
    schema: {
      example: {
        id: 27,
        name: 'notion',
        color: '#000000',
        state: 'ACTIVE',
        type: 'oauth2',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @ApiResponse({
    status: 404,
    description: "Couldn't find the service; service isn't available",
  })
  @Get(':serviceId')
  async getService(@Request() req: any, @Param('serviceId') serviceId: string) {
    const userId = req.user.userId;

    return await this.serviceService.getServiceByIdForUser(
      userId,
      parseInt(serviceId, 10),
    ); // TODO UUID
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete/ remove a service' })
  @ApiParam({
    name: 'serviceName',
    type: 'string',
    description: 'Name of the service',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted a service',
    schema: {
      example: {
        id: 33,
        userId: 13,
        name: 'date_and_time',
        oauthTokenId: null,
        ApiToken: null,
        state: 'ACTIVE',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @ApiResponse({
    status: 404,
    description: "Couldn't find the service; service isn't available",
  })
  @Delete(':serviceName')
  async deleteService(
    @Request() req: any,
    @Param('serviceName') serviceName: string,
  ) {
    const userId = req.user.userId;
    this.logger.log(`Deleting Service ${serviceName}...`);

    return await this.serviceService.deleteService(userId, serviceName);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List of actions implemented based on service' })
  @ApiParam({
    name: 'serviceName',
    type: 'string',
    description: 'Name of the service',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available actions',
    schema: {
      example: [
        {
          actions: [
            {
              title: 'Get User Info',
              name: 'get_user_info',
              description: 'Fetch the user information',
              form: [],
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @ApiResponse({
    status: 404,
    description: "Couldn't find the service; service isn't available",
  })
  @HttpCode(HttpStatus.OK)
  @Get(':serviceName/actions')
  listActions(@Param('serviceName') serviceName: string) {
    return this.serviceService.listServiceActions(serviceName);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List of reactions implemented based on service' })
  @ApiParam({
    name: 'serviceName',
    type: 'string',
    description: 'Name of the service',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available reactions',
    schema: {
      example: [
        {
          reactions: [
            {
              title: 'Send Message',
              name: 'send_message',
              description: 'Send a message to a channel',
              form: [
                {
                  name: 'channelId',
                  type: 'string',
                },
                {
                  name: 'content',
                  type: 'string',
                },
              ],
            },
            {
              title: 'Send Direct Message',
              name: 'send_direct_message',
              description: 'Send a direct message to a user',
              form: [
                {
                  name: 'content',
                  type: 'string',
                },
              ],
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @ApiResponse({
    status: 404,
    description: "Couldn't find the service; service isn't available",
  })
  @HttpCode(HttpStatus.OK)
  @Get(':serviceName/reactions')
  listReactions(@Param('serviceName') serviceName: string) {
    return this.serviceService.listServiceReactions(serviceName);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Refresh the auth token of the service' })
  @ApiParam({
    name: 'serviceName',
    type: 'string',
    description: 'Name of the service',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully refreshed token for service',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Service doesn't provide refresh mechanism",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @ApiResponse({
    status: 404,
    description: "Service isn't available/ not found",
  })
  @ApiResponse({
    status: 500,
    description: 'Unsuccessfully refreshed token',
  })
  @Get(':serviceName/refresh')
  refreshServiceAuth(
    @Request() req: any,
    @Param('serviceName') serviceName: string,
  ) {
    const userId = req.user.userId;
    return this.serviceService.refreshToken(userId, serviceName);
  }
}
