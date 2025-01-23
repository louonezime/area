import {
  UnauthorizedException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { ServiceConfig } from '../service.types';

export const google: ServiceConfig = {
  name: 'google',
  color: '#EA4335',
  auth: {
    type: 'oauth2',
    authorization: (newRedirect: string | undefined) => {
      const redirectUrl =
        newRedirect || 'http://localhost:8080/service/google/oauth/callback';
      Logger.debug(`${redirectUrl} used as callback for Google.`);
      const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.labels',
        'https://www.googleapis.com/auth/youtube.download',
        'https://www.googleapis.com/auth/youtube.readonly',
      ].join(' ');
      if (!process.env.GOOGLE_SERVICE_CLIENT_ID)
        Logger.error("GOOGLE_SERVICE_CLIENT_ID can't be found");

      return `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent&client_id=${process.env.GOOGLE_SERVICE_CLIENT_ID}&scope=${scopes}&response_type=code&redirect_uri=${redirectUrl}`;
    },
    retrieveToken: async (code: string, newRedirect: string | undefined) => {
      const redirectUrl =
        newRedirect || 'http://localhost:8080/service/google/oauth/callback';
      Logger.debug(`redirectUrl set as ${redirectUrl}`);

      if (!process.env.GOOGLE_SERVICE_CLIENT_ID)
        Logger.error("GOOGLE_SERVICE_CLIENT_ID can't be found");
      if (!process.env.GOOGLE_SERVICE_CLIENT_SECRET)
        Logger.error("GOOGLE_SERVICE_CLIENT_SECRET can't be found");

      const params = new URLSearchParams();
      params.append('client_id', process.env.GOOGLE_SERVICE_CLIENT_ID!);
      params.append('client_secret', process.env.GOOGLE_SERVICE_CLIENT_SECRET!);
      params.append('code', code);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', redirectUrl);

      try {
        const response = await axios.post(
          'https://oauth2.googleapis.com/token',
          params,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        return {
          accessToken: response.data.access_token,
          refresh_token: response.data.refresh_token,
          expiresAt: null,
          tokenType: response.data.token_type,
          metadata: response.data,
        };
      } catch (error) {
        Logger.error(
          `Google token exchange failed: ${
            error.response?.data.error || error.message
          }`,
        );
        throw new BadRequestException(
          error.response?.data.error || 'Failed to exchange token',
        );
      }
    },
    refreshToken: async (refresh_token: string) => {
      const params = new URLSearchParams();
      params.append('client_id', process.env.GOOGLE_SERVICE_CLIENT_ID!);
      params.append('client_secret', process.env.GOOGLE_SERVICE_CLIENT_SECRET!);
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refresh_token);

      try {
        const response = await axios.post(
          'https://oauth2.googleapis.com/token',
          params,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        return {
          accessToken: response.data.access_token,
          refresh_token: response.data.refresh_token,
          expiresAt: null,
          tokenType: response.data.token_type,
        };
      } catch (error) {
        Logger.error(`GOOGLE: ${error.response?.data.error || error.message}`);
        throw new UnauthorizedException(
          error.response?.data.error || 'Failed to refresh token',
        );
      }
    },
  },
  actions: [
    {
      title: 'Fetch YouTube Channel Info',
      name: 'fetch_youtube_channel_info',
      description:
        "Retrieve information about the authenticated user's YouTube channel.",
      form: [],
      trigger: {
        request: async (authToken) => {
          try {
            const response = await axios.get(
              'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true',
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              },
            );
            return response.data;
          } catch (error) {
            Logger.error(
              `Error fetching YouTube channel info: ${
                error.response?.data.error || error.message
              }`,
            );
            throw new InternalServerErrorException(
              `Failed to fetch YouTube channel info: ${
                error.response?.data.error || error.message
              }`,
            );
          }
        },
        condition(currentState: any, previousState: any) {
          return false; // to do
        },
      },
    },
    {
      title: 'Check for New Emails',
      name: 'check_for_new_emails',
      description:
        "Retrieve unread emails from the authenticated user's Gmail account.",
      form: [],
      trigger: {
        request: async (authToken) => {
          try {
            const response = await axios.get(
              'https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread',
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              },
            );

            if (!response.data.messages) {
              return [];
            }

            const emailPromises = response.data.messages.map(
              async (message) => {
                const messageResponse = await axios.get(
                  `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${authToken}`,
                    },
                  },
                );
                return messageResponse.data;
              },
            );

            const emails = await Promise.all(emailPromises);
            return emails;
          } catch (error) {
            Logger.error(
              `Error fetching new emails: ${
                error.response?.data.error || error.message
              }`,
            );
            throw new InternalServerErrorException(
              `Failed to fetch new emails: ${
                error.response?.data.error || error.message
              }`,
            );
          }
        },
        condition(currentState: any, previousState: any) {
          return false; // to do
        },
      },
    },
  ],
  reactions: [
    {
      title: 'Update User Bio',
      name: 'update_user_bio',
      description: "Update the bio information in the Google user's profile",
      form: [
        {
          title: 'Bio',
          name: 'bio',
          value: 'string',
          hint: 'New bio content',
        },
      ],
      request: {
        request: async (authToken: string, data: any) => {
          const bio = {
            biographies: [
              {
                value: data.bio,
              },
            ],
          };
          try {
            const response = await axios.patch(
              'https://people.googleapis.com/v1/people/me?personFields=biographies',
              bio,
              {
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              },
            );
            return response.data;
          } catch (error) {
            Logger.error(
              `GOOGLE: ${error.response?.data.error || error.message}`,
            );
            throw new BadRequestException(
              error.response?.data.error || 'Failed to update user bio',
            );
          }
        },
      },
    },
    {
      title: 'Send Email',
      name: 'send_email',
      description:
        "Send an email using the authenticated user's Gmail account.",
      form: [
        {
          title: 'To',
          name: 'to',
          value: 'string',
          hint: 'Recipient email address',
        },
        {
          title: 'Subject',
          name: 'subject',
          value: 'string',
          hint: 'Email subject',
        },
        {
          title: 'Body',
          name: 'body',
          value: 'string',
          hint: 'Email body content',
        },
      ],
      request: {
        request: async (authToken, data) => {
          const email = [
            `To: ${data.to}`,
            `Subject: ${data.subject}`,
            '',
            data.body,
          ].join('\n');

          const encodedEmail = Buffer.from(email)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

          try {
            const response = await axios.post(
              'https://www.googleapis.com/gmail/v1/users/me/messages/send',
              {
                raw: encodedEmail,
              },
              {
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            return response.data;
          } catch (error) {
            Logger.error(
              `Error sending email: ${
                error.response?.data.error || error.message
              }`,
            );
            throw new InternalServerErrorException(
              `Failed to send email: ${
                error.response?.data.error || error.message
              }`,
            );
          }
        },
      },
    },
  ],
};
