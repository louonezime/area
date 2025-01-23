import { BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';
import { ServiceConfig } from '../service.types';

export const slack: ServiceConfig = {
  name: 'slack',
  color: '#007A5A',
  auth: {
    type: 'oauth2',
    authorization: (newRedirect: string | undefined) => {
      const redirectUrl = !newRedirect
        ? encodeURIComponent(
            'http://localhost:8080/service/slack/oauth/callback',
          )
        : encodeURIComponent(newRedirect);
      Logger.debug(`${redirectUrl} used as callback for Slack.`);

      if (!process.env.SLACK_SERVICE_CLIENT_ID) {
        Logger.error("SLACK_SERVICE_CLIENT_ID can't be found");
      }
      const scopes = [
        'channels:read',
        'chat:write',
        'users:read',
        'team:read',
        'files:read',
        'channels:history',
        'chat:write.public',
      ].join(' ');
      const encodedScopes = encodeURIComponent(scopes);

      return `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_SERVICE_CLIENT_ID}&scope=${encodedScopes}&redirect_uri=${redirectUrl}`;
    },
    retrieveToken: async (code: string, newRedirect: string | undefined) => {
      const redirectUrl = !newRedirect
        ? encodeURI('http://localhost:8080/service/slack/oauth/callback')
        : encodeURI(newRedirect);
      Logger.debug(`redirectUrl set as ${redirectUrl}`);

      if (!process.env.SLACK_SERVICE_CLIENT_ID) {
        Logger.error("SLACK_SERVICE_CLIENT_ID can't be found");
      }
      if (!process.env.SLACK_SERVICE_CLIENT_SECRET) {
        Logger.error("SLACK_SERVICE_CLIENT_SECRET can't be found");
      }

      const params = new URLSearchParams();
      params.append('client_id', process.env.SLACK_SERVICE_CLIENT_ID!);
      params.append('client_secret', process.env.SLACK_SERVICE_CLIENT_SECRET!);
      params.append('code', code);
      params.append('redirect_uri', redirectUrl);

      try {
        const response = await axios.post(
          'https://slack.com/api/oauth.v2.access',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        if (!response.data.ok) {
          Logger.error(`SLACK: ${response.data.error}`);
          throw new BadRequestException(
            response.data.error || 'Failed to exchange token',
          );
        }

        return {
          accessToken: response.data.access_token,
          refresh_token: response.data.refresh_token || null,
          expiresAt: null,
          tokenType: response.data.token_type,
          metadata: response.data,
        };
      } catch (error) {
        Logger.error(`SLACK: ${error.response?.data.error}`);
        throw new BadRequestException(
          error.response?.data.error || 'Failed to exchange token',
        );
      }
    },
    refreshToken: null,
  },
  actions: [],
  reactions: [
    {
      title: 'Send Message',
      name: 'send_message',
      description: 'Send a message to a Slack channel',
      form: [
        {
          title: 'Channel',
          name: 'channel',
          value: 'string',
          hint: 'The ID of the channel to send the message to',
        },
        {
          title: 'Message',
          name: 'message',
          value: 'string',
          hint: 'The message to send',
        },
      ],
      request: {
        request: async (authToken: string, data: any) => {
          try {
            const response = await axios.post(
              'https://slack.com/api/chat.postMessage',
              {
                channel: data.channel,
                text: data.message,
              },
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            if (!response.data.ok) {
              Logger.error(`SLACK: ${response.data.error}`);
              throw new BadRequestException(
                response.data.error || 'Failed to send message',
              );
            }
            return response.data;
          } catch (error) {
            Logger.error(`SLACK: ${error.response?.data.error}`);
            throw new BadRequestException(
              error.response?.data.error || 'Failed to send message',
            );
          }
        },
      },
    },
  ],
};
