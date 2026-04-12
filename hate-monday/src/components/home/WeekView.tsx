'use client';

import { useState, useRef, useEffect } from 'react';
import {
  format, startOfWeek, endOfWeek, eachDayOfInterval,
  isToday, addWeeks, subWeeks, parseISO, differenceInDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent, Task } from '@/types';

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

const TYPE_COLOR: Record<string, string> = {
  deadline:  '#D94040',
  meeting:   '#FF9800',
  milestone: '#4CAF50',
  general:   '#9CA3AF',
};
const TYPE_LABEL: Record<string, string> = {
  deadline:  '마감',
  meeting:   '회의',
  milestone: '마일스톤',
  general:   '일정',
};
const PRIORITY_COLOR: Record<string, string> = {
  high: '#D94040', medium: '#FF9800', low: '#4CAF50',
};
const PRIORITY_LABEL: Record<string, string> = {
  high: '높음', medium: '보통', low: '낮음',
};

const mondayStart = { weekStartsOn: 1 as const };

function weekKey(d: Date) {
  return format(startOfWeek(d, mondayStart), 'yyyy-MM-dd');
}

interface WeekViewProps {
  events: CalendarEvent[];
  tasks:  Task[];
}

export default function WeekView({ events, tasks }: WeekViewProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), mondayStart));
  const todayRef = useRef<HTMLDivElement>(null);

  const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, mondayStart) });
  const isThisWeek = weekKey(weekStart) === weekKey(new Date());

  useEffect(() => {
    if (isThisWeek) {
      todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [weekStart, isThisWeek]);

  const prevWeek = () => setWeekStart((w) => subWeeks(w, 1));
  const nextWeek = () => setWeekStart((w) => addWeeks(w, 1));
  const goToday  = () => setWeekStart(startOfWeek(new Date(), mondayStart));

  return (
    <div className="flex flex-col gap-0">
      {/* Week nav */}
      <div className="flex items-center justify-between py-2 mb-1">
        <button onClick={prevWeek} className="p-1 text-text-secondary hover:text-text-primary">
          <ChevronLeft size={16} />
        </button>
        <button onClick={goToday} className="flex items-center gap-1.5 text-[12px] font-semibold text-text-primary">
          {isThisWeek && (
            <span className="text-[9px] bg-accent text-white px-1.5 py-0.5 rounded-full font-bold">이번 주</span>
          )}
          {format(days[0], 'M.d')} — {format(days[6], 'M.d')}
        </button>
        <button onClick={nextWeek} className="p-1 text-text-secondary hover:text-text-primary">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day sections */}
      <div className="flex flex-col gap-1.5">
        {days.map((day) => {
          const dateStr   = format(day, 'yyyy-MM-dd');
          const today     = isToday(day);
          const dayEvents = events.filter((e) => e.date === dateStr);
          const dayTasks  = tasks.filter((t) => t.dueDate === dateStr && t.status === 'todo');
          const isEmpty   = dayEvents.length === 0 && dayTasks.length === 0;

          return (
            <div
              key={dateStr}
              ref={today ? todayRef : undefined}
              className={`rounded-[12px] px-3 py-2.5 ${
                today
                  ? 'bg-accent/5 border border-accent/20'
                  : 'bg-surface border border-transparent'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`text-[11px] font-bold ${today ? 'text-accent' : 'text-text-secondary'}`}>
                  {DAY_KO[day.getDay()]}  {format(day, 'M.d')}
                </span>
                {today && (
                  <span className="text-[9px] bg-accent text-white px-1.5 py-0.5 rounded-full font-bold leading-none">
                    오늘
                  </span>
                )}
              </div>

              {isEmpty ? (
                <p className="text-[11px] text-text-secondary">여유 있는 날 ☀️</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {/* Events */}
                  {dayEvents.map((ev) => {
                    const color = TYPE_COLOR[ev.type] ?? '#9CA3AF';
                    return (
                      <div key={ev.id} className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[12px] text-text-primary flex-1 truncate">{ev.title}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {ev.time && <span className="text-[10px] text-text-secondary">{ev.time}</span>}
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: color + '20', color }}
                          >
                            {TYPE_LABEL[ev.type]}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Tasks */}
                  {dayTasks.map((task) => {
                    const daysLeft = differenceInDays(parseISO(task.dueDate), new Date());
                    const dLabel   = daysLeft === 0 ? 'D-day' : daysLeft > 0 ? `D-${daysLeft}` : `D+${Math.abs(daysLeft)}`;
                    const overdue  = daysLeft < 0;
                    return (
                      <div key={task.id} className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0 border"
                          style={{ borderColor: overdue ? '#D94040' : '#9CA3AF' }}
                        />
                        <span className={`text-[12px] flex-1 truncate ${overdue ? 'text-accent' : 'text-text-primary'}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] font-medium ${overdue ? 'text-accent' : 'text-text-secondary'}`}>
                            {dLabel}
                          </span>
                          <span className="text-[9px] font-semibold" style={{ color: PRIORITY_COLOR[task.priority] }}>
                            {PRIORITY_LABEL[task.priority]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
