import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ServiceConfig } from '../service.types';
import axios from 'axios';

export const discord: ServiceConfig = {
  name: 'discord',
  color: '#5865F2',
  auth: {
    type: 'oauth2',
    authorization: (newRedirect: string | undefined) => {
      const redirectUrl = !newRedirect
        ? encodeURIComponent(
            'http://localhost:8080/service/discord/oauth/callback',
          )
        : encodeURIComponent(newRedirect);
      Logger.debug(`${redirectUrl} used as callback for Discord.`);

      if (!process.env.DISCORD_SERVICE_CLIENT_ID)
        Logger.error("DISCORD_SERVICE_CLIENT_ID can't be found");
      return `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_SERVICE_CLIENT_ID}&permissions=17600775981056&response_type=code&redirect_uri=${redirectUrl}&integration_type=0&scope=identify+bot+guilds+applications.commands`;
    },
    retrieveToken: async (code: string, newRedirect: string | undefined) => {
      const redirectUrl =
        newRedirect || 'http://localhost:8080/service/discord/oauth/callback';
      Logger.debug(`redirectUrl set as ${redirectUrl}`);

      if (!process.env.DISCORD_SERVICE_CLIENT_ID)
        Logger.error("DISCORD_SERVICE_CLIENT_ID can't be found");
      if (!process.env.DISCORD_SERVICE_CLIENT_SECRET)
        Logger.error("DISCORD_SERVICE_CLIENT_SECRET can't be found");

      const params = new URLSearchParams();
      params.append('client_id', process.env.DISCORD_SERVICE_CLIENT_ID!);
      params.append(
        'client_secret',
        process.env.DISCORD_SERVICE_CLIENT_SECRET!,
      );
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', redirectUrl);

      try {
        const res = await axios.post(
          'https://discord.com/api/oauth2/token',
          params,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        );
        return {
          accessToken: res.data.access_token,
          refresh_token: res.data.refresh_token || null,
          expiresAt: null,
          tokenType: res.data.token_type,
          metadata: res.data,
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const { status, data } = error.response;
          Logger.error(`DISCORD: ${status} - ${data.error}`);
          throw new UnauthorizedException(
            data.error || 'Failed to exchange token',
          );
        } else {
          Logger.error(
            `Unknown error during Discord token exchange: ${error.message}`,
          );
          throw new UnauthorizedException('Failed to exchange token');
        }
      }
    },
    refreshToken: async (refresh_token: string) => {
      const params = new URLSearchParams();
      params.append('client_id', process.env.DISCORD_SERVICE_CLIENT_ID!);
      params.append(
        'client_secret',
        process.env.DISCORD_SERVICE_CLIENT_SECRET!,
      );
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refresh_token);

      try {
        const res = await axios.post(
          'https://discord.com/api/oauth2/token',
          params,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        return {
          accessToken: res.data.access_token,
          refresh_token: res.data.refresh_token || null,
          expiresAt: null,
          tokenType: res.data.token_type,
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const { status, data } = error.response;
          Logger.error(`DISCORD: ${status} ${data.error_description}`);
          throw new BadRequestException(
            data.error || 'Failed to refresh token',
          );
        } else {
          Logger.error(`DISCORD: ${error.message}`);
          throw new UnauthorizedException('Failed to refresh token');
        }
      }
    },
  },
  actions: [
    {
      title: 'On pinned message',
      name: 'on_pinned_message',
      description: 'Event triggered when a new message is pinned in a channel',
      form: [
        {
          title: 'Channel ID',
          name: 'channelId',
          value: 'string',
          hint: "Right click on any given channel, and select 'Copy Channel ID' (if you can't find this, you will need to change in 'Developer mode' in your account settings)",
        },
      ],
      trigger: {
        request: async (authToken: string, data: any) => {
          try {
            const response = await axios.get(
              `https://discord.com/api/v10/channels/${data.channelId}/pins`,
              {
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bot ${process.env.DISCORD_SERVICE_BOT_TOKEN}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            return response.data;
          } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
              const { data } = error.response;
              Logger.error(`DISCORD: ${data.message}`);
              throw new UnauthorizedException(
                'Failed to retrieve pinned messages',
              );
            }
            throw new InternalServerErrorException(
              'Failed to retrieve pinned messages',
            );
          }
        },
        condition: (current_state: any, previous_state: any): boolean => {
          return current_state.length > previous_state.length;
        },
      },
    },
  ],
  reactions: [
    {
      title: 'Send Message',
      name: 'send_message',
      description: 'Send a message to a channel',
      form: [
        {
          title: 'Channel ID',
          name: 'channelId',
          value: 'string',
          hint: "Right click on any given channel, and select 'Copy Channel ID' (if you can't find this, you will need to change in 'Developer mode' in your account settings)",
        },
        {
          title: 'Content',
          name: 'content',
          value: 'string',
          hint: 'Message that you want to send',
        },
      ],
      request: {
        request: async (authToken: string, data: any) => {
          const payload = {
            content: data.content,
          };

          Logger.debug(
            `Passing content: ${JSON.stringify(payload)} to ${data.channelId}`,
          );
          try {
            const response = await axios.post(
              `https://discord.com/api/channels/${data.channelId}/messages`,
              payload,
              {
                headers: {
                  Authorization: `Bot ${process.env.DISCORD_SERVICE_BOT_TOKEN}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            return response.data;
          } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
              const { data } = error.response;
              Logger.error(`DISCORD: ${data.message}`);
              throw new UnauthorizedException(
                data.message || 'Failed to send message through Discord',
              );
            }
            throw new InternalServerErrorException(
              'Failed to send message through Discord',
            );
          }
        },
      },
    },
    {
      title: 'Send Direct Message',
      name: 'send_direct_message',
      description: 'Send a direct message to your account',
      form: [
        {
          title: 'Content',
          name: 'content',
          value: 'string',
          hint: 'Message that you want to send',
        },
      ],
      request: {
        request: async (authToken: string, data: any) => {
          const payload = {
            content: data.content,
          };

          try {
            const userInfoResponse = await axios.get(
              'https://discord.com/api/users/@me',
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            const userId = userInfoResponse.data.id;

            const params = {
              recipient_id: userId,
            };
            const createChannelResponse = await axios.post(
              'https://discord.com/api/users/@me/channels',
              params,
              {
                headers: {
                  Authorization: `Bot ${process.env.DISCORD_SERVICE_BOT_TOKEN}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            const channelId = createChannelResponse.data.id;

            const dmChannelResponse = await axios.post(
              `https://discord.com/api/channels/${channelId}/messages`,
              payload,
              {
                headers: {
                  Authorization: `Bot ${process.env.DISCORD_SERVICE_BOT_TOKEN}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            return dmChannelResponse.data;
          } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
              const { data } = error.response;
              Logger.error(`DISCORD: ${data.message}`);
              throw new InternalServerErrorException(data.message);
            }
            throw new InternalServerErrorException(
              'Failed to send direct message',
            );
          }
        },
      },
    },
  ],
};
