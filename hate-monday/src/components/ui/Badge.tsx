interface BadgeProps {
  children: React.ReactNode;
  color?: string; // hex
  variant?: 'default' | 'outline';
}

export default function Badge({ children, color, variant = 'default' }: BadgeProps) {
  if (color) {
    const bg = color + '20'; // 12% opacity
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
        style={{ backgroundColor: bg, color }}
      >
        {children}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
      variant === 'outline'
        ? 'border border-border text-text-secondary'
        : 'bg-surface text-text-secondary'
    }`}>
      {children}
    </span>
  );
}
