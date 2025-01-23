import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { ServiceConfig } from '../service.types';

export const twitch: ServiceConfig = {
  name: 'twitch',
  color: '#A344FC',
  auth: {
    type: 'oauth2',
    authorization: (newRedirect: string | undefined) => {
      const redirectUrl =
        newRedirect || 'http://localhost:8080/service/twitch/oauth/callback';
      Logger.debug(`${redirectUrl} used as callback for Twitch.`);
      const scopes = encodeURIComponent('chat:edit chat:read user:write:chat');

      if (!process.env.TWITCH_SERVICE_CLIENT_ID) {
        Logger.error("TWITCH_SERVICE_CLIENT_ID can't be found");
      }
      return `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${process.env.TWITCH_SERVICE_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=${scopes}`;
    },
    retrieveToken: async (code: string, newRedirect: string | undefined) => {
      const redirectUrl = !newRedirect
        ? encodeURI('http://localhost:8080/service/twitch/oauth/callback')
        : encodeURI(newRedirect);
      Logger.debug(`redirectUrl set as ${redirectUrl}`);

      if (!process.env.TWITCH_SERVICE_CLIENT_ID) {
        Logger.error("TWITCH_SERVICE_CLIENT_ID can't be found");
      }
      if (!process.env.TWITCH_SERVICE_CLIENT_SECRET) {
        Logger.error("TWITCH_SERVICE_CLIENT_SECRET can't be found");
      }

      const params = new URLSearchParams();
      params.append('client_id', process.env.TWITCH_SERVICE_CLIENT_ID!);
      params.append('client_secret', process.env.TWITCH_SERVICE_CLIENT_SECRET!);
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', redirectUrl);

      try {
        const response = await axios.post(
          'https://id.twitch.tv/oauth2/token',
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
          `TWITCH: ${error.response?.data?.message || error.message}`,
        );
        throw new BadRequestException(
          error.response?.data?.message || 'Failed to exchange token',
        );
      }
    },
    refreshToken: async (refresh_token: string) => {
      const params = new URLSearchParams();
      params.append('client_id', process.env.TWITCH_SERVICE_CLIENT_ID!);
      params.append('client_secret', process.env.TWITCH_SERVICE_CLIENT_SECRET!);
      params.append('refresh_token', refresh_token);
      params.append('grant_type', 'refresh_token');

      try {
        const response = await axios.post(
          'https://id.twitch.tv/oauth2/token',
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
        };
      } catch (error) {
        Logger.error(
          `TWITCH: ${error.response?.data?.message || error.message}`,
        );
        throw new BadRequestException(
          error.response?.data?.message || 'Failed to refresh token',
        );
      }
    },
  },
  actions: [
    {
      title: 'New Follower',
      name: 'new_follower',
      description: 'Triggered when the channel gains a new follower',
      form: [],
      trigger: {
        request: async (authToken: string) => {
          try {
            const responseUser = await axios.get(
              'https://api.twitch.tv/helix/users',
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Client-ID': process.env.TWITCH_SERVICE_CLIENT_ID!,
                  'Content-Type': 'application/json',
                },
              },
            );
            const userId = responseUser.data.data[0].id;

            const response = await axios.get(
              `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Client-ID': process.env.TWITCH_SERVICE_CLIENT_ID!,
                  'Content-Type': 'application/json',
                },
              },
            );

            return { total: response.data.total, users: response.data.data };
          } catch (error) {
            Logger.error(`TWITCH: Failed to fetch new followers`);
            throw new InternalServerErrorException(
              error.response?.data?.message || 'Failed to fetch new followers',
            );
          }
        },
        condition: (current_state: object, previous_state: object): boolean => {
          return current_state['total'] > previous_state['total'];
        },
      },
    },
    {
      title: 'New Follower for channel',
      name: 'new_follower_for_channel',
      description: 'Triggered when the selected channel gains a new follower',
      form: [
        {
          title: 'Username',
          name: 'username',
          value: 'string',
          hint: "Username that you want to 'monitor/ observe'",
        },
      ],
      trigger: {
        request: async (authToken: string, data: { username: string }) => {
          try {
            const loginResponse = await axios.get(
              `https://api.twitch.tv/helix/users?login=${data.username}`,
              {
                headers: {
                  'Client-ID': process.env.TWITCH_SERVICE_CLIENT_ID!,
                  Authorization: `Bearer ${authToken}`,
                },
              },
            );
            const userIdByUsername = loginResponse.data.data[0].id;
            Logger.debug(`Searching user: ${userIdByUsername}`);

            const response = await axios.get(
              `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userIdByUsername}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Client-ID': process.env.TWITCH_SERVICE_CLIENT_ID!,
                },
              },
            );

            return { total: response.data.total, users: response.data.data };
          } catch (error) {
            Logger.error('Failed to fetch new followers from Twitch');
            throw new InternalServerErrorException(
              error.response?.data?.message || 'Failed to fetch new followers',
            );
          }
        },
        condition: (current_state: object, previous_state: object): boolean => {
          return current_state['total'] > previous_state['total'];
        },
      },
    },
    {
      title: 'Stream Goes Live', // TODO
      name: 'stream_goes_live',
      description: 'Triggered when the stream goes live',
      form: [
        {
          title: 'Username',
          name: 'username',
          value: 'string',
          hint: "Username that you want to 'monitor/ observe'",
        },
      ],
      trigger: {
        request: async (authToken: string, data: { username: string }) => {
          try {
            const loginResponse = await axios.get(
              `https://api.twitch.tv/helix/users?login=${data.username}`,
              {
                headers: {
                  'Client-ID': process.env.TWITCH_SERVICE_CLIENT_ID!,
                  Authorization: `Bearer ${authToken}`,
                },
              },
            );
            const userIdByUsername = loginResponse.data.data[0].id;
            Logger.debug(`Searching user: ${userIdByUsername}`);

            const response = await axios.get(
              `https://api.twitch.tv/helix/streams?user_id=${userIdByUsername}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Client-ID': process.env.TWITCH_SERVICE_CLIENT_ID!,
                },
              },
            );
            if (!response.data.data[0]) return null;
            return response.data.data[0].type || null;
          } catch (error) {
            Logger.error('TWITCH: Failed to fetch stream status');
            throw new InternalServerErrorException(
              error.response?.data?.message || 'Failed to fetch stream status',
            );
          }
        },
        condition: (current_state: any, previous_state: any): boolean => {
          return (
            current_state === 'live' &&
            (previous_state !== 'live' || !previous_state)
          );
        },
      },
    },
  ],
  reactions: [
    {
      title: 'Send Chat Message',
      name: 'send_chat_message',
      description: 'Send a message to your Twitch chat',
      form: [
        {
          title: 'Content',
          name: 'content',
          value: 'string',
          hint: 'Body of message you want to send',
        },
      ],
      request: {
        request: async (authToken: string, data: any) => {
          try {
            const responseUser = await axios.get(
              'https://api.twitch.tv/helix/users',
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Client-ID': process.env.TWITCH_SERVICE_CLIENT_ID!,
                  'Content-Type': 'application/json',
                },
              },
            );
            const userId = responseUser.data.data[0].id;

            const payload = {
              message: data.content,
            };
            const response = await axios.post(
              `https://api.twitch.tv/helix/chat/messages?broadcaster_id=${userId}&sender_id=${userId}`,
              payload,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Client-ID': process.env.TWITCH_SERVICE_CLIENT_ID!,
                  'Content-Type': 'application/json',
                },
              },
            );

            return response.data;
          } catch (error) {
            Logger.error('TWITCH: Failed to send chat message');
            throw new InternalServerErrorException(
              error.response?.data?.message || 'Failed to send chat message',
            );
          }
        },
      },
    },
    {
      title: 'Send Chat Message to User',
      name: 'send_chat_message_to_username',
      description: "Send a message to a user's Twitch chat",
      form: [
        {
          title: 'Username',
          name: 'username',
          value: 'string',
          hint: 'Username that you want to send the chat to',
        },
        {
          title: 'Content',
          name: 'content',
          value: 'string',
          hint: 'Body of message you want to send',
        },
      ],
      request: {
        request: async (authToken: string, data: any) => {
          try {
            const responseUser = await axios.get(
              'https://api.twitch.tv/helix/users',
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Client-ID': process.env.TWITCH_SERVICE_CLIENT_ID!,
                  'Content-Type': 'application/json',
                },
              },
            );
            const userId = responseUser.data.data[0].id;

            const loginResponse = await axios.get(
              `https://api.twitch.tv/helix/users?login=${data.username}`,
              {
                headers: {
                  'Client-ID': process.env.TWITCH_SERVICE_CLIENT_ID!,
                  Authorization: `Bearer ${authToken}`,
                },
              },
            );
            const userIdByUsername = loginResponse.data.data[0].id;
            Logger.debug(`Searching user: ${userIdByUsername}`);

            const payload = {
              message: data.content,
            };
            const response = await axios.post(
              `https://api.twitch.tv/helix/chat/messages?broadcaster_id=${userIdByUsername}&sender_id=${userId}`,
              payload,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Client-ID': process.env.TWITCH_SERVICE_CLIENT_ID!,
                  'Content-Type': 'application/json',
                },
              },
            );

            return response.data;
          } catch (error) {
            Logger.error('TWITCH: Failed to send chat message');
            throw new InternalServerErrorException(
              error.response?.data?.message || 'Failed to send chat message',
            );
          }
        },
      },
    },
  ],
};
