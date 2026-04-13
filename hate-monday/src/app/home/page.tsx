'use client';

import { useMemo, useState } from 'react';
import WeekView from '@/components/home/WeekView';
import AddEventFab from '@/components/home/AddEventFab';
import KpiGrid from '@/components/home/KpiGrid';
import WeeklyLoadChart from '@/components/home/WeeklyLoadChart';
import { useDataStore } from '@/store/useDataStore';
import { mockProjects } from '@/lib/mockData';
import { Kpi } from '@/types';
import { Download } from 'lucide-react';

export default function HomePage() {
  const { tasks, events } = useDataStore();
  const [modelFilter, setModelFilter] = useState<string>('all');

  const filteredTasks = useMemo(
    () => tasks.filter((task) => modelFilter === 'all' || task.projectId === modelFilter),
    [tasks, modelFilter],
  );

  const filteredEvents = useMemo(
    () => events.filter((event) => modelFilter === 'all' || event.projectId === modelFilter),
    [events, modelFilter],
  );

  const kpis = useMemo<Kpi[]>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const tasksToday = filteredTasks.filter((t) => t.status === 'todo' && t.dueDate === today).length;
    const deadlines = filteredEvents.filter((e) => e.type === 'deadline').length;
    const totalTasks = filteredTasks.length;
    const doneTasks = filteredTasks.filter((t) => t.status === 'done').length;
    const goalRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const risk = filteredTasks.filter((t) => t.status === 'todo' && t.priority === 'high').length;

    return [
      { id: 'kpi-1', name: 'Tasks Today', value: tasksToday, trend: 'flat' },
      { id: 'kpi-2', name: 'Deadlines', value: deadlines, trend: 'flat' },
      { id: 'kpi-3', name: 'Goal', value: goalRate, unit: '%', trend: 'up' },
      { id: 'kpi-4', name: 'Risk', value: risk, trend: risk > 0 ? 'up' : 'down' },
    ];
  }, [filteredTasks, filteredEvents]);

  const handleDownloadPdf = () => {
    const targetProject = mockProjects.find((p) => p.id === modelFilter);
    const modelName = modelFilter === 'all' ? 'All Models' : targetProject?.name ?? 'Unknown Model';
    const lines = [
      'Weekly CS Dashboard Report',
      `Model: ${modelName}`,
      `Generated: ${new Date().toISOString().slice(0, 10)}`,
      '',
      ...kpis.map((kpi) => `${kpi.name}: ${kpi.value}${kpi.unit ?? ''}`),
    ];

    const pdfLines = lines
      .map((line, idx) => `BT /F1 12 Tf 50 ${780 - idx * 22} Td (${line.replace(/[()\\]/g, '\\$&')}) Tj ET`)
      .join('\n');

    const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length ${pdfLines.length} >> stream
${pdfLines}
endstream endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000118 00000 n 
0000000244 00000 n 
0000000314 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
${350 + pdfLines.length}
%%EOF`;

    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weekly-cs-dashboard-${new Date().toISOString().slice(0, 10)}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between px-4 pt-5 pb-2 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-accent leading-tight">Weekly CS Dashboard</h1>
          <p className="text-[11px] text-text-secondary">Model-focused KPI recap</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="bg-accent text-white text-xs font-semibold px-3 py-2 rounded-[10px] flex items-center gap-1.5"
          >
            <Download size={13} /> PDF 저장
          </button>
          <AddEventFab />
        </div>
      </header>

      <div className="px-4 pb-2 shrink-0">
        <div className="bg-surface/80 backdrop-blur-sm rounded-[12px] p-2.5">
          <p className="text-[11px] font-semibold text-text-secondary mb-2">모델 필터</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setModelFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap transition-colors ${
                modelFilter === 'all' ? 'bg-accent text-white border-accent' : 'bg-background text-text-secondary border-border'
              }`}
            >
              전체
            </button>
            {mockProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => setModelFilter(project.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap transition-colors ${
                  modelFilter === project.id ? 'bg-accent text-white border-accent' : 'bg-background text-text-secondary border-border'
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4 flex flex-col gap-3">
        <div className="bg-surface/80 backdrop-blur-sm rounded-[14px] p-3">
          <KpiGrid kpis={kpis} />
        </div>

        <div className="bg-surface/80 backdrop-blur-sm rounded-[14px] p-3 h-[200px]">
          <p className="text-xs font-semibold text-text-secondary mb-2">주간 할 일 분포</p>
          <WeeklyLoadChart tasks={filteredTasks} />
        </div>

        <WeekView events={filteredEvents} tasks={filteredTasks} />
      </div>
    </div>
  );
}
