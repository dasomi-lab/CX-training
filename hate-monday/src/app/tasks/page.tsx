'use client';

import { useState } from 'react';
import { isToday, parseISO, isFuture, isPast, differenceInDays } from 'date-fns';
import { Check } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { mockProjects, mockCategories } from '@/lib/mockData';
import { Task } from '@/types';

type TabKey = '지연' | '오늘' | '예정' | '완료';

const PRIORITY_COLOR: Record<string, string> = {
  high: '#D94040', medium: '#FF9800', low: '#4CAF50',
};
const PRIORITY_LABEL: Record<string, string> = {
  high: '높음', medium: '보통', low: '낮음',
};

const projMap = Object.fromEntries(mockProjects.map((p) => [p.id, p]));
const catMap  = Object.fromEntries(mockCategories.map((c) => [c.id, c]));

function getFiltered(tasks: Task[], tab: TabKey): Task[] {
  switch (tab) {
    case '지연':
      return tasks
        .filter((t) => t.status === 'todo' && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)))
        .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
    case '오늘':
      return tasks
        .filter((t) => t.status === 'todo' && isToday(parseISO(t.dueDate)))
        .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] ?? 1) - ({ high: 0, medium: 1, low: 2 }[b.priority] ?? 1));
    case '예정':
      return tasks
        .filter((t) => t.status === 'todo' && isFuture(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)))
        .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
    case '완료':
      return tasks
        .filter((t) => t.status === 'done')
        .sort((a, b) => parseISO(b.dueDate).getTime() - parseISO(a.dueDate).getTime());
  }
}

const EMPTY_MSG: Record<TabKey, string> = {
  '지연': '지연된 태스크가 없습니다 👍',
  '오늘': '오늘 할 일이 없습니다.',
  '예정': '예정된 태스크가 없습니다.',
  '완료': '완료된 태스크가 없습니다.',
};

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('오늘');
  const [completing, setCompleting] = useState<Set<string>>(new Set());
  const { tasks, toggleTask } = useDataStore();

  const handleCheck = (id: string) => {
    setCompleting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      toggleTask(id);
      setCompleting((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }, 600);
  };

  const filtered = getFiltered(tasks, activeTab);
  const tabs: TabKey[] = ['지연', '오늘', '예정', '완료'];

  const overdueCount = tasks.filter(
    (t) => t.status === 'todo' && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate))
  ).length;

  return (
    <div className="flex flex-col px-4 pt-5 pb-4">
      <h1 className="text-xl font-bold text-text-primary mb-4">할 일</h1>

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex-1 ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab}
            {tab === '지연' && overdueCount > 0 && (
              <span className="ml-1 text-[10px] font-bold bg-accent text-white px-1 py-0.5 rounded-full leading-none">
                {overdueCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-text-secondary">
            <p className="text-sm">{EMPTY_MSG[activeTab]}</p>
          </div>
        ) : (
          filtered.map((task) => {
            const proj = task.projectId ? projMap[task.projectId] : null;
            const cat  = proj ? catMap[proj.categoryId] : null;
            const isCompleting = completing.has(task.id);
            const daysLeft = differenceInDays(parseISO(task.dueDate), new Date());
            const isOverdue = activeTab === '지연';

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 bg-background rounded-[12px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] px-3.5 py-3 transition-all duration-500"
                style={{ opacity: isCompleting ? 0 : 1, transform: isCompleting ? 'translateX(8px)' : 'none' }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => !isCompleting && task.status !== 'done' && handleCheck(task.id)}
                  className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{
                    borderColor: isCompleting ? '#4CAF50' : task.status === 'done' ? '#4CAF50' : isOverdue ? '#D94040' : '#EBEBEB',
                    backgroundColor: isCompleting || task.status === 'done' ? '#4CAF50' : 'transparent',
                  }}
                >
                  {(isCompleting || task.status === 'done') && (
                    <Check size={10} color="white" strokeWidth={3} />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-snug transition-all duration-200 ${
                    task.status === 'done' || isCompleting ? 'line-through text-text-secondary' : 'text-text-primary'
                  }`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {proj && cat && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: cat.color + '20', color: cat.color }}
                      >
                        {proj.name.slice(0, 12)}
                      </span>
                    )}
                    <span className="text-[10px] text-text-secondary">
                      {isOverdue ? `D+${Math.abs(daysLeft)}` : daysLeft === 0 ? 'D-day' : `D-${daysLeft}`}
                    </span>
                  </div>
                </div>

                {/* Priority */}
                {task.status !== 'done' && (
                  <span className="text-[10px] font-semibold shrink-0" style={{ color: PRIORITY_COLOR[task.priority] }}>
                    {PRIORITY_LABEL[task.priority]}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
