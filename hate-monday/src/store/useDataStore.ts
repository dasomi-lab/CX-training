'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, CalendarEvent, Project, Contact } from '@/types';
import { mockTasks, mockEvents, mockProjects, mockContacts } from '@/lib/mockData';

interface DataState {
  tasks: Task[];
  events: CalendarEvent[];
  projects: Project[];
  contacts: Contact[];

  toggleTask: (id: string) => void;
  addTask: (task: Task) => void;
  addEvent: (event: CalendarEvent) => void;

  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;

  addContact: (contact: Contact) => void;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

export const useDataStore = create<DataState>()(
  persist(
  (set) => ({
  tasks: mockTasks,
  events: mockEvents,
  projects: mockProjects,
  contacts: mockContacts,

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
      ),
    })),

  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  addEvent: (event) =>
    set((state) => ({ events: [...state.events, event] })),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      tasks: state.tasks.filter((t) => t.projectId !== id),
    })),

  addContact: (contact) =>
    set((state) => ({ contacts: [...state.contacts, contact] })),

  updateContact: (contact) =>
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === contact.id ? contact : c)),
    })),

  deleteContact: (id) =>
    set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) })),

  toggleFavorite: (id) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id ? { ...c, favorite: !c.favorite } : c
      ),
    })),
  }),
  { name: 'hate-monday-data' }
));
