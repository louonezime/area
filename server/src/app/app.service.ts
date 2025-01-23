import { Injectable, Ip } from '@nestjs/common';
import { services } from '../service/service.config';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getAbout(ip: any): any {
    return {
      client: {
        host: ip,
      },
      server: {
        current_time: Math.floor(Date.now() / 1000),
        services: services.map((service: any) => {
          return {
            name: service.name,
            actions: service.actions.map((action: any) => {
              return {
                name: action.name,
                description: action.description,
              };
            }),
            reactions: service.reactions?.map((action: any) => {
              return {
                name: action.name,
                description: action.description,
              };
            }),
          };
        }),
      },
    };
  }
}
