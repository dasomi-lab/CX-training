'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { mockProjects } from '@/lib/mockData';
import { CalendarEvent, Task, EventType } from '@/types';

interface PendingItem {
  id: string;
  title: string;
  date: string;
  endDate: string;
  type: EventType | 'task';
  projectId: string;
}

const EVENT_TYPES: Array<{ value: EventType | 'task'; label: string }> = [
  { value: 'task',      label: 'Task' },
  { value: 'deadline',  label: 'Deadline' },
  { value: 'meeting',   label: 'Meeting' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'general',   label: 'General' },
];

const today = new Date().toISOString().split('T')[0];

export default function UploadPage() {
  const router = useRouter();
  const { addEvent, addTask } = useDataStore();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<EventType | 'task'>('task');
  const [projectId, setProjectId] = useState('');
  const [items, setItems] = useState<PendingItem[]>([]);
  const [saved, setSaved] = useState(false);

  const addToList = () => {
    if (!title.trim() || !date) return;
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: title.trim(), date, endDate, type, projectId },
    ]);
    setTitle('');
    setDate(today);
    setEndDate('');
    setType('task');
    setProjectId('');
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const saveAll = () => {
    items.forEach((item) => {
      if (item.type === 'task') {
        const task: Task = {
          id: crypto.randomUUID(),
          projectId: item.projectId || null,
          title: item.title,
          dueDate: item.endDate || item.date,
          status: 'todo',
          priority: 'medium',
        };
        addTask(task);
      } else {
        const event: CalendarEvent = {
          id: crypto.randomUUID(),
          projectId: item.projectId || null,
          title: item.title,
          date: item.date,
          endDate: item.endDate || undefined,
          type: item.type as EventType,
        };
        addEvent(event);
      }
    });
    setSaved(true);
    setTimeout(() => router.push('/home'), 1500);
  };

  if (saved) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center gap-3">
        <CheckCircle size={48} className="text-success" />
        <p className="text-base font-semibold text-text-primary">저장 완료!</p>
        <p className="text-sm text-text-secondary">홈으로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] px-4 pt-5 pb-4">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-text-secondary text-sm mb-4 hover:text-text-primary">
        <ChevronLeft size={16} /> Back
      </button>
      <h1 className="text-xl font-bold text-text-primary mb-1">Add Event / Task</h1>
      <p className="text-sm text-text-secondary mb-5">일정 또는 태스크를 입력하고 저장하세요.</p>

      {/* Form */}
      <div className="bg-surface rounded-[12px] p-4 flex flex-col gap-3 mb-5">
        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1 block">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: R&D 지원서 제출 마감"
            className="w-full text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent"
          />
        </div>

        {/* 날짜 범위 */}
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1 block">날짜</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
            />
            <span className="text-text-secondary text-sm shrink-0">~</span>
            <input
              type="date"
              value={endDate}
              min={date}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <p className="text-[10px] text-text-secondary mt-1">종료일은 선택사항이에요</p>
        </div>

        {/* Type */}
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1 block">유형</label>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  type === value
                    ? 'bg-accent text-white border-accent'
                    : 'bg-background border-border text-text-secondary hover:border-accent hover:text-accent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Project */}
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1 block">프로젝트 (선택)</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="">없음</option>
            {mockProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={addToList}
          disabled={!title.trim() || !date}
          className="flex items-center justify-center gap-2 w-full bg-accent text-white text-sm font-semibold py-2.5 rounded-[8px] hover:bg-accent-hover transition-colors disabled:opacity-40"
        >
          <Plus size={16} /> 목록에 추가
        </button>
      </div>

      {/* Preview list */}
      {items.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-2">추가 목록 ({items.length})</h2>
          <div className="flex flex-col gap-2 mb-5">
            {items.map((item) => {
              const proj = item.projectId ? mockProjects.find((p) => p.id === item.projectId) : null;
              return (
                <div key={item.id} className="flex items-center gap-3 bg-background border border-border rounded-[10px] px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
                    <p className="text-[10px] text-text-secondary">
                      {item.date}{item.endDate ? ` ~ ${item.endDate}` : ''} · {item.type}{proj ? ` · ${proj.name.slice(0, 12)}` : ''}
                    </p>
                  </div>
                  <button onClick={() => remove(item.id)} className="text-text-secondary hover:text-accent">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={saveAll}
            className="w-full bg-accent text-white text-sm font-bold py-3 rounded-[12px] hover:bg-accent-hover transition-colors"
          >
            Save All ({items.length})
          </button>
        </>
      )}
    </div>
  );
}
