'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isSameDay,
} from 'date-fns';
import { CalendarEvent, Task } from '@/types';
import { mockProjects, mockCategories } from '@/lib/mockData';

const TYPE_COLOR: Record<string, string> = {
  deadline:  '#D94040',
  meeting:   '#FF9800',
  milestone: '#4CAF50',
  general:   '#9CA3AF',
};
const TASK_FALLBACK = '#3B82F6';

const projMap = Object.fromEntries(mockProjects.map((p) => [p.id, p]));
const catMap  = Object.fromEntries(mockCategories.map((c) => [c.id, c]));

function projectColor(projectId: string | null, fallback: string): string {
  if (!projectId) return fallback;
  const proj = projMap[projectId];
  const cat  = proj ? catMap[proj.categoryId] : null;
  return cat?.color ?? fallback;
}

interface MiniCalendarProps {
  events: CalendarEvent[];
  tasks?: Task[];
}

export default function MiniCalendar({ events, tasks = [] }: MiniCalendarProps) {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end   = endOfWeek(endOfMonth(month),   { weekStartsOn: 0 });
  const days  = eachDayOfInterval({ start, end });

  // dateStr → dot colors (max 3, project color first)
  const dotMap: Record<string, string[]> = {};
  const push = (dateStr: string, color: string) => {
    if (!dotMap[dateStr]) dotMap[dateStr] = [];
    if (dotMap[dateStr].length < 3) dotMap[dateStr].push(color);
  };
  events.forEach((e) => push(e.date, projectColor(e.projectId, TYPE_COLOR[e.type] ?? '#9CA3AF')));
  tasks.filter((t) => t.status === 'todo').forEach((t) => push(t.dueDate, projectColor(t.projectId, TASK_FALLBACK)));

  const selectedDateStr = selected ? format(selected, 'yyyy-MM-dd') : null;
  const selectedEvents = selectedDateStr ? events.filter((e) => e.date === selectedDateStr) : [];
  const selectedTasks  = selectedDateStr ? tasks.filter((t) => t.dueDate === selectedDateStr && t.status === 'todo') : [];

  return (
    <div className="flex flex-col gap-1.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => setMonth((m) => { const d = new Date(m); d.setMonth(d.getMonth() - 1); return d; })} className="text-text-secondary hover:text-text-primary">
          <ChevronLeft size={14} />
        </button>
        <span className="text-[11px] font-semibold text-text-primary">{format(month, 'MMM yyyy')}</span>
        <button onClick={() => setMonth((m) => { const d = new Date(m); d.setMonth(d.getMonth() + 1); return d; })} className="text-text-secondary hover:text-text-primary">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center">
        {['일','월','화','수','목','금','토'].map((d, i) => (
          <span key={i} className="text-[9px] text-text-secondary font-medium">{d}</span>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 text-center gap-y-0.5">
        {days.map((day) => {
          const dateStr  = format(day, 'yyyy-MM-dd');
          const inMonth  = isSameMonth(day, month);
          const todayDay = isToday(day);
          const isSel    = selected && isSameDay(day, selected);
          const dots     = inMonth && !isSel ? (dotMap[dateStr] ?? []) : [];

          return (
            <button
              key={dateStr}
              onClick={() => setSelected(isSel ? null : day)}
              className={`relative flex flex-col items-center justify-start pt-0.5 w-7 h-8 mx-auto rounded-lg text-[10px] font-medium transition-colors ${
                !inMonth  ? 'text-border' :
                isSel     ? 'bg-accent text-white' :
                todayDay  ? 'bg-accent/10 text-accent font-bold' :
                'text-text-primary hover:bg-surface'
              }`}
            >
              <span>{format(day, 'd')}</span>
              {dots.length > 0 && (
                <span className="flex gap-[2px] mt-0.5">
                  {dots.map((c, i) => (
                    <span key={i} className="w-[4px] h-[4px] rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selected && (selectedEvents.length > 0 || selectedTasks.length > 0) && (
        <div className="mt-0.5 space-y-0.5 border-t border-border pt-1.5">
          {selectedTasks.slice(0, 2).map((t) => (
            <p key={t.id} className="text-[10px] truncate flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: projectColor(t.projectId, TASK_FALLBACK) }} />
              <span className="text-text-primary">{t.title}</span>
            </p>
          ))}
          {selectedEvents.slice(0, 2).map((ev) => (
            <p key={ev.id} className="text-[10px] truncate flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: projectColor(ev.projectId, TYPE_COLOR[ev.type] ?? '#9CA3AF') }} />
              <span className="text-text-primary">{ev.title}</span>
            </p>
          ))}
          {selectedEvents.length + selectedTasks.length > 4 && (
            <p className="text-[9px] text-text-secondary">+{selectedEvents.length + selectedTasks.length - 4} more</p>
          )}
        </div>
      )}
    </div>
  );
}
