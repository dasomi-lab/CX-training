import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-background rounded-[12px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-border ${onClick ? 'cursor-pointer hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)] transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
