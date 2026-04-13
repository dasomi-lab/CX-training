'use client';

import { useState } from 'react';
import Link from 'next/link';
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

const MON_START = { weekStartsOn: 1 as const };

function weekKey(d: Date) {
  return format(startOfWeek(d, MON_START), 'yyyy-MM-dd');
}

function dLabel(daysLeft: number): string {
  if (daysLeft === 0) return '오늘';
  if (daysLeft > 0)  return `D-${daysLeft}`;
  return `지연 ${Math.abs(daysLeft)}일`;
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

  /* ── All 7 days ── */
  const otherDays = days;

  /* ── Weekly progress ── */
  const weekDateStrs = new Set(days.map((d) => format(d, 'yyyy-MM-dd')));
  const weekTasks    = tasks.filter((t) => weekDateStrs.has(t.dueDate));
  const weekDone     = weekTasks.filter((t) => t.status === 'done').length;
  const weekTotal    = weekTasks.length;
  const weekPct      = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;

  /* ── Mini stats ── */
  const todayTaskCount  = todayTasks.length;
  const weekDeadlines   = events.filter((e) => weekDateStrs.has(e.date) && e.type === 'deadline').length;
  const weekMeetings    = events.filter((e) => weekDateStrs.has(e.date) && e.type === 'meeting').length;

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0">

      {/* ── Mini stats row ── */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        {[
          { label: '오늘 할 일', value: todayTaskCount,  color: '#D94040' },
          { label: '이번 주 마감', value: weekDeadlines, color: '#FF9800' },
          { label: '이번 주 회의', value: weekMeetings,  color: '#4CAF50' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface rounded-[12px] px-3 py-2 flex flex-col gap-0.5">
            <span className="text-[18px] font-bold" style={{ color }}>{value}</span>
            <span className="text-[9px] text-text-secondary leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Today card ── */}
      <div className="bg-[#FFF2F2] rounded-[16px] px-4 py-4 shrink-0 border border-accent/20">
        <p className="text-[12px] font-bold text-accent mb-3">
          오늘 &middot; {format(new Date(), 'M월 d일')} ({DAY_KO[new Date().getDay()]})
        </p>

        {todayAll.length === 0 ? (
          <p className="text-[13px] text-text-secondary">오늘 일정이 없어요 ☀️</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {todayVisible.map((item) => {
              /* CalendarEvent */
              if ('type' in item) {
                const ev = item as CalendarEvent;
                return (
                  <div key={ev.id} className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLOR[ev.type] ?? '#9CA3AF' }} />
                    <span className="text-[13px] text-text-primary flex-1 truncate">{ev.title}</span>
                    {ev.time && <span className="text-[11px] text-text-secondary shrink-0">{ev.time}</span>}
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 text-white"
                      style={{ backgroundColor: TYPE_COLOR[ev.type] ?? '#9CA3AF' }}
                    >
                      {TYPE_LABEL[ev.type]}
                    </span>
                  </div>
                );
              }

              /* Task */
              const task   = item as Task;
              const isComp = completing.has(task.id);
              const left   = differenceInDays(parseISO(task.dueDate), new Date());
              const label  = dLabel(left);
              const isLate = left < 0;
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-2.5 min-w-0 transition-all duration-500"
                  style={{ opacity: isComp ? 0 : 1, transform: isComp ? 'translateX(6px)' : 'none' }}
                >
                  <button
                    onClick={() => !isComp && handleCheck(task.id)}
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                    style={{
                      borderColor:     isComp ? '#4CAF50' : '#D94040',
                      backgroundColor: isComp ? '#4CAF50' : 'transparent',
                    }}
                  >
                    {isComp && <Check size={9} color="white" strokeWidth={3} />}
                  </button>
                  <span className={`text-[13px] flex-1 truncate transition-all duration-200 ${isComp ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                    {task.title}
                  </span>
                  <span className={`text-[11px] shrink-0 font-medium ${isLate ? 'text-accent' : 'text-text-secondary'}`}>{label}</span>
                  <span className="text-[10px] font-semibold shrink-0 text-text-secondary">
                    {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
              );
            })}
            {todayExtra > 0 && (
              <Link href="/tasks" className="text-[11px] text-accent font-semibold mt-0.5">
                +{todayExtra}개 더 보기 →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Week strip ── */}
      <div className="flex-1 flex flex-col bg-surface rounded-[16px] px-4 py-4 min-h-0">
        {/* Nav */}
        <div className="flex items-center justify-between mb-2 shrink-0">
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
            <span>{format(days[0], 'M.d')} — {format(days[6], 'M.d')}</span>
            {isThisWeek && (
              <span className="text-accent font-bold text-[11px]">· 오늘 {format(new Date(), 'd')}일</span>
            )}
          </button>
          <button onClick={() => setWeekStart((w) => addWeeks(w, 1))} className="p-1 text-text-secondary hover:text-text-primary">
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Weekly progress bar */}
        <div className="mb-2 shrink-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-text-secondary font-medium">
              {isThisWeek ? '이번 주 할 일' : '해당 주 할 일'}
            </span>
            <span className="text-[10px] font-bold text-text-primary">
              {weekTotal === 0 ? '없음' : `${weekDone}/${weekTotal} · ${weekPct}%`}
            </span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${weekPct}%`,
                backgroundColor: weekPct >= 80 ? '#4CAF50' : weekPct >= 40 ? '#FF9800' : '#D94040',
              }}
            />
          </div>
        </div>

        {/* Day rows */}
        <div className="flex-1 flex flex-col justify-between min-h-0">
          {otherDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isDay   = isToday(day);
            const past    = isPast(day) && !isDay;
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
                className={`flex items-center gap-3 rounded-[10px] px-3 py-2 border transition-opacity ${
                  isDay ? 'bg-accent/5 border-accent/40 shadow-sm'
                  : past ? 'opacity-65 bg-background border-border'
                  : 'bg-white border-border shadow-sm'
                }`}
              >
                <span className={`text-[12px] font-bold w-9 shrink-0 ${isDay ? 'text-accent' : past ? 'text-text-secondary' : 'text-text-primary'}`}>
                  {DAY_KO[day.getDay()]} {format(day, 'd')}
                </span>

                {total === 0 ? (
                  <span className="text-[12px] text-text-secondary font-medium">여유 ☀️</span>
                ) : primary ? (
                  <>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: isEvent ? dotColor : 'transparent', border: isEvent ? 'none' : `2px solid #ABABAB` }}
                    />
                    <span className="text-[12px] font-medium text-text-primary flex-1 truncate">{primary.title}</span>
                    {isEvent && !primary.title.includes(TYPE_LABEL[(primary as CalendarEvent).type]) && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 text-white"
                        style={{ backgroundColor: dotColor }}
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
