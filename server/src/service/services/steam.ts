import {
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { ServiceConfig } from '../service.types';

export const steam: ServiceConfig = {
  name: 'steam',
  color: '#171a21',
  auth: {
    type: 'apiKey',
    testValidity: async (authToken: string) => {
      if (!process.env.STEAM_SERVICE_ID_VALIDATION) {
        Logger.error("STEAM_SERVICE_ID_VALIDATION can't be found.");
        throw new BadRequestException('Steam Service ID validation not found');
      }

      try {
        const response = await axios.get(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2`,
          {
            params: {
              key: authToken,
              steamids: process.env.STEAM_SERVICE_ID_VALIDATION,
            },
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          },
        );

        return response.data;
      } catch (error) {
        Logger.error("STEAM: API token isn't valid");
        throw new BadRequestException('Failed to validate Steam API Key');
      }
    },
    hint: "Navigate to the 'Steam API Key Registration' website and sign in (https://steamcommunity.com/dev/apikey). Then follow the steps; the 'Domain Name' does not need to be valid",
  },
  actions: [
    {
      title: 'New Achievement Unlocked',
      name: 'new_achievement',
      description: 'Triggered when a player unlocks a new achievement',
      form: [
        {
          title: 'Steam ID of player',
          name: 'steamId',
          value: 'string',
          hint: "Select your Steam username in the top right corner of the screen and select 'Account details'. Your Steam ID can be found below your Steam username.",
        },
        {
          title: 'App ID of game',
          name: 'appId',
          value: 'string',
          hint: "Go to the game's shop page, then copy the number that's in the URL (requires 'Game details' to be public)",
        },
      ],
      trigger: {
        request: async (
          authToken: string,
          data: { steamId: string; appId: string },
        ) => {
          try {
            const response = await axios.get(
              `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/`,
              {
                params: {
                  appid: data.appId,
                  key: authToken,
                  steamid: data.steamId,
                },
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            );

            return response.data.playerstats.achievements
              .filter((achievement) => achievement.achieved === 1)
              .map((achievement) => achievement.apiname);
          } catch (error) {
            Logger.error("STEAM: Couldn't fetch achievements from account");
            throw new UnauthorizedException(
              error.response?.data.playerstats.error ||
                'Failed to fetch player achievements from Steam',
            );
          }
        },
        condition: (current_state: any, previous_state: any): boolean => {
          current_state = current_state as Array<string>;
          previous_state = previous_state as Array<string>;
          return current_state.some(
            (achievement: string) => !previous_state.includes(achievement),
          );
        },
      },
    },
  ],
  reactions: [],
};
