'use client';

import { useState } from 'react';
import { parseISO, isToday, isFuture, differenceInDays } from 'date-fns';
import { Check } from 'lucide-react';
import { Task } from '@/types';
import { useDataStore } from '@/store/useDataStore';
import { mockCategories, mockProjects } from '@/lib/mockData';

export default function TaskChecklist({ tasks }: { tasks: Task[] }) {
  const { toggleTask } = useDataStore();
  const [completing, setCompleting] = useState<Set<string>>(new Set());

  const catMap = Object.fromEntries(mockCategories.map((c) => [c.id, c]));
  const projMap = Object.fromEntries(mockProjects.map((p) => [p.id, p]));

  const upcoming = tasks
    .filter((t) => t.status === 'todo' && (isToday(parseISO(t.dueDate)) || isFuture(parseISO(t.dueDate))))
    .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
    .slice(0, 5);

  const handleCheck = (id: string) => {
    setCompleting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      toggleTask(id);
      setCompleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 600);
  };

  if (upcoming.length === 0) {
    return <p className="text-[11px] text-text-secondary text-center py-3">할 일 없음 🎉</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {upcoming.map((task) => {
        const proj = task.projectId ? projMap[task.projectId] : null;
        const cat = proj ? catMap[proj.categoryId] : null;
        const daysLeft = differenceInDays(parseISO(task.dueDate), new Date());
        const isUrgent = daysLeft === 0;
        const isSoon = daysLeft <= 2;
        const isCompleting = completing.has(task.id);

        const dotColor = isUrgent ? '#D94040' : isSoon ? '#FF9800' : '#EBEBEB';

        return (
          <div
            key={task.id}
            className="flex items-center gap-2 transition-all duration-500"
            style={{
              opacity: isCompleting ? 0 : 1,
              transform: isCompleting ? 'translateX(8px)' : 'none',
            }}
          >
            <button
              onClick={() => !isCompleting && handleCheck(task.id)}
              className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
              style={{
                borderColor: isCompleting ? '#4CAF50' : dotColor,
                backgroundColor: isCompleting ? '#4CAF50' : 'transparent',
                minWidth: 16, minHeight: 16,
              }}
            >
              {isCompleting && <Check size={10} color="white" strokeWidth={3} />}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className="text-[11px] font-medium truncate transition-all duration-200"
                style={{
                  color: isCompleting ? '#6B6B6B' : '#1A1A1A',
                  textDecoration: isCompleting ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </p>
              {cat && (
                <span className="text-[9px] font-medium" style={{ color: cat.color }}>{cat.name}</span>
              )}
            </div>
            <span
              className="text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: isUrgent ? '#D9404018' : isSoon ? '#FF980018' : 'transparent',
                color: isUrgent ? '#D94040' : isSoon ? '#FF9800' : '#6B6B6B',
              }}
            >
              {isUrgent ? 'D-day' : `D-${daysLeft}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
