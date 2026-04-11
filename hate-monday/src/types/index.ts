export type ProjectStatus = 'active' | 'completed' | 'on_hold';
export type TaskStatus = 'todo' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type EventType = 'meeting' | 'deadline' | 'milestone' | 'general';

export interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

export interface Project {
  id: string;
  categoryId: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
}

export interface Task {
  id: string;
  projectId: string | null;
  title: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
}

export interface CalendarEvent {
  id: string;
  projectId: string | null;
  title: string;
  date: string;      // 시작일 YYYY-MM-DD
  endDate?: string;  // 종료일 YYYY-MM-DD (선택)
  time?: string;
  type: EventType;
}

export interface Kpi {
  id: string;
  name: string;
  value: number;
  unit?: string;
  trend: 'up' | 'down' | 'flat';
}

export interface Contact {
  id: string;
  projectId: string | null;
  name: string;
  company?: string;
  role?: string;
  phone?: string;
  email?: string;
  note?: string;
  favorite?: boolean;
}
