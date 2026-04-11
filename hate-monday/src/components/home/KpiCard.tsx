import { TrendingUp, TrendingDown, Minus, CheckSquare, CalendarClock, Target, AlertTriangle } from 'lucide-react';
import { Kpi } from '@/types';
import { LucideIcon } from 'lucide-react';

const CIRCUMFERENCE = 2 * Math.PI * 26; // r=26 → ~163.4

interface KpiConfig {
  icon: LucideIcon;
  color: string;
  label: string;
  progress: number | null; // null = value/100
}

const KPI_CONFIG: Record<string, KpiConfig> = {
  'Tasks Today': { icon: CheckSquare,   color: '#3B82F6', label: '오늘 할 일',    progress: 0.75 },
  'Deadlines':   { icon: CalendarClock, color: '#FF9800', label: '이번 주 마감',  progress: 0.45 },
  'Goal':        { icon: Target,        color: '#4CAF50', label: '프로젝트 평균', progress: null },
  'Risk':        { icon: AlertTriangle, color: '#D94040', label: '위험 프로젝트', progress: 0.30 },
};

export default function KpiCard({ kpi }: { kpi: Kpi }) {
  const config = KPI_CONFIG[kpi.name];
  const color = config?.color ?? '#6B6B6B';
  const Icon = config?.icon ?? Minus;
  const label = config?.label ?? kpi.name;
  const progress = config?.progress !== null && config?.progress !== undefined
    ? config.progress
    : kpi.value / 100;

  const offset = CIRCUMFERENCE * (1 - Math.min(Math.max(progress, 0), 1));

  const TrendIcon =
    kpi.trend === 'up' ? TrendingUp :
    kpi.trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    kpi.trend === 'up' ? '#4CAF50' :
    kpi.trend === 'down' ? '#D94040' : '#6B6B6B';

  return (
    <div className="bg-background rounded-[14px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-3 flex flex-col">
      {/* 상단: 아이콘 + 라벨 */}
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={13} style={{ color }} strokeWidth={2.2} />
        <p className="text-[11px] font-semibold leading-tight" style={{ color }}>{label}</p>
      </div>

      {/* 원형 링 */}
      <div className="flex justify-center items-center">
        <svg width="72" height="72" viewBox="0 0 72 72">
          {/* 배경 링 */}
          <circle
            cx="36" cy="36" r="26"
            fill="none"
            stroke={color + '22'}
            strokeWidth="5.5"
          />
          {/* 진행 링 */}
          <circle
            cx="36" cy="36" r="26"
            fill="none"
            stroke={color}
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 36 36)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          {/* 중앙 숫자 */}
          <text
            x="36" y="39"
            textAnchor="middle"
            fontSize="17"
            fontWeight="700"
            fill={color}
            fontFamily="inherit"
          >
            {kpi.value}{kpi.unit ?? ''}
          </text>
        </svg>
      </div>

      {/* 하단: 트렌드 */}
      <div className="flex items-center justify-center gap-1 mt-1.5">
        <TrendIcon size={11} style={{ color: trendColor }} />
        <span className="text-[10px] font-medium" style={{ color: trendColor }}>
          {kpi.trend === 'up' ? '상승' : kpi.trend === 'down' ? '하락' : '유지'}
        </span>
      </div>
    </div>
  );
}
