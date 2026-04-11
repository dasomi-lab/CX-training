'use client';

import { create } from 'zustand';
import { Task, CalendarEvent } from '@/types';
import { mockTasks, mockEvents, mockProjects } from '@/lib/mockData';
import { Project } from '@/types';

interface DataState {
  tasks: Task[];
  events: CalendarEvent[];
  projects: Project[];
  toggleTask: (id: string) => void;
  addEvent: (event: CalendarEvent) => void;
  addTask: (task: Task) => void;
  deleteProject: (id: string) => void;
}

export const useDataStore = create<DataState>((set) => ({
  tasks: mockTasks,
  events: mockEvents,
  projects: mockProjects,

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

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      tasks: state.tasks.filter((t) => t.projectId !== id),
    })),
}));
