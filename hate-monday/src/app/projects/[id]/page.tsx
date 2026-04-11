'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { mockProjects, mockCategories, mockTasks, mockContacts, mockEvents } from '@/lib/mockData';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import { useDataStore } from '@/store/useDataStore';

const TABS = ['Overview', 'Tasks', 'Files', 'Contacts'] as const;
type Tab = typeof TABS[number];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const { tasks: allTasks, toggleTask } = useDataStore();

  const project = mockProjects.find((p) => p.id === id);
  if (!project) return <div className="p-6 text-text-secondary">Project not found.</div>;

  const cat = mockCategories.find((c) => c.id === project.categoryId)!;
  const tasks = allTasks.filter((t) => t.projectId === id);
  const contacts = mockContacts.filter((c) => c.projectId === id);
  const events = mockEvents.filter((e) => e.projectId === id);
  const daysLeft = differenceInDays(parseISO(project.endDate), new Date());

  const priorityColor: Record<string, string> = {
    high: '#D94040',
    medium: '#FF9800',
    low: '#4CAF50',
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] flex flex-col">
      {/* Back + Header */}
      <div className="px-4 pt-5 pb-3">
        <Link href="/projects" className="flex items-center gap-1 text-text-secondary text-sm mb-3 hover:text-text-primary">
          <ChevronLeft size={16} /> Projects
        </Link>
        <div className="flex items-start justify-between gap-2 mb-3">
          <h1 className="text-lg font-bold text-text-primary leading-snug">{project.name}</h1>
          <Badge color={cat.color}>{cat.name}</Badge>
        </div>
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex justify-between text-[11px] text-text-secondary">
            <span>{format(parseISO(project.startDate), 'MMM d')} – {format(parseISO(project.endDate), 'MMM d, yyyy')}</span>
            <span>{daysLeft >= 0 ? `D-${daysLeft}` : `D+${Math.abs(daysLeft)}`}</span>
          </div>
          <ProgressBar value={project.progress} color={cat.color} height={7} />
          <p className="text-[11px] text-right font-bold text-text-primary">{project.progress}%</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border px-4 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {activeTab === 'Overview' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Total Tasks', value: tasks.length },
                { label: 'Done', value: tasks.filter((t) => t.status === 'done').length },
                { label: 'Upcoming Events', value: events.length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-surface rounded-[10px] p-3 text-center">
                  <p className="text-xl font-bold text-text-primary">{value}</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Recent Events</h3>
              {events.length === 0 ? (
                <p className="text-sm text-text-secondary">No events yet.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {events.map((ev) => (
                    <div key={ev.id} className="flex items-center justify-between bg-surface rounded-[8px] px-3 py-2">
                      <span className="text-sm text-text-primary">{ev.title}</span>
                      <span className="text-[11px] text-text-secondary">{ev.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Tasks' && (
          <div className="flex flex-col gap-2">
            {tasks.length === 0 ? (
              <p className="text-sm text-text-secondary">No tasks for this project.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 bg-surface rounded-[10px] px-3 py-2.5">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      task.status === 'done' ? 'bg-success border-success' : 'border-border'
                    }`}
                  >
                    {task.status === 'done' && (
                      <svg viewBox="0 0 10 8" className="w-2.5 fill-white"><path d="M1 4l3 3 5-6"/></svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.status === 'done' ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                      {task.title}
                    </p>
                    <p className="text-[10px] text-text-secondary">{task.dueDate}</p>
                  </div>
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: priorityColor[task.priority] }}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Files' && (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-text-secondary">
            <p className="text-sm">파일 첨부 기능은 2차 MVP에서 추가됩니다.</p>
          </div>
        )}

        {activeTab === 'Contacts' && (
          <div className="flex flex-col gap-2">
            {contacts.length === 0 ? (
              <p className="text-sm text-text-secondary">No contacts for this project.</p>
            ) : (
              contacts.map((c) => (
                <div key={c.id} className="bg-surface rounded-[10px] px-3 py-3 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text-primary">{c.name}</p>
                    <p className="text-[11px] text-text-secondary">{c.role}</p>
                  </div>
                  <p className="text-[11px] text-text-secondary">{c.company}</p>
                  {c.email && <p className="text-[11px] text-accent">{c.email}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
