import { JsonObject } from '@prisma/client/runtime/library';

type ApiKeyConfig = {
  type: 'apiKey';
  testValidity: (authToken: string) => Promise<any>;
  hint: string | null;
};

type WebhookConfig = {
  type: 'webhook';
  hint: string | null;
};

type OAuthConfig = {
  type: 'oauth2';
  authorization: (newRedirect: string | undefined) => string;
  retrieveToken: (
    code: string,
    newRedirect: string | undefined,
  ) => Promise<OauthTokenFetchResponse>;
  refreshToken:
    | ((refresh_token: string) => Promise<OauthTokenRefreshResponse | null>)
    | null;
};

type NoAuthConfig = {
  type: null;
};

type AuthConfig = ApiKeyConfig | OAuthConfig | NoAuthConfig | WebhookConfig;

type Action = {
  title: string;
  name: string;
  description: string;
  form: Array<{ title: string; name: string; value: any; hint: string | null }>;
  trigger: {
    request: (authToken: string, data: any) => Promise<any>;
    condition: (currentState: any, previousState: any) => boolean;
  };
};

type Reaction = {
  title: string;
  name: string;
  description: string;
  form: Array<{ title: string; name: string; value: any; hint: string | null }>;
  request: {
    request: (authToken: string, data?: any) => Promise<any>;
  };
};

export type ServiceConfig = {
  name: string;
  color: string;
  auth: AuthConfig;
  actions: Action[];
  reactions: Reaction[] | null;
};

export interface OauthTokenFetchResponse {
  accessToken: string;
  refresh_token: string | null;
  expiresAt: string | null;
  tokenType: string;
  metadata: JsonObject;
}

export interface OauthTokenRefreshResponse {
  accessToken: string;
  refresh_token: string | null;
  expiresAt: string | null;
  tokenType: string;
}
