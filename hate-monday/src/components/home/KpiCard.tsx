import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Kpi } from '@/types';

const KPI_SUBTITLE: Record<string, string> = {
  'Tasks Today':  '오늘 처리해야 할 업무',
  'Deadlines':    '이번 주 마감 예정',
  'Goal':         '전체 프로젝트 평균',
  'Risk':         '지연 위험 프로젝트',
};

export default function KpiCard({ kpi }: { kpi: Kpi }) {
  const TrendIcon =
    kpi.trend === 'up' ? TrendingUp :
    kpi.trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    kpi.trend === 'up' ? 'text-success' :
    kpi.trend === 'down' ? 'text-accent' : 'text-text-secondary';

  const subtitle = KPI_SUBTITLE[kpi.name] ?? '';

  return (
    <div className="bg-background rounded-[12px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-3 flex flex-col gap-1">
      <div className="flex items-start justify-between">
        <p className="text-[11px] text-text-secondary font-medium leading-tight">{kpi.name}</p>
        <TrendIcon size={14} className={trendColor} />
      </div>
      <p className="text-2xl font-bold text-text-primary leading-none">
        {kpi.value}{kpi.unit ?? ''}
      </p>
      {subtitle && (
        <p className="text-[10px] text-text-secondary leading-tight">{subtitle}</p>
      )}
    </div>
  );
}
