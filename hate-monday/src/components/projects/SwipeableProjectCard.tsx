'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { differenceInDays, parseISO } from 'date-fns';
import { Trash2, CalendarPlus } from 'lucide-react';
import { Project, Category, Task } from '@/types';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import { useDataStore } from '@/store/useDataStore';

interface SwipeableProjectCardProps {
  project: Project;
  category: Category;
  tasks: Task[];
}

const SWIPE_THRESHOLD = 50;
const ACTION_WIDTH = 130;

export default function SwipeableProjectCard({ project, category, tasks }: SwipeableProjectCardProps) {
  const router = useRouter();
  const { deleteProject } = useDataStore();

  const [offset, setOffset] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const daysLeft = differenceInDays(parseISO(project.endDate), new Date());
  const pending = tasks.filter((t) => t.projectId === project.id && t.status === 'todo').length;

  const statusLabel: Record<string, string> = {
    active: '진행중', completed: '완료', on_hold: '보류',
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Ignore mostly-vertical scrolls
    if (!isDragging.current && Math.abs(dy) > Math.abs(dx)) return;
    isDragging.current = true;

    if (revealed) {
      // Already revealed: allow sliding back right
      const newOffset = Math.min(0, -ACTION_WIDTH + Math.max(0, dx));
      setOffset(newOffset);
    } else {
      // Not revealed: only allow sliding left
      const newOffset = Math.min(0, dx);
      setOffset(newOffset);
    }
  };

  const onTouchEnd = () => {
    if (!isDragging.current) return;

    if (revealed) {
      // If swiped back enough, close
      if (offset > -ACTION_WIDTH + SWIPE_THRESHOLD) {
        setOffset(0);
        setRevealed(false);
      } else {
        setOffset(-ACTION_WIDTH);
      }
    } else {
      // If swiped left enough, reveal
      if (offset < -SWIPE_THRESHOLD) {
        setOffset(-ACTION_WIDTH);
        setRevealed(true);
      } else {
        setOffset(0);
      }
    }
  };

  const handleCardClick = () => {
    if (revealed) {
      setOffset(0);
      setRevealed(false);
      return;
    }
    router.push(`/projects/${project.id}`);
  };

  const handleAddSchedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/upload?projectId=${project.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      deleteProject(project.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[12px]">
      {/* Action buttons (behind the card) */}
      <div
        className="absolute inset-y-0 right-0 flex items-stretch"
        style={{ width: ACTION_WIDTH }}
      >
        <button
          onClick={handleAddSchedule}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-[#D0D0D0] text-white text-[11px] font-semibold"
        >
          <CalendarPlus size={18} />
          일정 추가
        </button>
        <button
          onClick={handleDelete}
          className={`flex-1 flex flex-col items-center justify-center gap-1 text-white text-[11px] font-semibold transition-colors ${
            confirmDelete ? 'bg-red-700' : 'bg-accent'
          }`}
        >
          <Trash2 size={18} />
          {confirmDelete ? '확인!' : '삭제'}
        </button>
      </div>

      {/* Card */}
      <div
        className="relative bg-background border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3 cursor-pointer select-none"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.25s ease',
          borderRadius: 12,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleCardClick}
      >
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
            {daysLeft >= 0 ? `D-${daysLeft === 0 ? 'day' : daysLeft}` : `D+${Math.abs(daysLeft)}`}
          </span>
          <span>{pending}개 미완료</span>
        </div>
      </div>
    </div>
  );
}
