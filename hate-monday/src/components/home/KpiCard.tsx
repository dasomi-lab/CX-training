import { TrendingUp, TrendingDown, Minus, CheckSquare, CalendarClock, Target, AlertTriangle } from 'lucide-react';
import { Kpi } from '@/types';
import { LucideIcon } from 'lucide-react';

interface KpiConfig {
  icon: LucideIcon;
  color: string;
  label: string;
}

const KPI_CONFIG: Record<string, KpiConfig> = {
  'Tasks Today': { icon: CheckSquare,   color: '#3B82F6', label: '오늘 할 일' },
  'Deadlines':   { icon: CalendarClock, color: '#FF9800', label: '이번 주 마감' },
  'Goal':        { icon: Target,        color: '#4CAF50', label: '프로젝트 평균' },
  'Risk':        { icon: AlertTriangle, color: '#D94040', label: '위험 프로젝트' },
};

// 오늘 할 일 → 점 격자
function DotsVisual({ count, color }: { count: number; color: string }) {
  const shown = Math.min(count, 9);
  return (
    <div className="flex justify-center items-center h-[68px]">
      <div className="grid grid-cols-3 gap-[7px]">
        {Array.from({ length: shown }).map((_, i) => (
          <div key={i} className="w-[14px] h-[14px] rounded-full" style={{ backgroundColor: color }} />
        ))}
        {count > 9 && (
          <div className="w-[14px] h-[14px] rounded-full flex items-center justify-center"
               style={{ backgroundColor: color + '30' }}>
            <span style={{ fontSize: 7, color, fontWeight: 800 }}>+</span>
          </div>
        )}
      </div>
    </div>
  );
}

// 이번 주 마감 → 세로 바 차트 (마감 3개 강조)
const BAR_HEIGHTS = [48, 68, 38, 80, 55, 32, 62]; // 자연스러운 높이 변화
function BarsVisual({ count, color }: { count: number; color: string }) {
  return (
    <div className="flex items-end justify-center gap-[4px] h-[68px] px-1 pb-0.5">
      {BAR_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-[3px]"
          style={{
            height: `${h}%`,
            backgroundColor: i < count ? color : color + '22',
          }}
        />
      ))}
    </div>
  );
}

// 프로젝트 평균 → 원형 링 (% 데이터)
const CIRC = 2 * Math.PI * 26;
function RingVisual({ value, unit, color }: { value: number; unit?: string; color: string }) {
  const offset = CIRC * (1 - Math.min(value / 100, 1));
  return (
    <div className="flex justify-center items-center h-[68px]">
      <svg width="68" height="68" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r="26" fill="none" stroke={color + '22'} strokeWidth="5.5" />
        <circle cx="36" cy="36" r="26" fill="none" stroke={color} strokeWidth="5.5"
          strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
          transform="rotate(-90 36 36)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        <text x="36" y="40" textAnchor="middle" fontSize="15" fontWeight="700"
          fill={color} fontFamily="inherit">
          {value}{unit ?? ''}
        </text>
      </svg>
    </div>
  );
}

// 위험 프로젝트 → 대형 숫자 + 경고 점
function BigNumberVisual({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[68px] gap-1.5">
      <span style={{ fontSize: 46, fontWeight: 900, lineHeight: 1, color }}>{value}</span>
      <div className="flex gap-1.5">
        {Array.from({ length: Math.min(value, 5) }).map((_, i) => (
          <div key={i} className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: color + 'BB' }} />
        ))}
      </div>
    </div>
  );
}

function KpiVisual({ kpi, color }: { kpi: Kpi; color: string }) {
  switch (kpi.name) {
    case 'Tasks Today': return <DotsVisual count={kpi.value} color={color} />;
    case 'Deadlines':   return <BarsVisual count={kpi.value} color={color} />;
    case 'Goal':        return <RingVisual value={kpi.value} unit={kpi.unit} color={color} />;
    case 'Risk':        return <BigNumberVisual value={kpi.value} color={color} />;
    default:            return <RingVisual value={kpi.value} unit={kpi.unit} color={color} />;
  }
}

export default function KpiCard({ kpi }: { kpi: Kpi }) {
  const config = KPI_CONFIG[kpi.name];
  const color = config?.color ?? '#6B6B6B';
  const Icon = config?.icon ?? Minus;
  const label = config?.label ?? kpi.name;

  const TrendIcon =
    kpi.trend === 'up' ? TrendingUp :
    kpi.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    kpi.trend === 'up' ? '#4CAF50' :
    kpi.trend === 'down' ? '#D94040' : '#6B6B6B';

  return (
    <div className="bg-background rounded-[14px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-3 flex flex-col">
      {/* 상단: 아이콘 + 라벨 */}
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={13} style={{ color }} strokeWidth={2.2} />
        <p className="text-[11px] font-semibold leading-tight" style={{ color }}>{label}</p>
      </div>

      {/* 카드별 시각화 */}
      <KpiVisual kpi={kpi} color={color} />

      {/* 하단: 트렌드 */}
      <div className="flex items-center justify-center gap-1 mt-1">
        <TrendIcon size={11} style={{ color: trendColor }} />
        <span className="text-[10px] font-medium" style={{ color: trendColor }}>
          {kpi.trend === 'up' ? '상승' : kpi.trend === 'down' ? '하락' : '유지'}
        </span>
      </div>
    </div>
  );
}
