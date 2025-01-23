import { BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';
import { ServiceConfig } from '../service.types';

export const ticketmaster: ServiceConfig = {
  name: 'ticketmaster',
  color: '#009CDE',
  auth: {
    type: null,
  },
  actions: [
    {
      title: 'Search Events by Keyword',
      name: 'search_events_by_keyword',
      description: 'Search for events by a keyword.',
      form: [
        {
          title: 'Keyword',
          name: 'keyword',
          value: 'string',
          hint: "Search keyword for the event (e.g., an artist's name like 'Tyler', a team, or a show)",
        },
      ],
      trigger: {
        request: async (authToken, data) => {
          if (!process.env.TICKET_MASTER_API_KEY) {
            Logger.error('TICKET_MASTER_API_KEY not found');
            throw new BadRequestException('API key not found');
          }

          const url = 'https://app.ticketmaster.com/discovery/v2/events.json';
          const params: { [key: string]: string } = {
            apikey: process.env.TICKET_MASTER_API_KEY!,
            keyword: data.keyword,
            sort: 'date,desc',
          };

          try {
            const response = await axios.get(url, { params });
            return response.data._embedded
              ? response.data._embedded.events
              : [];
          } catch (error) {
            Logger.error(
              `TICKETMASTER: ${error.response?.data?.error || error.message}`,
            );
            throw new BadRequestException(
              error.response?.data?.error || 'Failed to fetch events',
            );
          }
        },
        condition: (currentState, previousState) => {
          return currentState[0] !== previousState[0];
        },
      },
    },
    {
      title: 'Search Events by City',
      name: 'search_events_by_city',
      description: 'Search for events in a specific city.',
      form: [
        {
          title: 'City',
          name: 'city',
          value: 'string',
          hint: 'City to filter events by location',
        },
      ],
      trigger: {
        request: async (authToken, data) => {
          if (!process.env.TICKET_MASTER_API_KEY) {
            Logger.error('TICKET_MASTER_API_KEY not found');
            throw new BadRequestException('API key not found');
          }

          const url = 'https://app.ticketmaster.com/discovery/v2/events.json';
          const params: { [key: string]: string } = {
            apikey: process.env.TICKET_MASTER_API_KEY!,
            city: data.city,
            sort: 'date,desc',
          };

          try {
            const response = await axios.get(url, { params });
            return response.data._embedded
              ? response.data._embedded.events
              : [];
          } catch (error) {
            Logger.error(
              `TICKETMASTER: ${error.response?.data?.error || error.message}`,
            );
            throw new BadRequestException(
              error.response?.data?.error || 'Failed to fetch events',
            );
          }
        },
        condition: (currentState, previousState) => {
          return currentState[0] !== previousState[0];
        },
      },
    },
    {
      title: 'Search Events by Start Date',
      name: 'search_events_by_start_date',
      description: 'Search for events starting from a specific date.',
      form: [
        {
          title: 'Start Date',
          name: 'startDate',
          value: 'string',
          hint: 'ISO format date (YYYY-MM-DD) to filter events starting from this date',
        },
      ],
      trigger: {
        request: async (authToken, data) => {
          if (!process.env.TICKET_MASTER_API_KEY) {
            Logger.error('TICKET_MASTER_API_KEY not found');
            throw new BadRequestException('API key not found');
          }

          const url = 'https://app.ticketmaster.com/discovery/v2/events.json';
          const params: { [key: string]: string } = {
            apikey: process.env.TICKET_MASTER_API_KEY!,
            startDateTime: `${data.startDate}T00:00:00Z`,
            sort: 'date,desc',
          };

          try {
            const response = await axios.get(url, { params });
            return response.data._embedded
              ? response.data._embedded.events
              : [];
          } catch (error) {
            Logger.error(
              `TICKETMASTER: ${error.response?.data?.error || error.message}`,
            );
            throw new BadRequestException(
              error.response?.data?.error || 'Failed to fetch events',
            );
          }
        },
        condition: (currentState, previousState) => {
          return currentState[0] !== previousState[0];
        },
      },
    },
  ],
  reactions: [],
};
