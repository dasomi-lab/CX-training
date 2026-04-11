interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  height?: number;
}

export default function ProgressBar({ value, color = '#D94040', height = 6 }: ProgressBarProps) {
  return (
    <div className="w-full bg-surface rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}
