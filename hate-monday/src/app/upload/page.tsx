'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Upload, Trash2, CheckCircle, Loader2, Sparkles, Plus } from 'lucide-react';
import { supabase, supabaseReady } from '@/lib/supabase';
import { mockProjects } from '@/lib/mockData';
import { EventType } from '@/types';
import { useDataStore } from '@/store/useDataStore';

type ItemType = EventType | 'task';

interface PendingItem {
  id:        string;
  title:     string;
  date:      string;
  end_date:  string;
  type:      ItemType;
  projectId: string;
}

const EVENT_TYPES: Array<{ value: ItemType; label: string }> = [
  { value: 'task',     label: '할 일' },
  { value: 'deadline', label: '마감'  },
  { value: 'meeting',  label: '회의'  },
  { value: 'general',  label: '일정'  },
];

const today = new Date().toISOString().split('T')[0];

const TEXT_TYPES = ['text/plain', 'text/markdown'];
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];
const PDF_TYPE    = 'application/pdf';

function isTextFile(file: File)  { return TEXT_TYPES.includes(file.type) || file.name.endsWith('.md') || file.name.endsWith('.txt'); }
function isImageFile(file: File) { return IMAGE_TYPES.includes(file.type) || file.type.startsWith('image/'); }
function isPdfFile(file: File)   { return file.type === PDF_TYPE || file.name.endsWith('.pdf'); }

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve((e.target?.result as string) ?? '');
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다'));
    reader.readAsText(file, 'utf-8');
  });
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => {
      const result = e.target?.result as string;
      // data:xxx;base64,XXXX → XXXX 만 추출
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다'));
    reader.readAsDataURL(file);
  });
}

