'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, CheckCircle, FileText, Loader2, Sparkles } from 'lucide-react';
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
  { value: 'task',     label: '할 일' },
  { value: 'deadline', label: '마감' },
  { value: 'meeting',  label: '회의' },
  { value: 'general',  label: '일정' },
];

const today = new Date().toISOString().split('T')[0];

/** 텍스트에서 날짜 + 제목 추출 (순수 정규식, 외부 라이브러리 없음) */
function extractFromText(text: string): PendingItem[] {
  const currentYear = new Date().getFullYear();
  const seen = new Set<string>();
  const results: PendingItem[] = [];

  const toDateStr = (y: number, mo: number, d: number): string | null => {
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const getContext = (matchIndex: number, matchText: string): string => {
    const ls = text.lastIndexOf('\n', matchIndex) + 1;
    const le = text.indexOf('\n', matchIndex + matchText.length);
    const line = text.slice(ls, le === -1 ? undefined : le).trim();
    return line.replace(matchText, '').replace(/^[\s\-·:•]+|[\s\-·:•]+$/g, '').trim();
  };

  const push = (dateStr: string, title: string) => {
    const key = `${dateStr}::${title}`;
    if (!title || seen.has(key)) return;
    seen.add(key);
    results.push({ id: crypto.randomUUID(), title, date: dateStr, endDate: '', type: 'general', projectId: '' });
  };

  // YYYY-MM-DD
  for (const m of text.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)) {
    const ds = toDateStr(+m[1], +m[2], +m[3]);
    if (ds) push(ds, getContext(m.index!, m[0]));
  }
  // YYYY년 M월 D일
  for (const m of text.matchAll(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/g)) {
    const ds = toDateStr(+m[1], +m[2], +m[3]);
    if (ds) push(ds, getContext(m.index!, m[0]));
  }
  // M월 D일 (올해 연도 자동)
  for (const m of text.matchAll(/(\d{1,2})월\s*(\d{1,2})일/g)) {
    const ds = toDateStr(currentYear, +m[1], +m[2]);
    if (ds) push(ds, getContext(m.index!, m[0]));
  }
  // MM/DD 또는 M/D
  for (const m of text.matchAll(/\b(\d{1,2})\/(\d{1,2})\b/g)) {
    const ds = toDateStr(currentYear, +m[1], +m[2]);
    if (ds) push(ds, getContext(m.index!, m[0]));
  }

  return results.slice(0, 15);
}

/** FileReader로 텍스트 읽기 (모든 브라우저 호환) */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve((e.target?.result as string) ?? '');
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다'));
    reader.readAsText(file, 'utf-8');
  });
}

