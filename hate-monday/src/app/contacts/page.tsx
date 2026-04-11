import { Users } from 'lucide-react';
import { mockContacts } from '@/lib/mockData';
import { mockProjects } from '@/lib/mockData';

export default function ContactsPage() {
  const projMap = Object.fromEntries(mockProjects.map((p) => [p.id, p]));

  return (
    <div className="min-h-[calc(100dvh-64px)] px-4 pt-5 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-text-primary">Contacts</h1>
        <span className="text-xs text-text-secondary bg-surface px-2.5 py-1 rounded-full border border-border">2차 MVP</span>
      </div>

      <div className="flex flex-col gap-3">
        {mockContacts.map((c) => {
          const proj = c.projectId ? projMap[c.projectId] : null;
          return (
            <div key={c.id} className="bg-background rounded-[12px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-4 flex gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-accent font-bold text-sm">{c.name[0]}</span>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text-primary">{c.name}</p>
                  {proj && (
                    <span className="text-[10px] text-text-secondary bg-surface px-1.5 py-0.5 rounded-full border border-border truncate max-w-[100px]">
                      {proj.name.slice(0, 10)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary">{c.role} · {c.company}</p>
                {c.email && <p className="text-[11px] text-accent mt-0.5">{c.email}</p>}
                {c.phone && <p className="text-[11px] text-text-secondary">{c.phone}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col items-center gap-2 text-text-secondary">
        <Users size={32} className="opacity-30" />
        <p className="text-sm text-center">연락처 추가, 수정, 삭제 기능은<br />2차 MVP에서 추가됩니다.</p>
      </div>
    </div>
  );
}
