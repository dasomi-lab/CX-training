'use client';

import WeekView from '@/components/home/WeekView';
import AddEventFab from '@/components/home/AddEventFab';
import { useDataStore } from '@/store/useDataStore';

export default function HomePage() {
  const { tasks, events } = useDataStore();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between px-4 pt-5 pb-2 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-accent leading-tight">Hate Monday</h1>
          <p className="text-[11px] text-text-secondary">Make Monday lighter</p>
        </div>
        <AddEventFab />
      </header>

      <div className="flex-1 overflow-hidden px-4 pb-4 flex flex-col">
        <WeekView events={events} tasks={tasks} />
      </div>
    </div>
  );
}
