'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, CheckCircle, FileText, Loader2, Sparkles } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { mockProjects } from '@/lib/mockData';
import { CalendarEvent, Task, EventType } from '@/types';
import { format } from 'date-fns';
import * as chrono from 'chrono-node';

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

/** 텍스트에서 날짜 + 제목 추출 */
function extractFromText(text: string): PendingItem[] {
  // chrono-node 영어 파서 (ISO, MMM DD YYYY 등)
  const enResults = chrono.parse(text, new Date(), { forwardDate: true });

  // 한국식 날짜 정규식: 2026년 4월 15일 / 4월 15일 / 4/15 / 4.15
  const krRegex = /(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일|(\d{1,2})[./](\d{1,2})/g;
  const manualResults: { text: string; date: Date; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = krRegex.exec(text)) !== null) {
    const year  = m[1] ? parseInt(m[1]) : new Date().getFullYear();
    const month = m[2] ? parseInt(m[2]) : parseInt(m[4]);
    const day   = m[3] ? parseInt(m[3]) : parseInt(m[5]);
    if (month < 1 || month > 12 || day < 1 || day > 31) continue;
    manualResults.push({ text: m[0], date: new Date(year, month - 1, day), index: m.index });
  }

  const seen = new Set<string>();
  const items: PendingItem[] = [];

  const processResult = (dateObj: Date, matchText: string, index: number) => {
    const dateStr = format(dateObj, 'yyyy-MM-dd');
    const key = `${dateStr}::${matchText}`;
    if (seen.has(key)) return;
    seen.add(key);

    const lineStart = text.lastIndexOf('\n', index) + 1;
    const lineEnd   = text.indexOf('\n', index + matchText.length);
    const line      = text.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).trim();
    const title     = line
      .replace(matchText, '')
      .replace(/^[\s·•\-–—:]+|[\s·•\-–—:]+$/g, '')
      .trim();
    if (!title) return;

    items.push({
      id: crypto.randomUUID(), title, date: dateStr, endDate: '', type: 'general', projectId: '',
    });
  };

  enResults.forEach((r) => processResult(r.start.date(), r.text, r.index));
  manualResults.forEach((r) => processResult(r.date, r.text, r.index));

  return items.slice(0, 15);
}

/** FileReader로 파일을 텍스트로 읽기 (모바일 호환) */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve((e.target?.result as string) ?? '');
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsText(file, 'utf-8');
  });
}

/** PDF에서 텍스트 추출 (pdfjs-dist, public worker) */
async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: unknown) => (item as { str?: string }).str ?? '')
      .join(' ');
    text += pageText + '\n';
  }
  return text;
}

