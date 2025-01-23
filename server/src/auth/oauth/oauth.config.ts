import { Logger, UnauthorizedException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { OAuthConfig } from './oauth.types';

export const oauth2: OAuthConfig[] = [
  {
    name: 'google',
    utils: {
      generateAuthUrl(newRedirect: string | undefined): string {
        const redirectUrl =
          newRedirect || 'http://localhost:8080/oauth/google/callback';

        if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
          Logger.error("GOOGLE_OAUTH_CLIENT_ID can't be found");
        }

        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_OAUTH_CLIENT_ID}&scope=email+profile&response_type=code&redirect_uri=${redirectUrl}`;
      },

      async getToken(
        auth_code: string,
        newRedirect: string | undefined,
      ): Promise<any | null> {
        const redirectUrl =
          newRedirect || 'http://localhost:8080/oauth/google/callback';

        if (!process.env.GOOGLE_OAUTH_CLIENT_ID)
          Logger.error("GOOGLE_OAUTH_CLIENT_ID can't be found");
        if (!process.env.GOOGLE_OAUTH_SECRET)
          Logger.error("GOOGLE_OAUTH_SECRET can't be found");

        try {
          const response = await axios.post(
            'https://oauth2.googleapis.com/token',
            null,
            {
              params: {
                client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
                client_secret: process.env.GOOGLE_OAUTH_SECRET,
                code: auth_code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUrl,
              },
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          );

          return {
            token: response.data.access_token,
            expiration: response.data.expires_in,
          };
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            const { status, data } = error.response;
            Logger.error(
              `Google OAuth token error: ${status} - ${data.error.message}`,
            );
            throw new UnauthorizedException(
              data.error.message || 'Failed to exchange token',
            );
          } else {
            Logger.error(
              `Unknown error during Google token exchange: ${error.message}`,
            );
            throw new UnauthorizedException('Failed to exchange token');
          }
        }
      },

      async getProfile(token: string): Promise<any | null> {
        try {
          const response = await axios.get(
            'https://www.googleapis.com/oauth2/v1/userinfo',
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { alt: 'json' },
            },
          );
          return { email: response.data.email, name: response.data.name };
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            const { status, data } = error.response;
            Logger.error(
              `Google profile retrieval error: ${status} - ${data.error.message}`,
            );
            return null;
          } else {
            Logger.error(
              `Unknown error during Google profile retrieval: ${error.message}`,
            );
            return null;
          }
        }
      },
    },
  },
  {
    name: 'discord',
    utils: {
      generateAuthUrl(newRedirect: string | undefined): string {
        const redirectUrl = encodeURIComponent(
          newRedirect || 'http://localhost:8080/oauth/discord/callback',
        );

        if (!process.env.DISCORD_OAUTH_CLIENT_ID) {
          Logger.error("DISCORD_OAUTH_CLIENT_ID can't be found");
        }

        return `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_OAUTH_CLIENT_ID}&response_type=code&redirect_uri=${redirectUrl}&scope=email+identify`;
      },

      async getToken(
        auth_code: string,
        newRedirect: string | undefined,
      ): Promise<any | null> {
        const redirectUrl =
          newRedirect || 'http://localhost:8080/oauth/discord/callback';

        if (!process.env.DISCORD_OAUTH_CLIENT_ID)
          Logger.error("DISCORD_OAUTH_CLIENT_ID can't be found");
        if (!process.env.DISCORD_OAUTH_SECRET)
          Logger.error("DISCORD_OAUTH_SECRET can't be found");

        const params = new URLSearchParams();
        params.append('client_id', process.env.DISCORD_OAUTH_CLIENT_ID!);
        params.append('client_secret', process.env.DISCORD_OAUTH_SECRET!);
        params.append('grant_type', 'authorization_code');
        params.append('code', auth_code);
        params.append('redirect_uri', redirectUrl);

        try {
          const response = await axios.post(
            'https://discord.com/api/oauth2/token',
            params,
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            },
          );

          return {
            token: response.data.access_token,
            expiration: response.data.expires_in,
          };
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            const { status, data } = error.response;
            Logger.error(
              `Discord token exchange error: ${status} - ${data.error}`,
            );
            throw new UnauthorizedException(
              data.error || 'Failed to exchange token',
            );
          } else {
            Logger.error(
              `Unknown error during Discord token exchange: ${error.message}`,
            );
            throw new UnauthorizedException('Failed to exchange token');
          }
        }
      },

      async getProfile(token: string): Promise<any | null> {
        try {
          const response = await axios.get(
            'https://discord.com/api/users/@me',
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          return { email: response.data.email, name: response.data.username };
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            const { status, data } = error.response;
            Logger.error(
              `Discord profile retrieval error: ${status} - ${data.error}`,
            );
            return null;
          } else {
            Logger.error(
              `Unknown error during Discord profile retrieval: ${error.message}`,
            );
            return null;
          }
        }
      },
    },
  },
  {
    name: 'spotify',
    utils: {
      generateAuthUrl(newRedirect: string | undefined): string {
        const redirectUrl =
          newRedirect || 'http://localhost:8080/oauth/spotify/callback';
        const scopes = encodeURIComponent('user-read-private user-read-email');

        if (!process.env.SPOTIFY_OAUTH_CLIENT_ID) {
          Logger.error("SPOTIFY_OAUTH_CLIENT_ID can't be found");
        }

        return `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_OAUTH_CLIENT_ID}&scope=${scopes}&response_type=code&redirect_uri=${redirectUrl}`;
      },

      async getToken(
        auth_code: string,
        newRedirect: string | undefined,
      ): Promise<any | null> {
        const redirectUrl =
          newRedirect || 'http://localhost:8080/oauth/spotify/callback';

        if (!process.env.SPOTIFY_OAUTH_CLIENT_ID)
          Logger.error("SPOTIFY_OAUTH_CLIENT_ID can't be found");
        if (!process.env.SPOTIFY_OAUTH_SECRET)
          Logger.error("SPOTIFY_OAUTH_SECRET can't be found");

        try {
          const encoded = Buffer.from(
            `${process.env.SPOTIFY_OAUTH_CLIENT_ID}:${process.env.SPOTIFY_OAUTH_SECRET}`,
          ).toString('base64');

          const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            null,
            {
              params: {
                grant_type: 'authorization_code',
                code: auth_code,
                redirect_uri: redirectUrl,
              },
              headers: {
                Authorization: `Basic ${encoded}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          );

          return {
            token: response.data.access_token,
            expiration: response.data.expires_in,
          };
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            const { status, data } = error.response;
            Logger.error(
              `Spotify token exchange error: ${status} - ${data.error.message}`,
            );
            throw new UnauthorizedException(
              data.error.message || 'Failed to exchange token',
            );
          } else {
            Logger.error(
              `Unknown error during Spotify token exchange: ${error.message}`,
            );
            throw new UnauthorizedException('Failed to exchange token');
          }
        }
      },

      async getProfile(token: string): Promise<any | null> {
        try {
          const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          return {
            email: response.data.email,
            name: response.data.display_name,
          };
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            const { status, data } = error.response;
            Logger.error(
              `Spotify profile retrieval error: ${status} - ${data.error.message}`,
            );
            return null;
          } else {
            Logger.error(
              `Unknown error during Spotify profile retrieval: ${error.message}`,
            );
            return null;
          }
        }
      },
    },
  },
  {
    name: 'gitlab',
    utils: {
      generateAuthUrl(newRedirect: string | undefined): string {
        const redirectUrl =
          newRedirect || 'http://localhost:8080/oauth/gitlab/callback';

        if (!process.env.GITLAB_OAUTH_CLIENT_ID) {
          Logger.error("GITLAB_OAUTH_CLIENT_ID can't be found");
        }

        return `https://gitlab.com/oauth/authorize?client_id=${process.env.GITLAB_OAUTH_CLIENT_ID}&scope=read_user&response_type=code&redirect_uri=${redirectUrl}`;
      },

      async getToken(
        auth_code: string,
        newRedirect: string | undefined,
      ): Promise<any | null> {
        const redirectUrl =
          newRedirect || 'http://localhost:8080/oauth/gitlab/callback';

        if (!process.env.GITLAB_OAUTH_CLIENT_ID)
          Logger.error("GITLAB_OAUTH_CLIENT_ID can't be found");
        if (!process.env.GITLAB_OAUTH_SECRET)
          Logger.error("GITLAB_OAUTH_SECRET can't be found");

        try {
          const response = await axios.post(
            'https://gitlab.com/oauth/token',
            null,
            {
              params: {
                client_id: process.env.GITLAB_OAUTH_CLIENT_ID,
                client_secret: process.env.GITLAB_OAUTH_SECRET,
                grant_type: 'authorization_code',
                code: auth_code,
                redirect_uri: redirectUrl,
              },
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            },
          );

          return {
            token: response.data.access_token,
            expiration: response.data.expires_in,
          };
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            const { status, data } = error.response;
            Logger.error(
              `GitLab token exchange error: ${status} - ${data.error_description}`,
            );
            throw new UnauthorizedException(
              data.error_description || 'Failed to exchange token',
            );
          } else {
            Logger.error(
              `Unknown error during GitLab token exchange: ${error.message}`,
            );
            throw new UnauthorizedException('Failed to exchange token');
          }
        }
      },

      async getProfile(token: string): Promise<any | null> {
        try {
          const response = await axios.get('https://gitlab.com/api/v4/user', {
            headers: { Authorization: `Bearer ${token}` },
          });

          return { email: response.data.email, name: response.data.name };
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            const { status, data } = error.response;
            Logger.error(
              `GitLab profile retrieval error: ${status} - ${data.error_description}`,
            );
            return null;
          } else {
            Logger.error(
              `Unknown error during GitLab profile retrieval: ${error.message}`,
            );
            return null;
          }
        }
      },
    },
  },
];
