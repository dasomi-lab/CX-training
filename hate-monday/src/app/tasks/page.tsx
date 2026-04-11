'use client';

import { useState } from 'react';
import { format, isToday, parseISO, isFuture, isPast } from 'date-fns';
import { useDataStore } from '@/store/useDataStore';
import { mockProjects, mockCategories } from '@/lib/mockData';
import { Task } from '@/types';

type TabKey = 'Today' | 'Upcoming' | 'Done';

const PRIORITY_COLOR: Record<string, string> = {
  high: '#D94040',
  medium: '#FF9800',
  low: '#4CAF50',
};
const PRIORITY_LABEL: Record<string, string> = {
  high: 'High', medium: 'Med', low: 'Low',
};

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('Today');
  const { tasks, toggleTask } = useDataStore();

  const projMap = Object.fromEntries(mockProjects.map((p) => [p.id, p]));
  const catMap = Object.fromEntries(mockCategories.map((c) => [c.id, c]));

  const filtered = tasks.filter((t) => {
    if (activeTab === 'Today') return t.status === 'todo' && isToday(parseISO(t.dueDate));
    if (activeTab === 'Upcoming') return t.status === 'todo' && isFuture(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate));
    return t.status === 'done';
  }).sort((a, b) => {
    if (activeTab === 'Done') return parseISO(b.dueDate).getTime() - parseISO(a.dueDate).getTime();
    const pc: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return pc[a.priority] - pc[b.priority];
  });

  const tabs: TabKey[] = ['Today', 'Upcoming', 'Done'];

  return (
    <div className="min-h-[calc(100dvh-64px)] flex flex-col px-4 pt-5 pb-4">
      <h1 className="text-xl font-bold text-text-primary mb-4">Tasks</h1>

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-text-secondary">
            <p className="text-sm">
              {activeTab === 'Today' ? '오늘 할 일이 없습니다.' :
               activeTab === 'Upcoming' ? '예정된 태스크가 없습니다.' :
               '완료된 태스크가 없습니다.'}
            </p>
          </div>
        ) : (
          filtered.map((task) => {
            const proj = task.projectId ? projMap[task.projectId] : null;
            const cat = proj ? catMap[proj.categoryId] : null;

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 bg-background rounded-[12px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] px-3.5 py-3"
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    task.status === 'done'
                      ? 'bg-success border-success'
                      : 'border-border hover:border-accent'
                  }`}
                  style={{ width: 18, height: 18 }}
                >
                  {task.status === 'done' && (
                    <svg viewBox="0 0 10 8" className="w-2.5 fill-white" strokeWidth="0">
                      <polyline points="1,4 4,7 9,1" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-snug ${
                    task.status === 'done' ? 'line-through text-text-secondary' : 'text-text-primary'
                  }`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-text-secondary">{task.dueDate}</span>
                    {proj && cat && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: cat.color + '20', color: cat.color }}
                      >
                        {proj.name.slice(0, 12)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Priority dot */}
                <div className="flex flex-col items-end gap-0.5">
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: PRIORITY_COLOR[task.priority] }}
                  >
                    {PRIORITY_LABEL[task.priority]}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
