type authMethods = {
  generateAuthUrl(newRedirect: string | undefined): string;
  getToken(
    auth_code: string,
    newRedirect: string | undefined,
  ): Promise<any | null>;
  getProfile(token: string): Promise<any | null>;
};

export type OAuthConfig = {
  name: string;
  utils: authMethods;
};
