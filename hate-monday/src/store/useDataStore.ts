'use client';

import { create } from 'zustand';
import { Task, CalendarEvent } from '@/types';
import { mockTasks, mockEvents } from '@/lib/mockData';

interface DataState {
  tasks: Task[];
  events: CalendarEvent[];
  toggleTask: (id: string) => void;
  addEvent: (event: CalendarEvent) => void;
  addTask: (task: Task) => void;
}

export const useDataStore = create<DataState>((set) => ({
  tasks: mockTasks,
  events: mockEvents,

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
      ),
    })),

  addEvent: (event) =>
    set((state) => ({ events: [...state.events, event] })),

  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),
}));
