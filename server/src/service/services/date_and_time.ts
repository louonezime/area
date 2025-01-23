import { InternalServerErrorException, Logger } from '@nestjs/common';
import { ServiceConfig } from '../service.types';
import axios from 'axios';

export const date_and_time: ServiceConfig = {
  name: 'date_and_time',
  color: '#FF69B3',
  auth: {
    type: null,
  },
  actions: [
    {
      title: 'Daily Trigger',
      name: 'daily_trigger',
      description: 'Trigger this action every day at a specific time',
      form: [
        {
          title: 'Hour(s)',
          name: 'hour',
          value: new Array(24).fill(0).map((_, i) => i),
          hint: null,
        },
        {
          title: 'Minute(s)',
          name: 'minutes',
          value: new Array(60).fill(0).map((_, i) => i),
          hint: null,
        },
        {
          title: 'Timezone',
          name: 'timezone',
          value: 'string',
          hint: "Timezone should be formatted like 'Continent/City' like Europe/Paris",
        },
      ],
      trigger: {
        request: async (authToken: string, data: any) => {
          try {
            const hour = parseInt(data.hour, 10);
            const minute = parseInt(data.minutes, 10);
            console.warn(data.timezone);
            const response = await axios.get(
              `https://timeapi.io/api/time/current/zone?timeZone=${data.timezone}`,
            );

            const res = response.data;
            if (res.hour == hour && res.minute == minute) {
              return { is_time: true };
            }
            return { is_time: false };
          } catch (error) {
            Logger.error(`DATE TIME: Error fetching time: ${error}`);
            throw new InternalServerErrorException(
              error.response?.data || 'Error fetching time',
            );
          }
        },
        condition: (current_state: object, previous_state: object): boolean => {
          return current_state['is_time'] && !previous_state['is_time'];
        },
      },
    },
    {
      title: 'Weekly Trigger',
      name: 'weekly_trigger',
      description: 'Trigger this action every week at a specific time',
      form: [
        {
          title: 'Hour(s)',
          name: 'hours',
          value: new Array(24).fill(0).map((_, i) => i),
          hint: null,
        },
        {
          title: 'Minute(s)',
          name: 'minutes',
          value: new Array(60).fill(0).map((_, i) => i),
          hint: null,
        },
        {
          title: 'Day of week',
          name: 'dayOfWeek',
          value: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          hint: null,
        },
        {
          title: 'Timezone',
          name: 'timezone',
          value: 'string',
          hint: null,
        },
      ],
      trigger: {
        request: async (authToken: string, data: any) => {
          try {
            const hour = parseInt(data.hours, 10);
            const minute = parseInt(data.minutes, 10);
            const response = await axios.get(
              `https://timeapi.io/api/time/current/zone?timeZone=${data.timezone}`,
            );

            const res = response.data;
            if (
              res.hour == hour &&
              res.minute == minute &&
              res.dayOfWeek == data.dayOfWeek
            ) {
              return { is_time: true };
            }
            return { is_time: false };
          } catch (error) {
            Logger.error(`DATE TIME: Error fetching time: ${error}`);
            throw new InternalServerErrorException(
              error.response?.data || 'Error fetching time',
            );
          }
        },
        condition: (current_state: object, previous_state: object): boolean => {
          return current_state['is_time'] && !previous_state['is_time'];
        },
      },
    },
  ],
  reactions: [],
};
