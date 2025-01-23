import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ServiceConfig } from '../service.types';
import axios from 'axios';

export const github: ServiceConfig = {
  name: 'github',
  color: '#404040',
  auth: {
    type: 'apiKey',
    testValidity: async (authToken: string) => {
      try {
        const response = await axios.get('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });
        return response.data;
      } catch (error) {
        Logger.error(
          `GITHUB: ${error.response?.data.message || error.message}`,
        );
        throw new BadRequestException(
          error.response?.data.message || 'Failed to validate Github API Key',
        );
      }
    },
    hint: "Log in and go to your 'Profile Settings' from the navigation menu. Then, go to 'Developer settings' and generate your token through 'Personal Access Token'",
  },
  actions: [
    {
      title: 'New follower',
      name: 'new_follower',
      description: 'New follower on github account',
      form: [],
      trigger: {
        request: async (authToken: string) => {
          try {
            const response = await axios.get(
              'https://api.github.com/user/followers',
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  Accept: 'application/vnd.github+json',
                  'Content-Type': 'application/json',
                  'X-GitHub-Api-Version': '2022-11-28',
                },
              },
            );
            return response.data.map((user: any) => user.id);
          } catch (error) {
            throw new UnauthorizedException('Failed to join organisation');
          }
        },
        condition: (current_state, previous_state): boolean => {
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
      title: 'Update bio',
      name: 'update_bio',
      description: 'Update the bio message',
      form: [
        {
          title: 'Message',
          name: 'message',
          value: 'string',
          hint: 'The message to put in biography',
        },
      ],
      request: {
        request: async (authToken: string, data: any) => {
          const bioData = {
            bio: data.message,
          };

          try {
            const response = await axios.patch(
              'https://api.github.com/user',
              bioData,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  Accept: 'application/vnd.github+json',
                  'Content-Type': 'application/json',
                  'X-GitHub-Api-Version': '2022-11-28',
                },
              },
            );
            return response.data;
          } catch (error) {
            Logger.error(
              `GITHUB: ${error.response?.data.message || error.message}`,
            );
            throw new InternalServerErrorException(
              'Failed to update bio through github API',
            );
          }
        },
      },
    },
  ],
};
