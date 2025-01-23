import { BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';
import { ServiceConfig } from '../service.types';

export const ratp: ServiceConfig = {
  name: 'ratp',
  color: '#003366',
  auth: {
    type: null,
  },
  actions: [
    {
      title: 'Get Traffic Status',
      name: 'get_traffic_status',
      description:
        'Retrieve real-time traffic status for a specific line or station.',
      form: [
        {
          title: 'Line Type',
          name: 'lineType',
          value: ['metros', 'rers', 'tramways'],
          hint: 'e.g., metros, rers, tramways',
        },
        {
          title: 'Line Number',
          name: 'lineNumber',
          value: 'string',
          hint: 'The number of the line (e.g., "1" for Metro 1)',
        },
      ],
      trigger: {
        request: async (authToken: string, data: any) => {
          const { lineType, lineNumber } = data;
          try {
            const response = await axios.get(
              `https://api-ratp.pierre-grimaud.fr/v4/traffic/${lineType}/${lineNumber}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              },
            );

            return response.data.result.title;
          } catch (error) {
            Logger.error(`RATP: ${error.response?.data.result.message}`);
            throw new BadRequestException(
              error.response?.data.message || 'Failed to fetch traffic status',
            );
          }
        },
        condition: (currentState: any, previousState: any) => {
          return (
            currentState !== 'Trafic normal' &&
            previousState === 'Trafic normal'
          );
        },
      },
    },
  ],
  reactions: [],
};
