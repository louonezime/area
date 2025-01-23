import { BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';
import { ServiceConfig } from '../service.types';

export const pocket: ServiceConfig = {
  name: 'pocket',
  color: '#EF4056',
  auth: {
    type: 'apiKey',
    testValidity: async (authToken: string) => {
      try {
        const response = await axios.post(
          'https://getpocket.com/v3/get',
          {
            consumer_key: process.env.POCKET_CONSUMER_KEY,
            access_token: authToken,
          },
          {
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
              Authorization: `Bearer ${authToken}`,
            },
          },
        );

        return response.data;
      } catch (error) {
        Logger.error(`POCKET: ${error.response?.data.error}`);
        throw new BadRequestException(
          error.response?.data.error || 'Failed to validate API Key',
        );
      }
    },
    hint: "To get your Pocket API key, go to the developer's console on Pocket, create a new app, and use the key for API access.",
  },
  actions: [],
  reactions: [],
};
