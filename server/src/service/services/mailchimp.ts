import { BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';
import { ServiceConfig } from '../service.types';

export const mailchimp: ServiceConfig = {
  name: 'mailchimp',
  color: '#FFE01B',
  auth: {
    type: 'oauth2',
    authorization: (redirectUrl: string | undefined) => {
      const encodedRedirectUrl = redirectUrl
        ? encodeURIComponent(redirectUrl)
        : encodeURIComponent(
            'http://localhost:8080/service/mailchimp/oauth/callback',
          );

      if (!process.env.MAILCHIMP_SERVICE_CLIENT_ID) {
        Logger.error("MAILCHIMP_SERVICE_CLIENT_ID can't be found");
      }

      return `https://login.mailchimp.com/oauth2/authorize?client_id=${process.env.MAILCHIMP_SERVICE_CLIENT_ID}&redirect_uri=${encodedRedirectUrl}&response_type=code`;
    },
    retrieveToken: async (code: string, redirectUrl: string | undefined) => {
      const url =
        redirectUrl || 'http://localhost:8080/service/mailchimp/oauth/callback';

      if (
        !process.env.MAILCHIMP_SERVICE_CLIENT_ID ||
        !process.env.MAILCHIMP_SERVICE_CLIENT_SECRET
      ) {
        Logger.error('Mailchimp client ID or secret is missing');
      }

      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', process.env.MAILCHIMP_SERVICE_CLIENT_ID!);
      params.append(
        'client_secret',
        process.env.MAILCHIMP_SERVICE_CLIENT_SECRET!,
      );
      params.append('code', code);
      params.append('redirect_uri', url);

      try {
        const response = await axios.post(
          'https://login.mailchimp.com/oauth2/token',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        return {
          accessToken: response.data.access_token,
          refresh_token: response.data.refresh_token || null,
          expiresAt: null,
          tokenType: response.data.token_type,
          metadata: response.data,
        };
      } catch (error) {
        Logger.error(
          `MAILCHIMP: ${error.response?.data.error || error.message}`,
        );
        throw new BadRequestException(
          error.response?.data.error || 'Failed to retrieve token',
        );
      }
    },
    refreshToken: async (refreshToken: string) => {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('client_id', process.env.MAILCHIMP_SERVICE_CLIENT_ID!);
      params.append(
        'client_secret',
        process.env.MAILCHIMP_SERVICE_CLIENT_SECRET!,
      );
      params.append('refresh_token', refreshToken);

      try {
        const response = await axios.post(
          'https://login.mailchimp.com/oauth2/token',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        return {
          accessToken: response.data.access_token,
          refresh_token: response.data.refresh_token || null,
          expiresAt: null,
          tokenType: response.data.token_type,
          metadata: response.data,
        };
      } catch (error) {
        Logger.error(
          `MAILCHIMP: ${error.response?.data.error || error.message}`,
        );
        throw new BadRequestException(
          error.response?.data.error || 'Failed to refresh token',
        );
      }
    },
  },
  actions: [],
  reactions: [
    {
      title: 'Create Campaign',
      name: 'create_campaign',
      description: 'Create a new email campaign in Mailchimp.',
      form: [
        {
          title: 'Campaign Title',
          name: 'title',
          value: 'string',
          hint: 'Title for the campaign',
        },
      ],
      request: {
        request: async (authToken: string, data: any) => {
          try {
            const response = await axios.post(
              'https://usX.api.mailchimp.com/3.0/campaigns',
              {
                type: 'regular',
                settings: {
                  title: data.title,
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            return response.data;
          } catch (error) {
            Logger.error(
              `MAILCHIMP: ${error.response?.data.detail || error.message}`,
            );
            throw new BadRequestException(
              error.response?.data.detail || 'Failed to create campaign',
            );
          }
        },
      },
    },
  ],
};
