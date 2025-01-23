export interface AreaComponent {
  id: number;
  name: string;
  userId: number;
  actionId: number;
  reactionId: number;
}

export interface ActionComponent {
  id: number;
  serviceId: number;
  title: string;
  name: string;
  description: string;
  payload: Record<string, any> | null;
  lastState: Record<string, any> | null;
}

export interface ReactionComponent {
  id: number;
  serviceId: number;
  title: string;
  name: string;
  description: string;
  payload: Record<string, any> | null;
}
