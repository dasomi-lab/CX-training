'use client';

import { useState } from 'react';
import {
  format, isToday, isPast,
  startOfWeek, endOfWeek, eachDayOfInterval,
  addWeeks, subWeeks, parseISO, differenceInDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { CalendarEvent, Task } from '@/types';
import { useDataStore } from '@/store/useDataStore';

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
  const { toggleTask } = useDataStore();
  const [weekStart,  setWeekStart]  = useState(() => startOfWeek(new Date(), MON_START));
  const [completing, setCompleting] = useState<Set<string>>(new Set());

  const days       = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, MON_START) });
  const isThisWeek = weekKey(weekStart) === weekKey(new Date());

  const handleCheck = (id: string) => {
    setCompleting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      toggleTask(id);
      setCompleting((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }, 550);
  };

  const getItems = (dateStr: string) => ({
    evs:  events.filter((e) => e.date === dateStr),
    tsks: tasks.filter((t) => t.dueDate === dateStr && t.status === 'todo'),
  });

  /* ── Today ── */
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { evs: todayEvs, tsks: todayTasks } = getItems(todayStr);
  const todayAll     = [...todayEvs, ...todayTasks];
  const todayVisible = todayAll.slice(0, 4);
  const todayExtra   = todayAll.length - todayVisible.length;

  /* ── Other days (always exclude today from week strip) ── */
  const otherDays = days.filter((d) => !isToday(d));

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0">

      {/* ── Today card — always visible ── */}
      <div className="bg-accent/5 border border-accent/20 rounded-[16px] px-4 py-4 shrink-0">
          <p className="text-[12px] font-bold text-accent mb-3">
            오늘 &middot; {DAY_KO[new Date().getDay()]}요일&nbsp;{format(new Date(), 'M월 d일')}
          </p>

          {todayAll.length === 0 ? (
            <p className="text-[13px] text-text-secondary">오늘 일정이 없어요 ☀️</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {todayVisible.map((item) => {
                /* CalendarEvent */
                if ('type' in item) {
                  const ev    = item as CalendarEvent;
                  const color = TYPE_COLOR[ev.type] ?? '#9CA3AF';
                  return (
                    <div key={ev.id} className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      </span>
                      <span className="text-[13px] text-text-primary flex-1 truncate">{ev.title}</span>
                      {ev.time && <span className="text-[11px] text-text-secondary shrink-0">{ev.time}</span>}
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
                        style={{ backgroundColor: color + '20', color }}
                      >
                        {TYPE_LABEL[ev.type]}
                      </span>
                    </div>
                  );
                }

                /* Task */
                const task     = item as Task;
                const isComp   = completing.has(task.id);
                const daysLeft = differenceInDays(parseISO(task.dueDate), new Date());
                const dLabel   = daysLeft === 0 ? 'D-day' : daysLeft > 0 ? `D-${daysLeft}` : `D+${Math.abs(daysLeft)}`;
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-2.5 min-w-0 transition-all duration-500"
                    style={{ opacity: isComp ? 0 : 1, transform: isComp ? 'translateX(6px)' : 'none' }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => !isComp && handleCheck(task.id)}
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{
                        borderColor:     isComp ? '#4CAF50' : '#ABABAB',
                        backgroundColor: isComp ? '#4CAF50' : 'transparent',
                      }}
                    >
                      {isComp && <Check size={9} color="white" strokeWidth={3} />}
                    </button>
                    <span className={`text-[13px] flex-1 truncate transition-all duration-200 ${isComp ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                      {task.title}
                    </span>
                    <span className="text-[11px] text-text-secondary shrink-0">{dLabel}</span>
                    <span className="text-[10px] font-semibold shrink-0" style={{ color: PRIORITY_COLOR[task.priority] }}>
                      {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}
                    </span>
                  </div>
                );
              })}
              {todayExtra > 0 && (
                <p className="text-[11px] text-text-secondary mt-0.5">+{todayExtra}개 더</p>
              )}
            </div>
          )}
        </div>

      {/* ── Week strip ── */}
      <div className="flex-1 flex flex-col bg-surface rounded-[16px] px-4 py-4 min-h-0">
        {/* Nav */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <button onClick={() => setWeekStart((w) => subWeeks(w, 1))} className="p-1 text-text-secondary hover:text-text-primary">
            <ChevronLeft size={15} />
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
          <button onClick={() => setWeekStart((w) => addWeeks(w, 1))} className="p-1 text-text-secondary hover:text-text-primary">
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Day rows — spread evenly to fill available space */}
        <div className="flex-1 flex flex-col justify-between min-h-0">
          {otherDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const past    = isPast(day) && !isToday(day);
            const { evs, tsks } = getItems(dateStr);
            const total   = evs.length + tsks.length;
            const primary = evs[0] ?? tsks[0] ?? null;
            const extra   = total - 1;
            const isEvent = primary && 'type' in primary;
            const dotColor = isEvent
              ? (TYPE_COLOR[(primary as CalendarEvent).type] ?? '#9CA3AF')
              : '#9CA3AF';

            return (
              <div
                key={dateStr}
                className={`flex items-center gap-3 bg-background rounded-[10px] px-3 py-2 transition-opacity ${past ? 'opacity-40' : ''}`}
              >
                {/* Day label */}
                <span className={`text-[11px] font-bold w-9 shrink-0 ${past ? 'text-text-secondary' : 'text-text-primary'}`}>
                  {DAY_KO[day.getDay()]} {format(day, 'd')}
                </span>

                {total === 0 ? (
                  <span className="text-[12px] text-text-secondary">여유 ☀️</span>
                ) : primary ? (
                  <>
                    {/* Colored left indicator dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: isEvent ? dotColor : 'transparent', border: isEvent ? 'none' : `2px solid #ABABAB` }}
                    />
                    <span className="text-[12px] font-medium text-text-primary flex-1 truncate">{primary.title}</span>
                    {isEvent && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
                        style={{
                          backgroundColor: dotColor + '25',
                          color: dotColor,
                        }}
                      >
                        {TYPE_LABEL[(primary as CalendarEvent).type]}
                      </span>
                    )}
                    {extra > 0 && (
                      <span className="text-[10px] font-medium text-text-secondary shrink-0">+{extra}</span>
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
