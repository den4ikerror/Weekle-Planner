import Dexie, { Table } from 'dexie';

export interface Event {
  id?: number;
  title: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  dueAt?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  category?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export class PlannerDatabase extends Dexie {
  events!: Table<Event>;

  constructor() {
    super('PlannerDatabase');
    this.version(1).stores({
      events: '++id, title, status, priority, category, startAt, dueAt, deletedAt'
    });
  }
}

export const db = new PlannerDatabase();
