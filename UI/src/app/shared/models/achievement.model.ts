export interface Achievement {
  id: number;
  title: string;
  description: string | null;
  date: string; // ISO date string YYYY-MM-DD
  team_name: string;
  project_name: string;
  created_at: string;
  updated_at: string;
}

export interface AchievementPayload {
  title: string;
  description: string | null;
  date: string;
  team_name: string;
  project_name: string;
}