export default function UploadPage() {
  const router = useRouter();
  const { addEvent, addTask } = useDataStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title,     setTitle]     = useState('');
  const [date,      setDate]      = useState(today);
  const [endDate,   setEndDate]   = useState('');
  const [type,      setType]      = useState<EventType | 'task'>('task');
  const [projectId, setProjectId] = useState('');
  const [items,     setItems]     = useState<PendingItem[]>([]);
  const [saved,     setSaved]     = useState(false);

  const [parsing,   setParsing]   = useState(false);
  const [parseErr,  setParseErr]  = useState('');
  const [extracted, setExtracted] = useState<PendingItem[]>([]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      setParseErr('PDF는 현재 미지원입니다. TXT 또는 MD 파일을 사용해 주세요.');
      return;
    }

    setParsing(true);
    setParseErr('');
    setExtracted([]);

    try {
      const text  = await readFileAsText(file);
      const found = extractFromText(text);
      if (found.length === 0) {
        setParseErr('날짜를 찾지 못했습니다. 날짜가 포함된 TXT/MD 파일을 사용해 보세요.');
      } else {
        setExtracted(found);
      }
    } catch (err) {
      setParseErr('파일을 읽는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setParsing(false);
    }
  };

  const removeExtracted = (id: string) => setExtracted((p) => p.filter((i) => i.id !== id));
  const addAllExtracted = () => { setItems((p) => [...p, ...extracted]); setExtracted([]); };

  const addToList = () => {
    if (!title.trim() || !date) return;
    setItems((p) => [...p, { id: crypto.randomUUID(), title: title.trim(), date, endDate, type, projectId }]);
    setTitle(''); setDate(today); setEndDate(''); setType('task'); setProjectId('');
  };

  const remove  = (id: string) => setItems((p) => p.filter((i) => i.id !== id));

  const saveAll = () => {
    items.forEach((item) => {
      if (item.type === 'task') {
        addTask({ id: crypto.randomUUID(), projectId: item.projectId || null, title: item.title, dueDate: item.endDate || item.date, status: 'todo', priority: 'medium' } as Task);
      } else {
        addEvent({ id: crypto.randomUUID(), projectId: item.projectId || null, title: item.title, date: item.date, endDate: item.endDate || undefined, type: item.type as EventType } as CalendarEvent);
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
    <div className="min-h-[calc(100dvh-64px)] px-4 pt-5 pb-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-text-secondary text-sm mb-4 hover:text-text-primary">
        <ChevronLeft size={16} /> Back
      </button>
      <h1 className="text-xl font-bold text-text-primary mb-1">일정 · 할 일 추가</h1>
      <p className="text-sm text-text-secondary mb-5">파일에서 자동 인식하거나 직접 입력하세요.</p>

      {/* 파일 업로드 */}
      <div className="bg-surface rounded-[12px] p-4 mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-primary">파일에서 불러오기</p>
            <p className="text-[10px] text-text-secondary mt-0.5">TXT · MD — 날짜를 자동으로 인식합니다</p>
          </div>
          <label className="flex items-center gap-1.5 bg-accent text-white text-xs font-semibold px-3 py-2 rounded-[8px] cursor-pointer hover:bg-accent-hover transition-colors">
            <FileText size={13} />
            파일 선택
            <input ref={fileInputRef} type="file" accept=".txt,.md,text/plain" onChange={handleFile} className="hidden" />
          </label>
        </div>

        {parsing && (
          <div className="flex items-center gap-2 text-text-secondary text-xs">
            <Loader2 size={13} className="animate-spin" /> 분석 중...
          </div>
        )}
        {parseErr && <p className="text-xs text-accent">{parseErr}</p>}

        {extracted.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-accent" />
              <p className="text-[11px] font-semibold text-text-primary">{extracted.length}개 항목 인식됨</p>
            </div>
            {extracted.map((item) => (
              <div key={item.id} className="flex items-center gap-2 bg-background border border-border rounded-[8px] px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-text-primary truncate">{item.title}</p>
                  <p className="text-[9px] text-text-secondary">{item.date}</p>
                </div>
                <button onClick={() => removeExtracted(item.id)} className="text-text-secondary hover:text-accent shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button onClick={addAllExtracted} className="flex items-center justify-center gap-1.5 w-full bg-accent/10 text-accent text-xs font-bold py-2 rounded-[8px] hover:bg-accent/15 transition-colors border border-accent/20">
              <Plus size={13} /> 전체 추가 ({extracted.length})
            </button>
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] text-text-secondary">직접 입력</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* 수동 입력 */}
      <div className="bg-surface rounded-[12px] p-4 flex flex-col gap-3 mb-5">
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1 block">제목</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: R&D 지원서 제출 마감"
            className="w-full text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1 block">날짜</label>
          <div className="flex items-center gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="flex-1 text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary focus:outline-none focus:border-accent" />
            <span className="text-text-secondary text-sm shrink-0">~</span>
            <input type="date" value={endDate} min={date} onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary focus:outline-none focus:border-accent" />
          </div>
          <p className="text-[10px] text-text-secondary mt-1">종료일은 선택사항이에요</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1 block">유형</label>
          <div className="grid grid-cols-4 gap-1.5">
            {EVENT_TYPES.map(({ value, label }) => (
              <button key={value} onClick={() => setType(value)}
                className={`py-1.5 text-xs font-medium rounded-full border transition-colors text-center ${type === value ? 'bg-accent text-white border-accent' : 'bg-background border-border text-text-secondary hover:border-accent hover:text-accent'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1 block">프로젝트 (선택)</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
            className="w-full text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary focus:outline-none focus:border-accent">
            <option value="">없음</option>
            {mockProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <button onClick={addToList} disabled={!title.trim() || !date}
          className="flex items-center justify-center gap-2 w-full bg-accent text-white text-sm font-semibold py-2.5 rounded-[8px] hover:bg-accent-hover transition-colors disabled:opacity-40">
          <Plus size={16} /> 목록에 추가
        </button>
      </div>

      {/* 최종 목록 */}
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
          <button onClick={saveAll} className="w-full bg-accent text-white text-sm font-bold py-3 rounded-[12px] hover:bg-accent-hover transition-colors">
            전체 저장 ({items.length})
          </button>
        </>
      )}
    </div>
  );
}
