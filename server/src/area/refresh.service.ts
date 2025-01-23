import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { AreaService } from './area.service';
import { ServiceService } from '../service/service.service';
import { services } from '../service/service.config';
import { boolean } from 'zod';

@Injectable()
export class RefreshService {
  private readonly logger = new Logger(RefreshService.name);

  constructor(
    private readonly areaService: AreaService,
    private serviceService: ServiceService,
  ) {}

  @Interval(10000)
  async handleInterval() {
    this.logger.debug('New fetching started');

    const areas = await this.serviceService.listAllServices();
    await areas.forEach(async (area) => {
      // RETRIEVE DATA AND CHECK TRIGGER
      this.logger.debug(`Area ${area.id} stated to be processed`);

      if (!area.actionId) {
        throw new Error('No action on specified area');
      }
      const action = await this.areaService.getActionById(area.actionId);
      if (!action) {
        throw new Error('Action specified on area is non existent');
      }
      const service = await this.serviceService.getServiceById(
        area.userId,
        action.serviceId,
      );
      const serviceConfig = services.find((s) => s.name === service.name);
      if (!serviceConfig) {
        throw new Error('Service config linked to action not found');
      }
      const actionConfig = serviceConfig.actions.find(
        (s) => s.name === action.name,
      );
      if (!actionConfig) {
        throw new Error('Action config not found');
      }
      const auth_token = await this.serviceService.getServiceAuthTokenById(
        service.userId,
        service.id,
      );
      if (auth_token == null && auth_token != '') {
        throw new Error('Failed to retrieve auth token from third party');
      }
      //@ts-ignore
      let triggered = false;
      let current_state: any;

      try {
        current_state = await actionConfig.trigger.request(
          auth_token,
          action.payload,
        );
        triggered = actionConfig.trigger.condition(
          current_state,
          action.lastState,
        );
      } catch (err) {
        this.logger.error("Action couldn't be requested ", err);
      }

      // ACTION TO TAKE IF TRIGGERED
      if (triggered) {
        this.logger.debug(`Area ${area.id} is triggered !`);
        this.areaService.updateLastStateAction(action.id, current_state);
        if (!area.reactionId) {
          throw new Error('Reaction for area not found');
        }
        const reaction = await this.areaService.getReactionById(
          area.reactionId,
        );
        if (!reaction) {
          throw new Error('Reaction for area not found');
        }
        const serviceReaction = await this.serviceService.getServiceById(
          area.userId,
          reaction.serviceId,
        );
        const serviceReactionConfig = services.find(
          (s) => s.name === serviceReaction.name,
        );
        if (!serviceReactionConfig) {
          throw new Error('Service config linked to reaction not found');
        }
        const reactionConfig = serviceReactionConfig.reactions?.find(
          (s) => s.name === reaction.name,
        );
        if (!reactionConfig) {
          throw new Error('Reaction config not found');
        }
        const auth_token_reaction =
          await this.serviceService.getServiceAuthTokenById(
            serviceReaction.userId,
            serviceReaction.id,
          );
        if (auth_token_reaction == null) {
          throw new Error('Failed to retrieve auth token from third party');
        }
        try {
          await reactionConfig.request.request(
            auth_token_reaction,
            reaction.payload,
          );
        } catch (err) {
          this.logger.error("Reaction couldn't be requested ", err);
        }
      }
      this.logger.debug(`Area ${area.id} is not triggered`);
    });
  }
}
