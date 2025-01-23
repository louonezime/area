/* Customised ACTION */

interface Action {
  title: string;
  name: string;
  description: string;
  auth: string | null;
  form: any[];
}

export interface ActionResponse {
  actions: Action[];
}
