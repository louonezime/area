/* Customised REACTION */
interface Reaction {
  title: string;
  name: string;
  description: string;
  auth: string | null;
  form: any[];
}

export interface ReactionResponse {
  reactions: Reaction[];
}
