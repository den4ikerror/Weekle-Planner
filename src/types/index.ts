export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startAt?: string; // ISO datetime or null for flexible tasks
  endAt?: string;
  dueAt?: string;
  status: Status;
  priority: Priority;
  category?: string;
  isRecurring?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Week {
  id: string;
  startDate: string; // ISO date (Monday)
  endDate: string; // ISO date (Sunday)
  events: Event[];
}
