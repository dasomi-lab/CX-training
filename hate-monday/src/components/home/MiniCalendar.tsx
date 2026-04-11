'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isSameDay, parseISO,
} from 'date-fns';
import { CalendarEvent } from '@/types';

interface MiniCalendarProps {
  events: CalendarEvent[];
}

export default function MiniCalendar({ events }: MiniCalendarProps) {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const deadlineDates = events
    .filter((e) => e.type === 'deadline')
    .map((e) => e.date);

  const selectedEvents = selected
    ? events.filter((e) => e.date === format(selected, 'yyyy-MM-dd'))
    : [];

  return (
    <div className="flex flex-col gap-1.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => setMonth((m) => { const d = new Date(m); d.setMonth(d.getMonth() - 1); return d; })}
          className="text-text-secondary hover:text-text-primary">
          <ChevronLeft size={14} />
        </button>
        <span className="text-[11px] font-semibold text-text-primary">
          {format(month, 'MMM yyyy')}
        </span>
        <button onClick={() => setMonth((m) => { const d = new Date(m); d.setMonth(d.getMonth() + 1); return d; })}
          className="text-text-secondary hover:text-text-primary">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <span key={i} className="text-[9px] text-text-secondary font-medium">{d}</span>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 text-center gap-y-0.5">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);
          const isSelected = selected && isSameDay(day, selected);
          const hasDeadline = deadlineDates.includes(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => setSelected(isSelected ? null : day)}
              className={`relative flex items-center justify-center w-6 h-6 mx-auto rounded-full text-[10px] font-medium transition-colors ${
                !inMonth ? 'text-border' :
                isSelected ? 'bg-accent text-white' :
                today ? 'bg-accent/10 text-accent font-bold' :
                'text-text-primary hover:bg-surface'
              }`}
            >
              {format(day, 'd')}
              {hasDeadline && inMonth && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      {selected && selectedEvents.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {selectedEvents.slice(0, 2).map((ev) => (
            <p key={ev.id} className="text-[10px] text-text-secondary truncate">
              • {ev.title}
            </p>
          ))}
          {selectedEvents.length > 2 && (
            <p className="text-[10px] text-text-secondary">+{selectedEvents.length - 2} more</p>
          )}
        </div>
      )}
    </div>
  );
}
