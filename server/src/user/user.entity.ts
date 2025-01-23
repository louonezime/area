export class User {
  id: number;
  name: string;
  email: string;
  password: string | null;
}

export class UserInfo {
  id: number | undefined;
  name: string | undefined;
  email: string | undefined;
  oauthProvider: string | null | undefined;
}
