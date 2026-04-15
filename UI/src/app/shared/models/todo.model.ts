export type TodoStatus   = 'pending' | 'in_progress' | 'completed';
export type TodoPriority = 'low' | 'medium' | 'high';

export interface RecurringTodo {
  id: number;
  title: string;
  description: string | null;
  recurrence_pattern: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecurringTodoPayload {
  title: string;
  description: string | null;
  recurrence_pattern: string;
  is_active: boolean;
}

export interface TimelineTodo {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  priority: TodoPriority;
  status: TodoStatus;
  created_at: string;
  updated_at: string;
}

export interface TimelineTodoPayload {
  title: string;
  description: string | null;
  due_date: string;
  priority: TodoPriority;
  status: TodoStatus;
}

export interface DailyTask {
  id: number;
  list_id: number;
  title: string;
  is_done: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DailyList {
  id: number;
  date: string;
  tasks: DailyTask[];
  created_at: string;
}
