import { BadRequestException, Logger } from '@nestjs/common';
import { ServiceConfig } from '../service.types';
import axios from 'axios';

export const dropbox: ServiceConfig = {
  name: 'dropbox',
  color: '#007EE5',
  auth: {
    type: 'oauth2',
    authorization: (redirectUrl: string | undefined) => {
      const url =
        redirectUrl || 'http://localhost:8080/service/dropbox/oauth/callback';

      if (!process.env.DROPBOX_SERVICE_CLIENT_ID)
        Logger.error("DROPBOX_SERVICE_CLIENT_ID can't be found");

      return `https://www.dropbox.com/oauth2/authorize?client_id=${process.env.DROPBOX_SERVICE_CLIENT_ID}&response_type=code&redirect_uri=${url}&token_access_type=offline`;
    },
    retrieveToken: async (code: string, redirectUrl: string | undefined) => {
      const url =
        redirectUrl || 'http://localhost:8080/service/dropbox/oauth/callback';

      Logger.debug(`${url} used as callback for Notion.`);

      if (!process.env.DROPBOX_SERVICE_CLIENT_ID)
        Logger.error("DROPBOX_SERVICE_CLIENT_ID can't be found");
      if (!process.env.DROPBOX_SERVICE_CLIENT_SECRET)
        Logger.error("DROPBOX_SERVICE_CLIENT_SECRET can't be found");

      try {
        const response = await axios.post(
          'https://api.dropboxapi.com/oauth2/token',
          new URLSearchParams({
            client_id: process.env.DROPBOX_SERVICE_CLIENT_ID!,
            client_secret: process.env.DROPBOX_SERVICE_CLIENT_SECRET!,
            code: code,
            redirect_uri: url,
            grant_type: 'authorization_code',
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        const res = response.data;
        return {
          accessToken: res.access_token,
          refresh_token: res.refresh_token || null,
          expiresAt: null,
          tokenType: res.token_type,
          metadata: res,
        };
      } catch (error) {
        Logger.error(
          `DROPBOX: ${error.response?.data.error_description || error.message}`,
        );
        throw new BadRequestException(
          error.response?.data.error_description || 'Failed to exchange token',
        );
      }
    },
    refreshToken: async (refreshToken: string) => {
      try {
        const response = await axios.post(
          'https://api.dropboxapi.com/oauth2/token',
          new URLSearchParams({
            client_id: process.env.DROPBOX_SERVICE_CLIENT_ID!,
            client_secret: process.env.DROPBOX_SERVICE_CLIENT_SECRET!,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        const res = response.data;
        return {
          accessToken: res.access_token,
          refresh_token: res.refresh_token || null,
          expiresAt: null,
          tokenType: res.token_type,
          metadata: res,
        };
      } catch (error) {
        Logger.error(
          `DROPBOX: ${error.response?.data.error_description || error.message}`,
        );
        throw new BadRequestException(
          error.response?.data.error_description || 'Failed to refresh token',
        );
      }
    },
  },
  actions: [
    {
      title: 'New Files',
      name: 'new_files',
      description: 'Triggers when a new file is added within a folder',
      form: [
        {
          title: 'Folder Path',
          name: 'folderPath',
          value: 'string',
          hint: 'Path of the Dropbox folder to list files from (e.g., "/")',
        },
      ],
      trigger: {
        request: async (authToken, data) => {
          try {
            const response = await axios.post(
              'https://api.dropboxapi.com/2/files/list_folder',
              {
                path: data.folderPath || '',
              },
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            return response.data.entries.map((item: any) => item.id);
          } catch (error) {
            Logger.error(
              `DROPBOX: ${error.response?.data.error_summary || error.message}`,
            );
            throw new BadRequestException(
              error.response?.data.error_summary || 'Failed to list files',
            );
          }
        },
        condition: (currentState: any, previousState: any) => {
          currentState = currentState as Array<string>;
          previousState = previousState as Array<string>;
          return currentState.some(
            (item: string) => !previousState.includes(item),
          );
        },
      },
    },
  ],
  reactions: [
    {
      title: 'Upload File', // to test
      name: 'upload_file',
      description: 'Upload a file to Dropbox',
      form: [
        {
          title: 'Folder Path',
          name: 'folderPath',
          value: 'string',
          hint: 'Path to upload the file (e.g., "/")',
        },
        {
          title: 'File Content',
          name: 'fileContent',
          value: 'string',
          hint: 'The file content to upload',
        },
      ],
      request: {
        request: async (authToken, data) => {
          try {
            const response = await axios.post(
              'https://content.dropboxapi.com/2/files/upload',
              data.fileContent,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Dropbox-API-Arg': JSON.stringify({
                    path: `${data.folderPath || 'areaFile.txt'}`,
                    mode: 'add',
                    autorename: true,
                    mute: false,
                  }),
                  'Content-Type': 'application/octet-stream',
                },
              },
            );

            return response.data;
          } catch (error) {
            Logger.error(
              `DROPBOX: ${error.response?.data.error_summary || error.message}`,
            );
            throw new BadRequestException(
              error.response?.data.error_summary || 'Failed to upload file',
            );
          }
        },
      },
    },
  ],
};
