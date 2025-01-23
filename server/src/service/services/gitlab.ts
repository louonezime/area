import {
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ServiceConfig } from '../service.types';
import axios from 'axios';

export const gitlab: ServiceConfig = {
  name: 'gitlab',
  color: '#FC6D21',
  auth: {
    type: 'oauth2',
    authorization: (newRedirect: string | undefined) => {
      const redirectUrl =
        newRedirect || 'http://localhost:8080/service/gitlab/oauth/callback';
      Logger.debug(`${redirectUrl} used as callback for Gitlab.`);

      if (!process.env.GITLAB_SERVICE_CLIENT_ID) {
        Logger.error("GITLAB_SERVICE_CLIENT_ID can't be found");
      }
      const scopes = encodeURIComponent(
        'api read_api read_user read_repository write_repository',
      );
      return `https://gitlab.com/oauth/authorize?client_id=${process.env.GITLAB_SERVICE_CLIENT_ID}&scope=${scopes}&response_type=code&redirect_uri=${redirectUrl}`;
    },
    retrieveToken: async (code: string, newRedirect: string | undefined) => {
      const redirectUrl =
        newRedirect || 'http://localhost:8080/service/gitlab/oauth/callback';
      Logger.debug(`redirect URL set as ${redirectUrl}`);

      if (!process.env.GITLAB_SERVICE_CLIENT_ID) {
        Logger.error("GITLAB_SERVICE_CLIENT_ID can't be found");
      }
      if (!process.env.GITLAB_SERVICE_CLIENT_SECRET) {
        Logger.error("GITLAB_SERVICE_CLIENT_SECRET can't be found");
      }

      const params = new URLSearchParams();
      params.append('client_id', process.env.GITLAB_SERVICE_CLIENT_ID!);
      params.append('client_secret', process.env.GITLAB_SERVICE_CLIENT_SECRET!);
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', redirectUrl);

      try {
        const response = await axios.post(
          'https://gitlab.com/oauth/token',
          params.toString(),
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
          `Gitlab token exchange failed: ${
            error.response?.data.error_description || error.message
          }`,
        );
        throw new BadRequestException(
          error.response?.data.error_description || 'Failed to exchange token',
        );
      }
    },
    refreshToken: async (refresh_token: string) => {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refresh_token);
      params.append('client_id', process.env.GITLAB_SERVICE_CLIENT_ID!);
      params.append('client_secret', process.env.GITLAB_SERVICE_CLIENT_SECRET!);

      try {
        const response = await axios.post(
          'https://gitlab.com/oauth/token',
          params.toString(),
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
        Logger.error(
          `GITLAB: ${error.response?.data.error_description || error.message}`,
        );
        throw new UnauthorizedException(
          error.response?.data.error_description || 'Failed to refresh token',
        );
      }
    },
  },
  actions: [
    {
      title: 'New Issue',
      name: 'new_issue',
      description: 'Triggered when a new issue is created in the repository',
      form: [
        {
          title: 'Project ID',
          name: 'project_id',
          value: 'string',
          hint: "On the top right of your repository, select the 'More Actions' icon and click 'Copy project ID:XXXXXXXX'",
        },
      ],
      trigger: {
        request: async (authToken: string, data: { project_id: string }) => {
          try {
            const response = await axios.get(
              `https://gitlab.com/api/v4/projects/${data.project_id}/issues`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              },
            );

            return response.data.map((issue: any) => issue.id);
          } catch (error) {
            Logger.error(`GITLAB: Failed to fetch issues`);
            throw new InternalServerErrorException(
              error.response?.data.message || 'Failed to fetch issues',
            );
          }
        },
        condition: (currentState: any, previous_state: any): boolean => {
          currentState = currentState as Array<string>;
          previous_state = previous_state as Array<string>;
          return currentState.some(
            (issue: string) => !previous_state.includes(issue),
          );
        },
      },
    },
    {
      title: 'New Merge Request',
      name: 'new_merge_request',
      description:
        'Triggered when a new merge request is created in the repository',
      form: [
        {
          title: 'Project ID',
          name: 'project_id',
          value: 'string',
          hint: "On the top right of your repository, select the 'More Actions' icon and click 'Copy project ID:XXXXXXXX'",
        },
      ],
      trigger: {
        request: async (authToken: string, data: { project_id: string }) => {
          try {
            const response = await axios.get(
              `https://gitlab.com/api/v4/projects/${data.project_id}/merge_requests`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              },
            );

            return response.data.map((mergeRequest: any) => mergeRequest.id);
          } catch (error) {
            Logger.error(`GITLAB: Failed to fetch merge requests`);
            throw new InternalServerErrorException(
              error.response?.data.message || 'Failed to fetch merge requests',
            );
          }
        },
        condition: (currentState: any, previousState: any): boolean => {
          currentState = currentState as Array<string>;
          previousState = previousState as Array<string>;
          return currentState.some(
            (mergeRequest: string) => !previousState.includes(mergeRequest),
          );
        },
      },
    },
  ],
  reactions: [
    {
      title: 'Create an Issue',
      name: 'create_issue',
      description: 'Create a new issue in a specified repository',
      form: [
        {
          title: 'Project ID',
          name: 'project_id',
          value: 'string',
          hint: "On the top right of your repository, select the 'More Actions' icon and click 'Copy project ID:XXXXXXXX'",
        },
        {
          title: 'Title',
          name: 'title',
          value: 'string',
          hint: null,
        },
        {
          title: 'Description',
          name: 'description',
          value: 'string',
          hint: null,
        },
      ],
      request: {
        request: async (
          authToken: string,
          data: { project_id: string; title: string; description: string },
        ) => {
          try {
            const response = await axios.post(
              `https://gitlab.com/api/v4/projects/${data.project_id}/issues`,
              {
                title: data.title,
                description: data.description,
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
            Logger.error(`GITLAB: Failed to create issue`);
            throw new InternalServerErrorException(
              error.response?.data.message || 'Failed to create issue',
            );
          }
        },
      },
    },
    {
      title: 'Create a Merge Request',
      name: 'create_merge_request',
      description: 'Create a new merge request in a specified repository',
      form: [
        {
          title: 'Project ID',
          name: 'project_id',
          value: 'string',
          hint: "On the top right of your repository, select the 'More Actions' icon and click 'Copy project ID:XXXXXXXX'",
        },
        {
          title: 'Source Branch',
          name: 'source_branch',
          value: 'string',
          hint: 'Branch from which you want to merge from',
        },
        {
          title: 'Target Branch',
          name: 'target_branch',
          value: 'string',
          hint: 'Branch from which you want to merge to',
        },
        {
          title: 'Title of Merge Request',
          name: 'title',
          value: 'string',
          hint: null,
        },
      ],
      request: {
        request: async (
          authToken: string,
          data: {
            project_id: string;
            source_branch: string;
            target_branch: string;
            title: string;
          },
        ) => {
          try {
            const response = await axios.post(
              `https://gitlab.com/api/v4/projects/${data.project_id}/merge_requests`,
              {
                source_branch: data.source_branch,
                target_branch: data.target_branch,
                title: data.title,
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
            Logger.error(`GITLAB: Failed to create merge request`);
            throw new InternalServerErrorException(
              error.response?.data.message || 'Failed to create merge request',
            );
          }
        },
      },
    },
  ],
};
