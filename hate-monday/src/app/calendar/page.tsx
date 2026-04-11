'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isSameDay, parseISO,
  addMonths, subMonths,
} from 'date-fns';
import { useDataStore } from '@/store/useDataStore';
import { mockProjects, mockCategories } from '@/lib/mockData';
import { CalendarEvent } from '@/types';

const EVENT_TYPE_COLOR: Record<string, string> = {
  deadline:  '#D94040',
  milestone: '#4CAF50',
  meeting:   '#FF9800',
  general:   '#6B6B6B',
};

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const { events, tasks } = useDataStore();

  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });

  const catMap = Object.fromEntries(mockCategories.map((c) => [c.id, c]));
  const projMap = Object.fromEntries(mockProjects.map((p) => [p.id, p]));

  // 태스크도 캘린더에 표시 (마감일 기준)
  const taskEvents = tasks
    .filter((t) => t.status === 'todo')
    .map((t) => ({
      id: `task-${t.id}`,
      projectId: t.projectId,
      title: `✓ ${t.title}`,
      date: t.dueDate,
      type: 'general' as const,
    }));

  const allEvents = [...events, ...taskEvents];

  const eventsForDate = (dateStr: string) =>
    allEvents.filter((e) => {
      if ('endDate' in e && e.endDate) return dateStr >= e.date && dateStr <= (e.endDate as string);
      return e.date === dateStr;
    });

  const selectedEvents = selected ? eventsForDate(selected) : [];

  return (
    <div className="min-h-[calc(100dvh-64px)] flex flex-col px-4 pt-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-text-primary">Calendar</h1>
        <Link
          href="/upload"
          className="flex items-center gap-1.5 bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-accent-hover transition-colors"
        >
          <Plus size={14} /> Add Event
        </Link>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonth(subMonths(month, 1))} className="text-text-secondary hover:text-text-primary p-1">
          <ChevronLeft size={18} />
        </button>
        <span className="text-base font-bold text-text-primary">{format(month, 'MMMM yyyy')}</span>
        <button onClick={() => setMonth(addMonths(month, 1))} className="text-text-secondary hover:text-text-primary p-1">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['일','월','화','수','목','금','토'].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-text-secondary py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1 flex-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsForDate(dateStr);
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);
          const isSelected = selected === dateStr;
          const hasDeadline = dayEvents.some((e) => e.type === 'deadline');

          return (
            <div
              key={dateStr}
              onClick={() => setSelected(isSelected ? null : dateStr)}
              className={`min-h-[46px] p-1 rounded-[8px] cursor-pointer transition-colors ${
                isSelected ? 'bg-accent/8' :
                today ? 'bg-accent/5' : 'hover:bg-surface'
              } ${!inMonth ? 'opacity-30' : ''}`}
            >
              <div className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-semibold mx-auto mb-0.5 ${
                today ? 'bg-accent text-white' : 'text-text-primary'
              }`}>
                {format(day, 'd')}
              </div>
              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, 2).map((ev) => {
                  const proj = ev.projectId ? projMap[ev.projectId] : null;
                  const cat = proj ? catMap[proj.categoryId] : null;
                  const color = cat?.color ?? EVENT_TYPE_COLOR[ev.type] ?? '#6B6B6B';
                  return (
                    <div
                      key={ev.id}
                      className="w-full rounded px-1 py-0.5 text-[9px] font-medium truncate"
                      style={{ backgroundColor: color + '25', color }}
                    >
                      {ev.title}
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <p className="text-[9px] text-text-secondary text-center">+{dayEvents.length - 2}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selected && selectedEvents.length > 0 && (
        <div className="mt-3 bg-surface rounded-[12px] p-3">
          <h3 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
            {format(parseISO(selected), 'MMMM d')}
          </h3>
          <div className="flex flex-col gap-2">
            {selectedEvents.map((ev) => {
              const proj = ev.projectId ? projMap[ev.projectId] : null;
              const cat = proj ? catMap[proj?.categoryId] : null;
              const color = cat?.color ?? EVENT_TYPE_COLOR[ev.type];
              return (
                <div key={ev.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{ev.title}</p>
                    {'time' in ev && ev.time && <p className="text-[10px] text-text-secondary">{ev.time}</p>}
                  </div>
                  <span className="text-[10px] text-text-secondary capitalize">{ev.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
