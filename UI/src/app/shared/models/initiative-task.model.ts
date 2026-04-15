export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface InitiativeTask {
  id: number;
  initiative_id: number;
  initiative_name: string;
  developer_id: number;
  developer_name: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface InitiativeTaskPayload {
  initiative_id: number;
  developer_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  due_date: string | null;
}
