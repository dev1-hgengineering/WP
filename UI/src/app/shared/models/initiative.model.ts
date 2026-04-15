export type InitiativeStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';

export interface DeveloperSummary {
  id: number;
  name: string;
  email: string | null;
}

export interface TaskCounts {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  blocked: number;
}

export interface Initiative {
  id: number;
  name: string;
  description: string | null;
  status: InitiativeStatus;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  start_date: string | null;
  end_date: string | null;
  developers: DeveloperSummary[];
  task_counts: TaskCounts;
  created_at: string;
  updated_at: string;
}

export interface InitiativePayload {
  name: string;
  description: string | null;
  status: InitiativeStatus;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  start_date: string | null;
  end_date: string | null;
}
