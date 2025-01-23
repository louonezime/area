import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/common/jwt-auth.guard';
import { AreaService } from './area.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { areaDto, AreaDto, areaSchema } from './dto/area.dto';
import { ZodValidationPipe } from '../validation.pipe';
import { ServiceService } from '../service/service.service';
import { hashPassword } from 'src/auth/utils';
import { WEBHOOK_SERVICE } from 'src/service/service.config';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('area')
export class AreaController {
  private readonly logger = new Logger(AreaController.name);

  constructor(
    private readonly areaService: AreaService,
    private serviceService: ServiceService,
  ) {}

  /* AREA */

  @ApiTags('Area')
  @ApiOperation({ summary: 'Create an action and reaction' })
  @ApiBody({ type: AreaDto })
  @ApiResponse({
    status: 201,
    description: 'Created an AREA',
    schema: {
      example: [
        [
          {
            id: 17,
            name: 'new_user-create_database',
            userId: 13,
            actionId: 12,
            reactionId: 10,
          },
        ],
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request with POST request content',
    schema: {
      example: {
        statusCode: 400,
        timestamp: '2024-10-22T23:39:42.470Z',
        path: '/area',
        message: 'Data validation failed',
        errors: [
          {
            path: 'name',
            message: 'Required',
          },
          {
            path: 'server',
            message: 'Required',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @ApiResponse({
    status: 404,
    description: 'Action or Reaction not found or available',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UsePipes(new ZodValidationPipe(areaSchema))
  async createArea(@Request() req: any, @Body() area: areaDto) {
    const userId = req.user.userId;
    this.logger.log(`Creating AREA for user ${userId}`);

    const [action, reaction] = await Promise.all([
      this.areaService.registerActionToService(userId, area.action),
      this.areaService.registerReactionToService(userId, area.reaction),
    ]);

    this.logger.debug(`Selected action: ${JSON.stringify(action)}`);
    this.logger.debug(`Selected reaction: ${JSON.stringify(reaction)}`);

    if (!action) {
      this.logger.error(`Action is malformatted for user ${userId}`);
      throw new BadRequestException('Malformatted action');
    }
    if (!reaction) {
      this.logger.error(`Reaction is malformatted for user ${userId}`);
      throw new BadRequestException('Malformatted reaction');
    }

    this.logger.debug(
      `Area for ${action.name} - ${reaction.name} is being registered...`,
    );
    return await this.areaService.registerActionReaction(
      userId,
      action,
      reaction,
    );
  }

  @ApiTags('Area')
  @ApiOperation({ summary: 'Delete an action and reaction' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted an AREA',
    schema: {
      example: {
        id: 42,
        name: 'stream_goes_live-send_message',
        userId: 13,
        actionId: 37,
        reactionId: 46,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Request id for AREA isn't well formatted",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @ApiResponse({
    status: 404,
    description: "Couldn't find the AREA to delete",
  })
  @Delete(':id')
  async deleteArea(@Request() req: any, @Param('id') areaId: string) {
    const userId = req.user.userId;
    this.logger.log(`Deleting AREA with ID ${areaId} for user ${userId}`);

    const area = parseInt(areaId, 10);
    if (!area) {
      this.logger.error(`Invalid AREA ID: ${areaId}`);
      throw new BadRequestException('AREA ID is not valid');
    }

    return await this.areaService.deleteActionReaction(userId, area);
  }

  @ApiTags('Area')
  @ApiOperation({ summary: 'List the AREAS created' })
  @ApiResponse({
    status: 200,
    description: 'List of area created.',
    schema: {
      example: [
        [
          {
            id: 3,
            name: 'new_user-create_database',
            userId: 13,
            actionId: 7,
            reactionId: 5,
          },
        ],
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @Get('list')
  async listAreas(@Request() req: any) {
    const userId = req.user.userId;
    return await this.areaService.getAreas(userId);
  }

  /* ACTIONS */

  @ApiTags('Action')
  @ApiOperation({ summary: 'Trigger an action by ID (to test)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully triggered an action',
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @Get('actions/:id/trigger')
  async triggerActionInstance(
    @Request() req: any,
    @Param('id') action: string,
    @Body() body: any,
  ) {
    const userId = req.user.userId;
    const actionId = parseInt(action, 10);
    if (!actionId) {
      this.logger.error(`Invalid action ID: ${action}`);
      throw new BadRequestException('Invalid action ID passed as parameter');
    }

    this.logger.log(`Triggering action ${actionId} for user ${userId}`);
    return await this.areaService.triggerAction(userId, actionId, body);
  }

  @ApiTags('Action')
  @ApiOperation({ summary: 'Get action by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully returns details of action',
    schema: {
      example: {
        id: 37,
        serviceId: 29,
        title: 'Stream Goes Live',
        name: 'stream_goes_live',
        description: 'Triggered when the stream goes live',
        payload: {
          username: 'xqc',
        },
        lastState: null,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @ApiResponse({
    status: 404,
    description: "Action ID invalid, couldn't be found",
  })
  @Get('actions/:id')
  async getAction(@Request() req: any, @Param('id') actionId: string) {
    const userId = req.user.id;
    const actionIdInt = parseInt(actionId, 10);

    const action = await this.areaService.getActionById(actionIdInt);
    const actionConfig = await this.serviceService.getActionFromServiceId(
      userId,
      action?.serviceId,
      action?.name,
    );
    if (!actionConfig || !action)
      throw new NotFoundException(`Couldn\'t find action ${actionId}`);

    const service = await this.serviceService.getServiceById(
      userId,
      action.serviceId,
    );
    if (!service) {
      throw new NotFoundException(
        `Couldn\'t find service for action ${actionId}`,
      );
    }
    if (WEBHOOK_SERVICE.includes(service.name)) {
      const area = await this.areaService.getAreaByActionId(action.id);
      if (!area) {
        throw new NotFoundException(
          `Couldn\'t find are for action ${actionId}`,
        );
      }
      action.payload = {
        webhook_url: `${process.env.WEBHOOK_HOST}/${
          area.id
        }/${await hashPassword(area.id.toString())}`,
      };
    }
    return {
      id: action?.id,
      serviceId: action?.serviceId,
      title: actionConfig.title,
      name: action?.name,
      description: actionConfig.description,
      payload: action?.payload,
      lastState: action?.lastState,
    };
  }

  /* REACTIONS */

  @ApiTags('Reaction')
  @ApiOperation({ summary: 'Trigger a reaction by ID (to test)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully triggered a reaction',
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @Get('reactions/:id/trigger')
  async triggerReactionInstance(
    @Request() req: any,
    @Param('id') reaction: string,
    @Body() body: any,
  ) {
    const userId = req.user.userId;
    const reactionId = parseInt(reaction, 10);
    if (!reactionId) {
      this.logger.error(`Invalid reaction ID: ${reaction}`);
      throw new BadRequestException('Invalid reaction ID passed as parameter');
    }

    this.logger.log(`Triggering reaction ${reactionId} for user ${userId}`);
    return await this.areaService.triggerReaction(userId, reactionId, body);
  }

  @ApiTags('Reaction')
  @ApiOperation({ summary: 'Get reaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully returns details of reaction',
    schema: {
      example: {
        id: 60,
        serviceId: 29,
        title: 'Send Chat Message',
        name: 'send_chat_message',
        description: 'Send a message to your Twitch chat',
        payload: {
          content: 'yooo',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized, user's access token isn't valid",
  })
  @ApiResponse({
    status: 404,
    description: "Action ID invalid, couldn't be found",
  })
  @Get('reactions/:id')
  async getReaction(@Request() req: any, @Param('id') reactionId: string) {
    const userId = req.user.userId;
    const reactionIdInt = parseInt(reactionId, 10);

    const reaction = await this.areaService.getReactionById(reactionIdInt);
    const reactionConfig = await this.serviceService.getReactionFromServiceId(
      userId,
      reaction?.serviceId,
      reaction?.name,
    );
    if (!reactionConfig || !reaction)
      throw new NotFoundException(`Couldn\'t find reaction ${reactionId}`);

    return {
      id: reaction?.id,
      serviceId: reaction?.serviceId,
      title: reactionConfig.title,
      name: reaction?.name,
      description: reactionConfig.description,
      payload: reaction?.payload,
    };
  }
}
