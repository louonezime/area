import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { ServiceConfig } from '../service.types';

export const spotify: ServiceConfig = {
  name: 'spotify',
  color: '#1ED760',
  auth: {
    type: 'oauth2',
    authorization: (newRedirect: string | undefined) => {
      const redirectUrl =
        newRedirect || 'http://localhost:8080/service/spotify/oauth/callback';
      Logger.debug(`${redirectUrl} used as callback for Spotify.`);

      if (!process.env.SPOTIFY_SERVICE_CLIENT_ID)
        Logger.error("SPOTIFY_SERVICE_CLIENT_ID can't be found");
      const scopes = [
        'user-read-private',
        'user-read-email',
        // 'user-top-read',
        // 'user-library-read',
        // 'user-library-modify',
        // 'user-follow-read',
        // 'user-follow-modify',
        // 'user-read-playback-position',
        // 'user-read-playback-state',
        // 'user-modify-playback-state',
        // 'user-read-currently-playing',
        // 'user-read-recently-played',
        // 'playlist-read-public',
        'playlist-modify-public',
        'playlist-read-private',
        'playlist-modify-private',
        // 'playlist-read-collaborative',
      ].join(' ');
      const encodedScopes = encodeURIComponent(scopes);
      return `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_SERVICE_CLIENT_ID}&scope=${encodedScopes}&response_type=code&redirect_uri=${redirectUrl}`;
    },
    retrieveToken: async (code: string, newRedirect: string | undefined) => {
      const redirectUrl =
        newRedirect || 'http://localhost:8080/service/spotify/oauth/callback';
      Logger.debug(`redirect URL set as ${redirectUrl}`);

      if (!process.env.SPOTIFY_SERVICE_CLIENT_ID)
        Logger.error("SPOTIFY_SERVICE_CLIENT_ID can't be found");
      if (!process.env.SPOTIFY_SERVICE_CLIENT_SECRET)
        Logger.error("SPOTIFY_SERVICE_CLIENT_SECRET can't be found");
      const encoded = Buffer.from(
        `${process.env.SPOTIFY_SERVICE_CLIENT_ID}:${process.env.SPOTIFY_SERVICE_CLIENT_SECRET}`,
      ).toString('base64');

      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', redirectUrl);

      try {
        const response = await axios.post(
          'https://accounts.spotify.com/api/token',
          params.toString(),
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${encoded}`,
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
          `Spotify token exchange failed: ${error.response?.data.error.message}`,
        );
        throw new BadRequestException(
          error.response?.data.error.message || 'Failed to exchange token',
        );
      }
    },
    refreshToken: async (refresh_token: string) => {
      const encoded = Buffer.from(
        `${process.env.SPOTIFY_SERVICE_CLIENT_ID}:${process.env.SPOTIFY_SERVICE_CLIENT_SECRET}`,
      ).toString('base64');

      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refresh_token);

      try {
        const response = await axios.post(
          'https://accounts.spotify.com/api/token',
          params.toString(),
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${encoded}`,
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
        Logger.error(`SPOTIFY: ${error.response?.data.error.message}`);
        throw new UnauthorizedException(
          error.response?.data.error.message || 'Failed to refresh token',
        );
      }
    },
  },
  actions: [
    {
      title: 'New follower',
      name: 'new_follower',
      description: 'Triggered when the user gains a new follower',
      form: [],
      trigger: {
        request: async (authToken: string) => {
          try {
            const response = await axios.get('https://api.spotify.com/v1/me', {
              headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            });
            return response.data.followers;
          } catch (error) {
            Logger.error(`SPOTIFY: ${error.response?.data.error.message}`);
            throw new UnauthorizedException(
              error.response?.data.error.message ||
                'Failed to retrieve Spotify profile',
            );
          }
        },
        condition: (currentState: any, previousState: any): boolean => {
          return currentState['total'] > previousState['total'];
        },
      },
    },
    {
      title: 'New Playlist',
      name: 'new_playlist',
      description: 'Triggered when a new playlist is created',
      form: [],
      trigger: {
        request: async (authToken: string) => {
          try {
            const response = await axios.get(
              'https://api.spotify.com/v1/me/playlists',
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              },
            );
            return response.data.items.map((playlist: any) => playlist.id);
          } catch (error) {
            Logger.error(`SPOTIFY: ${error.response?.data.error.message}`);
            throw new BadRequestException(
              error.response?.data.error.message || 'Failed to fetch playlists',
            );
          }
        },
        condition: (currentState: any, previousState: any): boolean => {
          currentState = currentState as Array<string>;
          previousState = previousState as Array<string>;
          return currentState.some(
            (playlist: string) => !previousState.includes(playlist),
          );
        },
      },
    },
  ],
  reactions: [
    {
      title: 'Create Playlist',
      name: 'create_playlist',
      description: 'Create a new playlist on Spotify',
      form: [
        {
          title: 'Playlist Name',
          name: 'playlistName',
          value: 'string',
          hint: null,
        },
        {
          title: 'Description',
          name: 'description',
          value: 'string',
          hint: null,
        },
        {
          title: 'Public',
          name: 'public',
          value: ['Yes', 'No'],
          hint: "If you want the playlist to be public, put 'Yes'",
        },
      ],
      request: {
        request: async (authToken: string, data: any) => {
          const isPublic = data.public === 'Yes';

          try {
            const userResponse = await axios.get(
              'https://api.spotify.com/v1/me',
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            const user = userResponse.data.id;

            const payload = {
              name: data.playlistName,
              description: data.description || '',
              public: isPublic,
            };
            const response = await axios.post(
              `https://api.spotify.com/v1/users/${user}/playlists`,
              payload,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            return response.data;
          } catch (error) {
            Logger.error(`SPOTIFY: ${error.response?.data.error.message}`);
            throw new BadRequestException(
              error.response?.data.error.message ||
                'Failed to create playlist on Spotify',
            );
          }
        },
      },
    },
  ],
};
