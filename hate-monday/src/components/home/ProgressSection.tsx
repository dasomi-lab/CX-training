import ProgressBar from '@/components/ui/ProgressBar';
import { Project, Category, Task } from '@/types';
import { differenceInDays, parseISO } from 'date-fns';

interface ProgressSectionProps {
  projects: Project[];
  categories: Category[];
  tasks?: Task[];
}

export default function ProgressSection({ projects, categories, tasks = [] }: ProgressSectionProps) {
  const top = [...projects]
    .filter((p) => p.status === 'active')
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-2.5">
      {top.map((proj) => {
        const cat = catMap[proj.categoryId];
        const daysLeft = differenceInDays(parseISO(proj.endDate), new Date());
        const pendingTasks = tasks
          .filter((t) => t.projectId === proj.id && t.status === 'todo')
          .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
        const pending = pendingTasks.length;
        const nextTask = pendingTasks[0];

        const statusText =
          daysLeft < 0 ? '기한 초과' :
          daysLeft === 0 ? 'D-day' :
          `D-${daysLeft}${pending > 0 ? ` · ${pending}개 남음` : ''}`;

        return (
          <div key={proj.id} className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-text-primary truncate max-w-[100px]">{proj.name}</span>
              <span className="text-[11px] font-bold text-text-primary">{proj.progress}%</span>
            </div>
            <ProgressBar value={proj.progress} color={cat?.color ?? '#D94040'} height={4} />
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] text-text-secondary">{statusText}</span>
              {nextTask && (
                <span className="text-[9px] text-text-secondary truncate max-w-[90px] text-right">
                  → {nextTask.title}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
