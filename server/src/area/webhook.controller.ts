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
import { AreaService } from './area.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AreaDto } from './dto/area.dto';
import { ServiceService } from '../service/service.service';
import { hashPassword } from 'src/auth/utils';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly areaService: AreaService,
    private serviceService: ServiceService,
  ) {}

  @ApiTags('Webhook')
  @ApiOperation({ summary: 'Receiver for webhook data' })
  @ApiBody({ type: AreaDto })
  @ApiResponse({
    status: 200,
    description: 'Received the event',
    schema: {
      example: [
        [
          {
            event: 'new_event',
          },
        ],
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Webhook service uknown',
  })
  @HttpCode(HttpStatus.OK)
  @Post(':areaId/:webhookSecret')
  async receiveWebhook(
    @Request() req: any,
    @Body() body: any,
    @Param('areaId') areaId: string,
    @Param('webhookSecret') webhookSecret: string,
  ) {
    this.logger.log(`Received webhook for area ${areaId}`);
    if ((await hashPassword(areaId)) != webhookSecret) {
      throw new BadRequestException('Invalid webhook secret');
    }
    const reactionIdInt = parseInt(areaId, 10);
    const area = await this.areaService.getAreaById(reactionIdInt);
    if (!area) {
      this.logger.error(`Invalid AREA for reaction ID ${reactionIdInt}`);
      throw new BadRequestException('Invalid area');
    }
    if (!area.actionId) {
      this.logger.error(`No action associated with AREA ID ${reactionIdInt}`);
      throw new BadRequestException('No action on specified area');
    }
    const action = await this.areaService.getActionById(area.actionId);
    if (!action) {
      this.logger.error(`No action found for AREA ID ${reactionIdInt}`);
      throw new BadRequestException('Action specified on area is non existent');
    }
    const service = await this.serviceService.getServiceById(
      area.userId,
      action.serviceId,
    );
    const actionConfig = this.serviceService.getActionFromService(
      service.name,
      action.name,
    );
    if (!actionConfig) {
      this.logger.error(`Action config not found for action ${action.name}`);
      throw new BadRequestException('Action config not found');
    }

    const triggered = actionConfig.trigger.condition(body, null);
    if (!triggered) {
      return {
        success: false, // not triggered by this event
      };
    }

    // Launch reaction
    if (!area.reactionId) {
      this.logger.error(`No reaction found for AREA ID ${reactionIdInt}`);
      throw new BadRequestException('Reaction for area not found');
    }

    const reaction = await this.areaService.getReactionById(area.reactionId);
    if (!reaction) {
      this.logger.error(`No reaction found for AREA ID ${reactionIdInt}`);
      throw new BadRequestException('Reaction for area not found');
    }
    const serviceReaction = await this.serviceService.getServiceById(
      area.userId,
      reaction.serviceId,
    );

    const reactionConfig = this.serviceService.getReactionFromService(
      serviceReaction.name,
      reaction.name,
    );
    if (!reactionConfig) {
      this.logger.error(
        `Reaction config not found for reaction ${reaction.name}`,
      );
      throw new BadRequestException('Reaction config not found');
    }
    const auth_token_reaction =
      await this.serviceService.getServiceAuthTokenById(
        serviceReaction.userId,
        serviceReaction.id,
      );
    if (auth_token_reaction == null) {
      this.logger.error(
        `Failed to retrieve auth token for reaction service ${serviceReaction.name}`,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve auth token from third party',
      );
    }

    await reactionConfig.request.request(auth_token_reaction, reaction.payload);

    this.logger.log(
      `Reaction successfully triggered for reaction ID ${reactionIdInt}`,
    );

    return {
      success: true,
    };
  }
}
