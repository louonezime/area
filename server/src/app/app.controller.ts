import { Controller, Get, Ip } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Required information on the application server',
  })
  @ApiResponse({
    status: 200,
    description: 'Server has successfully launched and setup services',
    schema: {
      example: {
        client: {
          host: '10.101.53.35',
        },
        server: {
          current_time: 1531680780,
          services: [
            {
              name: 'facebook',
              actions: [
                {
                  name: 'new_message_in_group',
                  description: 'A new message is posted in the group',
                },
                {
                  name: 'new_message_inbox',
                  description: 'A new private message is received by the user',
                },
                {
                  name: 'new_like',
                  description:
                    'The user gains a like from one of their messages',
                },
              ],
              reactions: [
                {
                  name: 'like_message',
                  description: 'The user likes a message',
                },
              ],
            },
          ],
        },
      },
    },
  })
  @Get('about.json')
  showAbout(@Ip() ip: any) {
    return this.appService.getAbout(ip);
  }
}