export default function UploadPage() {
  const router = useRouter();
  const { addEvent, addTask } = useDataStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 수동 입력 상태
  const [title,     setTitle]     = useState('');
  const [date,      setDate]      = useState(today);
  const [endDate,   setEndDate]   = useState('');
  const [type,      setType]      = useState<EventType | 'task'>('task');
  const [projectId, setProjectId] = useState('');

  // 공통 pending 목록
  const [items, setItems] = useState<PendingItem[]>([]);
  const [saved, setSaved] = useState(false);

  // 파일 파싱 상태
  const [parsing,   setParsing]   = useState(false);
  const [parseErr,  setParseErr]  = useState('');
  const [extracted, setExtracted] = useState<PendingItem[]>([]);

  /* ─── 파일 파싱 ─── */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!e.target.files) return;
    e.target.value = '';           // 동일 파일 재선택 허용
    if (!file) return;

    setParsing(true);
    setParseErr('');
    setExtracted([]);

    try {
      let text = '';
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        text = await extractTextFromPdf(file);
      } else {
        text = await readFileAsText(file);
      }

      const found = extractFromText(text);
      if (found.length === 0) {
        setParseErr('인식된 날짜가 없습니다. 다른 파일을 시도해 보세요.');
      } else {
        setExtracted(found);
      }
    } catch (err) {
      console.error(err);
      setParseErr('파일을 읽는 중 오류가 발생했습니다.');
    } finally {
      setParsing(false);
    }
  };

  const removeExtracted = (id: string) =>
    setExtracted((prev) => prev.filter((i) => i.id !== id));

  const addAllExtracted = () => {
    setItems((prev) => [...prev, ...extracted]);
    setExtracted([]);
  };

  /* ─── 수동 추가 ─── */
  const addToList = () => {
    if (!title.trim() || !date) return;
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: title.trim(), date, endDate, type, projectId },
    ]);
    setTitle(''); setDate(today); setEndDate(''); setType('task'); setProjectId('');
  };

  /* ─── 저장 ─── */
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const saveAll = () => {
    items.forEach((item) => {
      if (item.type === 'task') {
        const task: Task = {
          id: crypto.randomUUID(), projectId: item.projectId || null,
          title: item.title, dueDate: item.endDate || item.date,
          status: 'todo', priority: 'medium',
        };
        addTask(task);
      } else {
        const event: CalendarEvent = {
          id: crypto.randomUUID(), projectId: item.projectId || null,
          title: item.title, date: item.date,
          endDate: item.endDate || undefined, type: item.type as EventType,
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
    <div className="min-h-[calc(100dvh-64px)] px-4 pt-5 pb-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-text-secondary text-sm mb-4 hover:text-text-primary">
        <ChevronLeft size={16} /> Back
      </button>
      <h1 className="text-xl font-bold text-text-primary mb-1">일정 · 할 일 추가</h1>
      <p className="text-sm text-text-secondary mb-5">파일에서 자동 인식하거나 직접 입력하세요.</p>

      {/* ── 파일 업로드 섹션 ── */}
      <div className="bg-surface rounded-[12px] p-4 mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-text-primary">파일에서 불러오기</p>
            <p className="text-[10px] text-text-secondary mt-0.5">PDF · TXT · MD — 날짜를 자동 인식합니다</p>
          </div>
          <label className="flex items-center gap-1.5 bg-accent text-white text-xs font-semibold px-3 py-2 rounded-[8px] cursor-pointer hover:bg-accent-hover transition-colors">
            <FileText size={13} />
            파일 선택
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf,text/plain,application/pdf"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </div>

        {/* 파싱 중 */}
        {parsing && (
          <div className="flex items-center gap-2 text-text-secondary text-xs py-1">
            <Loader2 size={14} className="animate-spin" />
            파일 분석 중...
          </div>
        )}

        {/* 오류 */}
        {parseErr && (
          <p className="text-xs text-accent">{parseErr}</p>
        )}

        {/* 추출된 항목 */}
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
                  <p className="text-[9px] text-text-secondary">{item.date}{item.endDate ? ` ~ ${item.endDate}` : ''}</p>
                </div>
                <button onClick={() => removeExtracted(item.id)} className="text-text-secondary hover:text-accent shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={addAllExtracted}
              className="flex items-center justify-center gap-1.5 w-full bg-accent/10 text-accent text-xs font-bold py-2 rounded-[8px] hover:bg-accent/15 transition-colors border border-accent/20"
            >
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

      {/* ── 수동 입력 폼 ── */}
      <div className="bg-surface rounded-[12px] p-4 flex flex-col gap-3 mb-5">
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1 block">제목</label>
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="예: R&D 지원서 제출 마감"
            className="w-full text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent"
          />
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
                className={`py-1.5 text-xs font-medium rounded-full border transition-colors text-center ${
                  type === value ? 'bg-accent text-white border-accent' : 'bg-background border-border text-text-secondary hover:border-accent hover:text-accent'
                }`}>
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
            {mockProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <button onClick={addToList} disabled={!title.trim() || !date}
          className="flex items-center justify-center gap-2 w-full bg-accent text-white text-sm font-semibold py-2.5 rounded-[8px] hover:bg-accent-hover transition-colors disabled:opacity-40">
          <Plus size={16} /> 목록에 추가
        </button>
      </div>

      {/* ── 최종 목록 ── */}
      {items.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-2">
            추가 목록 ({items.length})
          </h2>
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

          <button onClick={saveAll}
            className="w-full bg-accent text-white text-sm font-bold py-3 rounded-[12px] hover:bg-accent-hover transition-colors">
            전체 저장 ({items.length})
          </button>
        </>
      )}
    </div>
  );
}
