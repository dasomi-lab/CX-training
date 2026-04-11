'use client';

import { Plus } from 'lucide-react';
import { mockCategories, mockTasks } from '@/lib/mockData';
import SwipeableProjectCard from '@/components/projects/SwipeableProjectCard';
import { useDataStore } from '@/store/useDataStore';

export default function ProjectsPage() {
  const { projects } = useDataStore();

  const grouped = mockCategories.map((cat) => ({
    cat,
    projects: projects.filter((p) => p.categoryId === cat.id),
  }));

  return (
    <div className="min-h-[calc(100dvh-64px)] px-4 pt-5 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-text-primary">Projects</h1>
        <button className="flex items-center gap-1.5 bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-accent-hover transition-colors">
          <Plus size={14} />
          New Project
        </button>
      </div>

      {/* 스와이프 안내 */}
      <p className="text-[11px] text-text-secondary mb-4">← 카드를 왼쪽으로 밀면 일정 추가 · 삭제</p>

      <div className="flex flex-col gap-5">
        {grouped.map(({ cat, projects }) =>
          projects.length === 0 ? null : (
            <section key={cat.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  {cat.name}
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {projects.map((project) => (
                  <SwipeableProjectCard
                    key={project.id}
                    project={project}
                    category={cat}
                    tasks={mockTasks}
                  />
                ))}
              </div>
            </section>
          )
        )}

        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
            <p className="text-sm">프로젝트가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
