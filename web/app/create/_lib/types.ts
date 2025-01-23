/* GENERAL */

export interface SuccessResponse {
  success: boolean;
}

/* SERVICE */

type AuthType = "apiKey" | "oauth2" | "webhook" | null;

export interface ServicesAction {
  serviceName: string;
  connectionLink: string;
  colorConf: string;
  imageConf: string;
  authType: AuthType;
  actionsTitle: string[];
  actionsDescription: string[];
}

export interface ServicesReaction {
  serviceName: string;
  connectionLink: string;
  colorConf: string;
  imageConf: string;
  authType: AuthType;
  reactionsTitle: string[];
  reactionsDescription: string[];
}

export type Services = ServicesAction | ServicesReaction;

export interface Form {
  title: string;
  name: string;
  value: any;
  hint: string;
}

export interface Action {
  title: string;
  name: string;
  description: string;
  form: Form[];
}

export interface Reaction {
  title: string;
  name: string;
  description: string;
  form: Form[];
}

export interface ServiceResponse {
  name: string;
  color: string;
  auth: { type: AuthType; url: string; hint?: string | null };
  actions: Action[];
  reactions: Reaction[];
}
