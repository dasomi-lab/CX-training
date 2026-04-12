'use client';

import { useState } from 'react';
import { parseISO, isToday, isFuture, isPast, differenceInDays } from 'date-fns';
import { Check } from 'lucide-react';
import { Task } from '@/types';
import { useDataStore } from '@/store/useDataStore';
import { mockCategories, mockProjects } from '@/lib/mockData';

const catMap = Object.fromEntries(mockCategories.map((c) => [c.id, c]));
const projMap = Object.fromEntries(mockProjects.map((p) => [p.id, p]));

function TaskRow({ task, onCheck }: { task: Task; onCheck: (id: string) => void }) {
  const proj = task.projectId ? projMap[task.projectId] : null;
  const cat = proj ? catMap[proj.categoryId] : null;
  const daysLeft = differenceInDays(parseISO(task.dueDate), new Date());
  const isOverdue = isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
  const dotColor = isOverdue ? '#D94040' : daysLeft === 0 ? '#D94040' : daysLeft <= 2 ? '#FF9800' : '#EBEBEB';

  return (
    <div className="flex items-center gap-1.5 transition-all duration-500">
      <button
        onClick={() => onCheck(task.id)}
        className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
        style={{ borderColor: dotColor, minWidth: 16, minHeight: 16 }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-text-primary truncate">{task.title}</p>
        {cat && <span className="text-[9px] font-medium" style={{ color: cat.color }}>{cat.name}</span>}
      </div>
      {isOverdue ? (
        <span className="text-[9px] font-bold shrink-0 px-1 py-0.5 rounded-full bg-[#D9404018] text-[#D94040]">
          D+{Math.abs(daysLeft)}
        </span>
      ) : (
        <span className="text-[10px] font-bold shrink-0" style={{ color: daysLeft === 0 ? '#D94040' : daysLeft <= 2 ? '#FF9800' : '#6B6B6B' }}>
          {daysLeft === 0 ? 'D-day' : `D-${daysLeft}`}
        </span>
      )}
    </div>
  );
}

export default function TaskChecklist({ tasks }: { tasks: Task[] }) {
  const { toggleTask } = useDataStore();
  const [completing, setCompleting] = useState<Set<string>>(new Set());

  const handleCheck = (id: string) => {
    setCompleting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      toggleTask(id);
      setCompleting((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }, 600);
  };

  const todo = tasks.filter((t) => t.status === 'todo' && !completing.has(t.id));
  const overdue  = todo.filter((t) => isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)))
                       .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
  const todayTasks = todo.filter((t) => isToday(parseISO(t.dueDate)));
  const upcoming   = todo.filter((t) => isFuture(parseISO(t.dueDate)))
                         .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
                         .slice(0, 3);

  if (todo.length === 0) {
    return <p className="text-[11px] text-text-secondary text-center py-3">할 일 없음 🎉</p>;
  }

  const Section = ({ label, color, items, max = 3 }: { label: string; color: string; items: Task[]; max?: number }) => {
    if (items.length === 0) return null;
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color }}>{label}</p>
        {items.slice(0, max).map((task) => (
          <TaskRow key={task.id} task={task} onCheck={handleCheck} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2.5">
      <Section label="지연" color="#D94040" items={overdue} max={2} />
      <Section label="오늘" color="#FF9800" items={todayTasks} max={3} />
      <Section label="예정" color="#6B6B6B" items={upcoming} max={2} />
    </div>
  );
}
