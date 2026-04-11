'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { mockCategories, mockTasks } from '@/lib/mockData';
import SwipeableProjectCard from '@/components/projects/SwipeableProjectCard';
import { useDataStore } from '@/store/useDataStore';
import { Project } from '@/types';

const today = new Date().toISOString().split('T')[0];

export default function ProjectsPage() {
  const { projects, addProject } = useDataStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    categoryId: mockCategories[0].id,
    startDate: today,
    endDate: '',
    status: 'active' as Project['status'],
  });

  const grouped = mockCategories.map((cat) => ({
    cat,
    projects: projects.filter((p) => p.categoryId === cat.id),
  }));

  const handleAdd = () => {
    if (!form.name.trim() || !form.endDate) return;
    addProject({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      categoryId: form.categoryId,
      status: form.status,
      progress: 0,
      startDate: form.startDate,
      endDate: form.endDate,
    });
    setForm({ name: '', categoryId: mockCategories[0].id, startDate: today, endDate: '', status: 'active' });
    setShowForm(false);
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] px-4 pt-5 pb-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-text-primary">Projects</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-accent-hover transition-colors"
        >
          <Plus size={14} /> New Project
        </button>
      </div>

      <p className="text-[11px] text-text-secondary mb-4">← 카드를 왼쪽으로 밀면 일정 추가 · 삭제</p>

      <div className="flex flex-col gap-5">
        {grouped.map(({ cat, projects: catProjects }) =>
          catProjects.length === 0 ? null : (
            <section key={cat.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{cat.name}</h2>
              </div>
              <div className="flex flex-col gap-3">
                {catProjects.map((project) => (
                  <SwipeableProjectCard key={project.id} project={project} category={cat} tasks={mockTasks} />
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

      {/* New Project 모달 */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowForm(false)} />
          <div className="relative bg-background rounded-t-[20px] sm:rounded-[16px] w-full max-w-md p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary">New Project</h3>
              <button onClick={() => setShowForm(false)} className="text-text-secondary">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* 프로젝트명 */}
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1 block">프로젝트명 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="예: 2분기 마케팅 캠페인"
                  className="w-full text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary placeholder:text-border focus:outline-none focus:border-accent"
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1 block">카테고리</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="w-full text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                >
                  {mockCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* 상태 */}
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1 block">상태</label>
                <div className="flex gap-2">
                  {[
                    { value: 'active', label: '진행중' },
                    { value: 'on_hold', label: '보류' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setForm((f) => ({ ...f, status: value as Project['status'] }))}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-[8px] border transition-colors ${
                        form.status === value
                          ? 'bg-accent text-white border-accent'
                          : 'bg-background border-border text-text-secondary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 시작일 / 마감일 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">시작일</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full text-sm bg-background border border-border rounded-[8px] px-2 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">마감일 *</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full text-sm bg-background border border-border rounded-[8px] px-2 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!form.name.trim() || !form.endDate}
                className="w-full bg-accent text-white text-sm font-bold py-2.5 rounded-[10px] hover:bg-accent-hover transition-colors disabled:opacity-40 mt-1"
              >
                프로젝트 추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
