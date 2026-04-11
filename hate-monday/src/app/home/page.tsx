'use client';

import KpiGrid from '@/components/home/KpiGrid';
import WeeklyLoadChart from '@/components/home/WeeklyLoadChart';
import MiniCalendar from '@/components/home/MiniCalendar';
import ProgressSection from '@/components/home/ProgressSection';
import AddEventFab from '@/components/home/AddEventFab';
import { useDataStore } from '@/store/useDataStore';
import { mockKpis, mockProjects, mockCategories } from '@/lib/mockData';

export default function HomePage() {
  const { tasks, events } = useDataStore();

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-text-primary leading-tight">Hate Monday</h1>
          <p className="text-[11px] text-text-secondary">Make Monday lighter</p>
        </div>
        <AddEventFab />
      </header>

      {/* Scrollable content inside fixed height */}
      <div className="flex-1 overflow-y-auto px-4 pb-3 flex flex-col gap-3">
        {/* KPI Cards */}
        <KpiGrid kpis={mockKpis} />

        {/* Weekly Load Chart */}
        <div className="bg-background rounded-[12px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-3">
          <p className="text-[11px] font-semibold text-text-secondary mb-1 uppercase tracking-wide">Weekly Load</p>
          <div className="h-28">
            <WeeklyLoadChart tasks={tasks} />
          </div>
        </div>

        {/* Progress + Mini Calendar side by side */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-background rounded-[12px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-3">
            <p className="text-[11px] font-semibold text-text-secondary mb-2 uppercase tracking-wide">Projects</p>
            <ProgressSection projects={mockProjects} categories={mockCategories} />
          </div>
          <div className="bg-background rounded-[12px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-3">
            <MiniCalendar events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
