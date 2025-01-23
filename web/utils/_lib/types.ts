/* AUTHENTICATION */

export interface token {
  access_token: string;
}

export interface OAuthResponse {
  redirectUrl: string;
}

export interface UserInfos {
  id: number;
  name: string;
  email: string;
  oauthProvider: string | null;
}
