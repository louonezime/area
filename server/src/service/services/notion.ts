import { BadRequestException, Logger } from '@nestjs/common';
import { ServiceConfig } from '../service.types';

export const notion: ServiceConfig = {
  name: 'notion',
  color: '#000000',
  auth: {
    type: 'oauth2',
    authorization: (newRedirect: string | undefined) => {
      const redirectUrl = !newRedirect
        ? encodeURIComponent(
            'http://localhost:8080/service/notion/oauth/callback',
          )
        : encodeURIComponent(newRedirect);
      Logger.debug(`${redirectUrl} used as callback for Notion.`);

      if (!process.env.NOTION_SERVICE_CLIENT_ID)
        Logger.error("NOTION_SERVICE_CLIENT_ID can't be found");
      return `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${process.env.NOTION_SERVICE_CLIENT_ID}&response_type=code&redirect_uri=${redirectUrl}`;
    },
    retrieveToken: async (code: string, newRedirect: string | undefined) => {
      const redirectUrl = !newRedirect
        ? encodeURI('http://localhost:8080/service/notion/oauth/callback')
        : encodeURI(newRedirect);
      Logger.debug(`redirectUrl set as ${redirectUrl}`);

      if (!process.env.NOTION_SERVICE_CLIENT_ID)
        Logger.error("NOTION_SERVICE_CLIENT_ID can't be found");
      if (!process.env.NOTION_SERVICE_CLIENT_SECRET)
        Logger.error("NOTION_SERVICE_CLIENT_SECRET can't be found");
      const encoded = Buffer.from(
        `${process.env.NOTION_SERVICE_CLIENT_ID}:${process.env.NOTION_SERVICE_CLIENT_SECRET}`,
      ).toString('base64');

      const response = await fetch('https://api.notion.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${encoded}`,
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUrl,
        }),
      });

      const res = await response.json();
      if (!response.ok) {
        Logger.error(`NOTION: ${res.error_description}`);
        throw new BadRequestException(
          res.error_description || 'Failed to exchange token',
        );
      }
      return {
        accessToken: res.access_token,
        refresh_token: res.refresh_token,
        expiresAt: null,
        tokenType: res.token_type,
        metadata: res,
      };
    },
    refreshToken: null,
  },
  actions: [
    {
      title: 'New User',
      name: 'new_user',
      description: 'A new user is added in the workspace',
      form: [],
      trigger: {
        request: async (authToken: string) => {
          const response = await fetch('https://api.notion.com/v1/users', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
              'Notion-Version': '2022-06-28',
            },
          });

          const res = await response.json();
          if (!response.ok) {
            Logger.error(`NOTION: ${res.error_description}`);
            throw new BadRequestException(
              res.error_description || 'Failed to list users from notion',
            );
          }
          return res.results.map((user: any) => user.id);
        },
        condition: (current_state: any, previous_state: any): boolean => {
          current_state = current_state as Array<string>;
          previous_state = previous_state as Array<string>;
          return current_state.some(
            (user: string) => !previous_state.includes(user),
          );
        },
      },
    },
  ],
  reactions: [
    {
      title: 'Create comment on page',
      name: 'create_comment_page',
      description: 'Create a comment on a database',
      form: [
        {
          title: 'Field Content',
          name: 'pageContent',
          value: 'string',
          hint: 'Content of the comment',
        },
        {
          title: 'Field Page Id',
          name: 'pageId',
          value: 'string',
          hint: 'Id of the page',
        },
      ],
      request: {
        request: async (authToken: string, data: any) => {
          const payload = {
            parent: {
              page_id: data.pageId,
            },
            rich_text: [
              {
                text: {
                  content: data.pageContent,
                },
              },
            ],
          };
          const response = await fetch('https://api.notion.com/v1/comments', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
              'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify(payload),
          });

          const res = await response.json();
          if (!response.ok) {
            Logger.error(`NOTION: ${response} ${res}`);
            throw new BadRequestException(
              res.error_description || 'Failed to reach notion for db creation',
            );
          }
          return res.data;
        },
      },
    },
  ],
};
