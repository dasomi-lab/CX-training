'use client';

import { useState } from 'react';
import {
  format, isToday, isPast,
  startOfWeek, endOfWeek, eachDayOfInterval,
  addWeeks, subWeeks, parseISO, differenceInDays,
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

const MON_START = { weekStartsOn: 1 as const };

function weekKey(d: Date) {
  return format(startOfWeek(d, MON_START), 'yyyy-MM-dd');
}

interface WeekViewProps {
  events: CalendarEvent[];
  tasks:  Task[];
}

export default function WeekView({ events, tasks }: WeekViewProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), MON_START));

  const days        = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, MON_START) });
  const isThisWeek  = weekKey(weekStart) === weekKey(new Date());

  const getItems = (dateStr: string) => ({
    evs:   events.filter((e) => e.date === dateStr),
    tskts: tasks.filter((t) => t.dueDate === dateStr && t.status === 'todo'),
  });

  /* ── Today card data ── */
  const todayStr              = format(new Date(), 'yyyy-MM-dd');
  const { evs: todayEvs, tskts: todayTasks } = getItems(todayStr);
  const todayAll              = [...todayEvs, ...todayTasks];
  const todayVisible          = todayAll.slice(0, 4);
  const todayExtra            = todayAll.length - todayVisible.length;

  /* ── Other days (exclude today when viewing this week) ── */
  const otherDays = isThisWeek ? days.filter((d) => !isToday(d)) : days;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Today card (only shown when on current week) ── */}
      {isThisWeek && (
        <div className="bg-accent/5 border border-accent/20 rounded-[14px] px-3.5 pt-3 pb-3">
          <p className="text-[11px] font-bold text-accent mb-2.5">
            오늘 · {DAY_KO[new Date().getDay()]}요일&nbsp;{format(new Date(), 'M월 d일')}
          </p>

          {todayAll.length === 0 ? (
            <p className="text-[12px] text-text-secondary">오늘 일정이 없어요 ☀️</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {todayVisible.map((item) => {
                /* CalendarEvent */
                if ('type' in item) {
                  const ev    = item as CalendarEvent;
                  const color = TYPE_COLOR[ev.type] ?? '#9CA3AF';
                  return (
                    <div key={ev.id} className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[12px] text-text-primary flex-1 truncate">{ev.title}</span>
                      {ev.time && <span className="text-[10px] text-text-secondary shrink-0">{ev.time}</span>}
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
                        style={{ backgroundColor: color + '20', color }}
                      >
                        {TYPE_LABEL[ev.type]}
                      </span>
                    </div>
                  );
                }
                /* Task */
                const task     = item as Task;
                const daysLeft = differenceInDays(parseISO(task.dueDate), new Date());
                const dLabel   = daysLeft === 0 ? 'D-day' : daysLeft > 0 ? `D-${daysLeft}` : `D+${Math.abs(daysLeft)}`;
                return (
                  <div key={task.id} className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 border border-text-secondary" />
                    <span className="text-[12px] text-text-primary flex-1 truncate">{task.title}</span>
                    <span className="text-[10px] text-text-secondary shrink-0">{dLabel}</span>
                    <span className="text-[9px] font-semibold shrink-0" style={{ color: PRIORITY_COLOR[task.priority] }}>
                      {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}
                    </span>
                  </div>
                );
              })}
              {todayExtra > 0 && (
                <p className="text-[10px] text-text-secondary mt-0.5">+{todayExtra}개 더</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Week strip ── */}
      <div className="bg-surface rounded-[14px] px-3.5 pt-3 pb-2.5">
        {/* Nav */}
        <div className="flex items-center justify-between mb-2.5">
          <button onClick={() => setWeekStart((w) => subWeeks(w, 1))} className="p-0.5 text-text-secondary hover:text-text-primary">
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), MON_START))}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary"
          >
            {isThisWeek && (
              <span className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-bold">이번 주</span>
            )}
            {format(days[0], 'M.d')} — {format(days[6], 'M.d')}
          </button>
          <button onClick={() => setWeekStart((w) => addWeeks(w, 1))} className="p-0.5 text-text-secondary hover:text-text-primary">
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Day rows */}
        <div className="flex flex-col gap-0.5">
          {otherDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const past    = isPast(day) && !isToday(day);
            const { evs, tskts } = getItems(dateStr);
            const total   = evs.length + tskts.length;
            const primary = evs[0] ?? tskts[0] ?? null;
            const extra   = total - 1;
            const isEvent = primary && 'type' in primary;

            return (
              <div
                key={dateStr}
                className={`flex items-center gap-2 px-1.5 py-1.5 rounded-[8px] transition-opacity ${
                  past ? 'opacity-35' : 'hover:bg-background'
                }`}
              >
                {/* Day label */}
                <span className="text-[10px] font-semibold text-text-secondary w-8 shrink-0">
                  {DAY_KO[day.getDay()]} {format(day, 'd')}
                </span>

                {total === 0 ? (
                  <span className="text-[11px] text-text-secondary">여유 ☀️</span>
                ) : primary ? (
                  <>
                    {isEvent ? (
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: TYPE_COLOR[(primary as CalendarEvent).type] ?? '#9CA3AF' }}
                      />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 border border-text-secondary" />
                    )}
                    <span className="text-[11px] text-text-primary flex-1 truncate">{primary.title}</span>
                    {isEvent && (
                      <span
                        className="text-[9px] px-1 py-0.5 rounded-full font-medium shrink-0"
                        style={{
                          backgroundColor: (TYPE_COLOR[(primary as CalendarEvent).type] ?? '#9CA3AF') + '20',
                          color: TYPE_COLOR[(primary as CalendarEvent).type] ?? '#9CA3AF',
                        }}
                      >
                        {TYPE_LABEL[(primary as CalendarEvent).type]}
                      </span>
                    )}
                    {extra > 0 && (
                      <span className="text-[10px] text-text-secondary shrink-0">+{extra}</span>
                    )}
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
