export interface Developer {
  id: number;
  name: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeveloperPayload {
  name: string;
  email: string | null;
}
