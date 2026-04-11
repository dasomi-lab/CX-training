import ProgressBar from '@/components/ui/ProgressBar';
import { Project } from '@/types';
import { Category } from '@/types';

interface ProgressSectionProps {
  projects: Project[];
  categories: Category[];
}

export default function ProgressSection({ projects, categories }: ProgressSectionProps) {
  // Show up to 3 active projects with highest progress
  const top = [...projects]
    .filter((p) => p.status === 'active')
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-2">
      {top.map((proj) => {
        const cat = catMap[proj.categoryId];
        return (
          <div key={proj.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-text-primary truncate max-w-[130px]">{proj.name}</span>
              <span className="text-[11px] font-bold text-text-primary">{proj.progress}%</span>
            </div>
            <ProgressBar value={proj.progress} color={cat?.color ?? '#D94040'} height={5} />
          </div>
        );
      })}
    </div>
  );
}
