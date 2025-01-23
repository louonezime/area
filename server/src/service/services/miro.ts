import { BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';
import { ServiceConfig } from '../service.types';

export const miro: ServiceConfig = {
  name: 'miro',
  color: '#ffcd00',
  auth: {
    type: 'oauth2',
    authorization: (redirectUrl: string | undefined) => {
      const url =
        redirectUrl || 'http://localhost:8080/service/miro/oauth/callback';

      if (!process.env.MIRO_SERVICE_CLIENT_ID)
        Logger.error("MIRO_SERVICE_CLIENT_ID can't be found");

      return `https://miro.com/oauth/authorize?response_type=code&client_id=${
        process.env.MIRO_SERVICE_CLIENT_ID
      }&redirect_uri=${encodeURIComponent(url)}`;
    },
    retrieveToken: async (code: string, redirectUrl: string | undefined) => {
      const url =
        redirectUrl || 'http://localhost:8080/service/miro/oauth/callback';

      if (!process.env.MIRO_SERVICE_CLIENT_ID)
        Logger.error("MIRO_SERVICE_CLIENT_ID can't be found");
      if (!process.env.MIRO_SERVICE_CLIENT_SECRET)
        Logger.error("MIRO_SERVICE_CLIENT_SECRET can't be found");

      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', process.env.MIRO_SERVICE_CLIENT_ID!);
      params.append('client_secret', process.env.MIRO_SERVICE_CLIENT_SECRET!);
      params.append('code', code);
      params.append('redirect_uri', url);

      try {
        const response = await axios.post(
          'https://api.miro.com/v1/oauth/token',
          params,
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
          `MIRO: ${error.response?.data.code} ${error.response?.data.message}`,
        );
        throw new BadRequestException(
          error.response?.data.message || 'Failed to exchange token',
        );
      }
    },
    refreshToken: async (refreshToken: string) => {
      const params = new URLSearchParams();
      params.append('client_id', process.env.MIRO_SERVICE_CLIENT_ID!);
      params.append('client_secret', process.env.MIRO_SERVICE_CLIENT_SECRET!);
      params.append('refresh_token', refreshToken);
      params.append('grant_type', 'refresh_token');

      try {
        const response = await axios.post(
          'https://api.miro.com/v1/oauth/token',
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
          `MIRO: ${error.response?.data.code} ${error.response?.data.message}`,
        );
        throw new BadRequestException(
          error.response?.data.message || 'Failed to refresh token',
        );
      }
    },
  },
  actions: [
    {
      title: 'List Boards',
      name: 'list_boards',
      description: 'Retrieve a list of boards for the authenticated user.',
      form: [],
      trigger: {
        request: async (authToken) => {
          try {
            const response = await axios.get('https://api.miro.com/v2/boards', {
              headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: 'application/json',
              },
            });

            return response.data.data;
          } catch (error) {
            Logger.error(`MIRO: ${error.response?.data.message}`);
            throw new BadRequestException(
              error.response?.data.message || 'Failed to fetch boards',
            );
          }
        },
        condition(currentState: any, previousState: any) {
          return currentState.length > previousState.length;
        },
      },
    },
  ],
  reactions: [
    {
      title: 'Create Board',
      name: 'create_board',
      description: 'Create a new board in Miro',
      form: [
        {
          title: 'Board Name',
          name: 'name',
          value: 'string',
          hint: 'Enter the name of the board',
        },
      ],
      request: {
        request: async (authToken: string, data: any) => {
          try {
            const response = await axios.post(
              'https://api.miro.com/v2/boards',
              {
                name: data.name,
              },
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            return response.data.data;
          } catch (error) {
            Logger.error(`MIRO: ${error.response?.data.message}`);
            throw new BadRequestException(
              error.response?.data.message || 'Failed to create board',
            );
          }
        },
      },
    },
    {
      title: 'Create Sticky Note',
      name: 'create_sticky_note',
      description: 'Add a sticky note to a Miro board.',
      form: [
        {
          title: 'Board ID',
          name: 'boardId',
          value: 'string',
          hint: 'The ID is present on the URL of the board after /board',
        },
        {
          title: 'Content',
          name: 'content',
          value: 'string',
          hint: 'Content of the sticky note',
        },
      ],
      request: {
        request: async (authToken, data) => {
          try {
            const response = await axios.post(
              `https://api.miro.com/v2/boards/${data.boardId}/sticky_notes`,
              {
                data: { content: data.content },
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
            Logger.error(`MIRO: ${error.response?.data.message}`);
            throw new BadRequestException(
              error.response?.data.message || 'Failed to create sticky note',
            );
          }
        },
      },
    },
  ],
};
