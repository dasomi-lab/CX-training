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
        const pending = tasks.filter((t) => t.projectId === proj.id && t.status === 'todo').length;

        const statusText =
          daysLeft < 0 ? '기한 초과' :
          daysLeft === 0 ? 'D-day · 오늘 마감!' :
          `D-${daysLeft}${pending > 0 ? ` · ${pending}개 남음` : ' · 완료 임박'}`;

        return (
          <div key={proj.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-text-primary truncate max-w-[110px]">{proj.name}</span>
              <span className="text-[11px] font-bold text-text-primary">{proj.progress}%</span>
            </div>
            <ProgressBar value={proj.progress} color={cat?.color ?? '#D94040'} height={5} />
            <p className="text-[9px] text-text-secondary">{statusText}</p>
          </div>
        );
      })}
    </div>
  );
}
