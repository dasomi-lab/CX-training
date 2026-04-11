'use client';

import { create } from 'zustand';

interface CalendarState {
  currentMonth: Date;
  selectedDate: string | null; // ISO date string YYYY-MM-DD
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  selectDate: (d: string | null) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  currentMonth: new Date(),
  selectedDate: null,

  goToNextMonth: () =>
    set((state) => {
      const d = new Date(state.currentMonth);
      d.setMonth(d.getMonth() + 1);
      return { currentMonth: d };
    }),

  goToPrevMonth: () =>
    set((state) => {
      const d = new Date(state.currentMonth);
      d.setMonth(d.getMonth() - 1);
      return { currentMonth: d };
    }),

  selectDate: (d) => set({ selectedDate: d }),
}));
