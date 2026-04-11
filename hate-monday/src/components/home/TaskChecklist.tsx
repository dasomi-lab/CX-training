'use client';

import { parseISO, isToday, isFuture, differenceInDays } from 'date-fns';
import { Task } from '@/types';
import { useDataStore } from '@/store/useDataStore';
import { mockCategories, mockProjects } from '@/lib/mockData';

export default function TaskChecklist({ tasks }: { tasks: Task[] }) {
  const { toggleTask } = useDataStore();

  const catMap = Object.fromEntries(mockCategories.map((c) => [c.id, c]));
  const projMap = Object.fromEntries(mockProjects.map((p) => [p.id, p]));

  const upcoming = tasks
    .filter((t) => t.status === 'todo' && (isToday(parseISO(t.dueDate)) || isFuture(parseISO(t.dueDate))))
    .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
    .slice(0, 5);

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

        return (
          <div key={task.id} className="flex items-center gap-2">
            <button
              onClick={() => toggleTask(task.id)}
              className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors hover:border-accent"
              style={{
                borderColor: isUrgent ? '#D94040' : isSoon ? '#FF9800' : '#EBEBEB',
                minWidth: 16, minHeight: 16,
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-text-primary truncate">{task.title}</p>
              {cat && (
                <span className="text-[9px] font-medium" style={{ color: cat.color }}>{cat.name}</span>
              )}
            </div>
            {/* D-day 강조 */}
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
