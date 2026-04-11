import Link from 'next/link';
import { differenceInDays, parseISO } from 'date-fns';
import { Project, Category, Task } from '@/types';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';

interface ProjectCardProps {
  project: Project;
  category: Category;
  tasks: Task[];
}

export default function ProjectCard({ project, category, tasks }: ProjectCardProps) {
  const daysLeft = differenceInDays(parseISO(project.endDate), new Date());
  const pending = tasks.filter((t) => t.projectId === project.id && t.status === 'todo').length;

  const statusLabel: Record<string, string> = {
    active: '진행중',
    completed: '완료',
    on_hold: '보류',
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-background rounded-[12px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3 hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)] transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-text-primary leading-snug">{project.name}</h3>
          <Badge color={category.color}>{statusLabel[project.status]}</Badge>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-secondary">진행률</span>
            <span className="text-[11px] font-bold text-text-primary">{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} color={category.color} />
        </div>

        <div className="flex items-center justify-between text-[11px] text-text-secondary">
          <span>
            {daysLeft >= 0
              ? `D-${daysLeft === 0 ? 'day' : daysLeft}`
              : `D+${Math.abs(daysLeft)}`}
          </span>
          <span>{pending}개 미완료</span>
        </div>
      </div>
    </Link>
  );
}
