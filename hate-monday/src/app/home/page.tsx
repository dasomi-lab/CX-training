'use client';

import KpiGrid from '@/components/home/KpiGrid';
import TaskChecklist from '@/components/home/TaskChecklist';
import MiniCalendar from '@/components/home/MiniCalendar';
import ProgressSection from '@/components/home/ProgressSection';
import AddEventFab from '@/components/home/AddEventFab';
import { useDataStore } from '@/store/useDataStore';
import { mockKpis, mockProjects, mockCategories } from '@/lib/mockData';

export default function HomePage() {
  const { tasks, events } = useDataStore();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-accent leading-tight">Hate Monday</h1>
          <p className="text-[11px] text-text-secondary">Make Monday lighter</p>
        </div>
        <AddEventFab />
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-3 flex flex-col gap-3">
        {/* KPI Cards */}
        <KpiGrid kpis={mockKpis} />

        {/* Mini Calendar */}
        <div className="bg-background rounded-[12px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-3">
          <MiniCalendar events={events} tasks={tasks} />
        </div>

        {/* Projects + Task Checklist */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-background rounded-[12px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-3">
            <p className="text-[11px] font-semibold text-text-secondary mb-2 uppercase tracking-wide">Projects</p>
            <ProgressSection projects={mockProjects} categories={mockCategories} tasks={tasks} />
          </div>
          <div className="bg-background rounded-[12px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-3">
            <p className="text-[11px] font-semibold text-text-secondary mb-2 uppercase tracking-wide">할 일</p>
            <TaskChecklist tasks={tasks} />
          </div>
        </div>
      </div>
    </div>
  );
}