export default function UploadPage() {
  const router = useRouter();
  const { addEvent, addTask } = useDataStore();
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [title,     setTitle]     = useState('');
  const [date,      setDate]      = useState(today);
  const [endDate,   setEndDate]   = useState('');
  const [type,      setType]      = useState<ItemType>('task');
  const [projectId, setProjectId] = useState('');
  const [items,     setItems]     = useState<PendingItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [extracted, setExtracted] = useState<PendingItem[]>([]);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!isTextFile(file) && !isImageFile(file) && !isPdfFile(file)) {
      setUploadErr('TXT, MD, PDF, JPG, PNG 파일만 지원합니다.');
      return;
    }

    setUploading(true);
    setUploadErr('');
    setExtracted([]);

    try {
      let fileId: string | null = null;

      if (supabaseReady) {
        try {
          const path = `${Date.now()}_${file.name}`;
          const { error: storageErr } = await supabase.storage.from('Hate-Monday').upload(path, file);
          if (!storageErr) {
            const { data: urlData } = supabase.storage.from('Hate-Monday').getPublicUrl(path);
            const { data: fileMeta } = await supabase
              .from('files')
              .insert({ name: file.name, storage_path: path, url: urlData.publicUrl, size: file.size, mime_type: file.type || 'text/plain' })
              .select('id')
              .single();
            fileId = fileMeta?.id ?? null;
          }
        } catch {
          // Supabase 연결 불가 — Storage 저장 건너뜀, 추출은 계속 진행
          console.warn('Supabase Storage unreachable, skipping upload');
        }
      }

      let body: Record<string, string>;
      if (isTextFile(file)) {
        const text = await readFileAsText(file);
        body = { file_id: fileId ?? '', text };
      } else {
        // 이미지 또는 PDF → Gemini Vision
        const base64 = await readFileAsBase64(file);
        const mimeType = file.type || (isPdfFile(file) ? 'application/pdf' : 'image/jpeg');
        body = { file_id: fileId ?? '', base64, mimeType };
      }

      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('날짜 추출 실패');

      const { items: raw } = await res.json() as { items: Array<{ id: string; title: string; date: string }> };

      if (!raw || raw.length === 0) {
        setUploadErr('날짜를 찾지 못했습니다. 날짜가 포함된 파일을 사용해 보세요.');
      } else {
        setExtracted(raw.map((r) => ({
          id: r.id ?? crypto.randomUUID(),
          title: r.title, date: r.date, end_date: '', type: 'general' as ItemType, projectId: '',
        })));
      }
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : '파일 처리 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const removeExtracted = (id: string) => setExtracted((p) => p.filter((i) => i.id !== id));
  const addAllExtracted = () => { setItems((p) => [...p, ...extracted]); setExtracted([]); };

  const addToList = () => {
    if (!title.trim() || !date) return;
    setItems((p) => [...p, { id: crypto.randomUUID(), title: title.trim(), date, end_date: endDate, type, projectId }]);
    setTitle(''); setDate(today); setEndDate(''); setType('task'); setProjectId('');
  };

  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));

  const saveAll = async () => {
    if (items.length === 0) return;
    setSaving(true);
    try {
      if (supabaseReady) {
        const evRows = items
          .filter((i) => i.type !== 'task')
          .map((i) => ({ title: i.title, date: i.date, end_date: i.end_date || null, type: i.type, project_id: i.projectId || null, source: 'manual' }));
        if (evRows.length > 0) {
          const { error } = await supabase.from('events').insert(evRows);
          if (error) throw new Error(error.message);
        }
      }
      items.forEach((item) => {
        if (item.type === 'task') {
          addTask({ id: crypto.randomUUID(), projectId: item.projectId || null, title: item.title, dueDate: item.end_date || item.date, status: 'todo', priority: 'medium' });
        } else {
          addEvent({ id: crypto.randomUUID(), projectId: item.projectId || null, title: item.title, date: item.date, endDate: item.end_date || undefined, type: item.type as EventType });
        }
      });
      setSaved(true);
      setTimeout(() => router.push('/home'), 1500);
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
      setSaving(false);
    }
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
      <h1 className="text-xl font-bold text-text-primary mb-1">파일 업로드</h1>
      <p className="text-sm text-text-secondary mb-5">파일에서 일정을 자동 추출하거나 직접 입력하세요.</p>

      {!supabaseReady && (
        <div className="bg-warning/10 border border-warning/30 rounded-[10px] px-3 py-2.5 mb-4">
          <p className="text-xs font-medium" style={{ color: '#FF9800' }}>Supabase 미연결 — 추출은 동작하지만 Storage 저장은 건너뜁니다.</p>
        </div>
      )}

      {/* 파일 업로드 */}
      <div className="bg-surface rounded-[12px] p-4 mb-4 flex flex-col gap-3">
        <div>
          <p className="text-xs font-bold text-text-primary mb-0.5">파일에서 불러오기</p>
          <p className="text-[10px] text-text-secondary mb-2.5">AI가 날짜를 자동 인식합니다</p>
          <div className="grid grid-cols-2 gap-2 relative">
            {/* 사진 선택 — image/* only → iOS 사진첩 열림 */}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 bg-accent text-white text-xs font-semibold px-3 py-2.5 rounded-[10px]"
            >
              <span className="text-base leading-none">📷</span>
              사진 추가
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
            />
            {/* 파일 선택 — TXT / MD / PDF */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 bg-surface border border-border text-text-primary text-xs font-semibold px-3 py-2.5 rounded-[10px]"
            >
              <Upload size={13} />
              파일 선택
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf"
              onChange={handleFile}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
            />
          </div>
          <p className="text-[10px] text-text-secondary mt-1.5">TXT · MD · PDF · JPG · PNG 지원</p>
        </div>
        {uploading && <div className="flex items-center gap-2 text-text-secondary text-xs"><Loader2 size={13} className="animate-spin" /> 업로드 중...</div>}
        {uploadErr && <p className="text-xs text-accent">{uploadErr}</p>}
        {extracted.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-accent" />
              <p className="text-[11px] font-semibold text-text-primary">{extracted.length}개 항목 인식됨</p>
            </div>
            {extracted.map((item) => (
              <div key={item.id} className="flex items-center gap-2 bg-background border border-border rounded-[8px] px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-text-primary truncate">{item.title || '(제목 없음)'}</p>
                  <p className="text-[9px] text-text-secondary">{item.date}</p>
                </div>
                <button onClick={() => removeExtracted(item.id)} className="text-text-secondary hover:text-accent shrink-0"><Trash2 size={12} /></button>
              </div>
            ))}
            <button onClick={addAllExtracted} className="flex items-center justify-center gap-1.5 w-full bg-accent/10 text-accent text-xs font-bold py-2 rounded-[8px] hover:bg-accent/15 border border-accent/20 transition-colors">
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
                      {item.date}{item.end_date ? ` ~ ${item.end_date}` : ''} · {item.type}{proj ? ` · ${proj.name.slice(0, 12)}` : ''}
                    </p>
                  </div>
                  <button onClick={() => remove(item.id)} className="text-text-secondary hover:text-accent"><Trash2 size={14} /></button>
                </div>
              );
            })}
          </div>
          <button onClick={saveAll} disabled={saving}
            className="w-full bg-accent text-white text-sm font-bold py-3 rounded-[12px] hover:bg-accent-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={16} className="animate-spin" /> 저장 중...</> : `전체 저장 (${items.length})`}
          </button>
        </>
      )}
    </div>
  );
}
