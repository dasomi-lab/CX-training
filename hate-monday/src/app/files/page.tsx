'use client';

import { useEffect, useState } from 'react';
import { FileText, Trash2, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase, supabaseReady } from '@/lib/supabase';
import { format } from 'date-fns';

interface FileRow {
  id:         string;
  name:       string;
  url:        string;
  size:       number | null;
  mime_type:  string | null;
  created_at: string;
}

function formatBytes(b: number | null) {
  if (!b) return '–';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function FilesPage() {
  const [files,   setFiles]   = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!supabaseReady) { setLoading(false); return; }
    const { data } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });
    setFiles(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleDelete = async (file: FileRow) => {
    if (!supabaseReady) return;
    setDeleting(file.id);
    await supabase.storage.from('uploads').remove([file.id]);
    await supabase.from('files').delete().eq('id', file.id);
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    setDeleting(null);
  };

  return (
    <div className="flex flex-col px-4 pt-5 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-text-primary">Files</h1>
        <Link
          href="/upload"
          className="flex items-center gap-1.5 bg-accent text-white text-xs font-bold px-3 py-2 rounded-[8px] hover:bg-accent-hover transition-colors"
        >
          <Upload size={13} /> 업로드
        </Link>
      </div>

      {!supabaseReady && (
        <div className="bg-surface border border-border rounded-[12px] px-4 py-8 flex flex-col items-center gap-3 text-center">
          <FileText size={32} className="text-text-secondary" />
          <p className="text-sm font-semibold text-text-primary">Supabase 미연결</p>
          <p className="text-xs text-text-secondary leading-relaxed">
            .env.local에 Supabase URL과 키를 설정하면<br />업로드한 파일 목록이 여기에 표시됩니다.
          </p>
        </div>
      )}

      {supabaseReady && loading && (
        <div className="flex items-center justify-center h-40 gap-2 text-text-secondary">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">불러오는 중...</span>
        </div>
      )}

      {supabaseReady && !loading && files.length === 0 && (
        <div className="bg-surface border border-border rounded-[12px] px-4 py-8 flex flex-col items-center gap-3 text-center">
          <FileText size={32} className="text-text-secondary" />
          <p className="text-sm font-semibold text-text-primary">업로드된 파일이 없어요</p>
          <p className="text-xs text-text-secondary">파일을 업로드하면 여기서 관리할 수 있어요.</p>
        </div>
      )}

      {supabaseReady && !loading && files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 bg-background border border-border rounded-[12px] px-3.5 py-3">
              <div className="w-9 h-9 rounded-[8px] bg-accent/10 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                <p className="text-[10px] text-text-secondary">
                  {formatBytes(file.size)} · {format(new Date(file.created_at), 'M월 d일 HH:mm')}
                </p>
              </div>
              <button
                onClick={() => handleDelete(file)}
                disabled={deleting === file.id}
                className="text-text-secondary hover:text-accent transition-colors shrink-0"
              >
                {deleting === file.id
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Trash2 size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
