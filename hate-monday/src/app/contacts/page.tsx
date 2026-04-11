'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Star } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { Contact } from '@/types';
import { mockCategories } from '@/lib/mockData';

const EMPTY: Omit<Contact, 'id'> = {
  projectId: null, name: '', company: '', role: '', phone: '', email: '', note: '', favorite: false,
};

export default function ContactsPage() {
  const { contacts, projects, addContact, updateContact, deleteContact, toggleFavorite } = useDataStore();

  const catMap = Object.fromEntries(mockCategories.map((c) => [c.id, c]));
  const projMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Contact | null>(null);
  const [form, setForm] = useState<Omit<Contact, 'id'>>(EMPTY);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const sorted = [...contacts].sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));

  const openAdd = () => { setEditTarget(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (c: Contact) => {
    setEditTarget(c);
    setForm({ projectId: c.projectId, name: c.name, company: c.company ?? '', role: c.role ?? '', phone: c.phone ?? '', email: c.email ?? '', note: c.note ?? '', favorite: c.favorite ?? false });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editTarget) {
      updateContact({ ...form, id: editTarget.id });
    } else {
      addContact({ ...form, id: crypto.randomUUID() });
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) { deleteContact(id); setDeleteConfirm(null); }
    else { setDeleteConfirm(id); setTimeout(() => setDeleteConfirm(null), 3000); }
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] px-4 pt-5 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-text-primary">Contacts</h1>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-accent-hover transition-colors">
          <Plus size={14} /> 명함 추가
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
            <p className="text-sm">명함이 없습니다. 추가해보세요!</p>
          </div>
        )}

        {sorted.map((c) => {
          const proj = c.projectId ? projMap[c.projectId] : null;
          const cat = proj ? catMap[proj.categoryId] : null;
          const accentColor = cat?.color ?? null;

          return (
            <div
              key={c.id}
              className="bg-background rounded-[12px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-4 flex gap-3 overflow-hidden relative"
              style={accentColor ? { borderLeftColor: accentColor, borderLeftWidth: 3 } : {}}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: (accentColor ?? '#D94040') + '18' }}
              >
                <span className="font-bold text-sm" style={{ color: accentColor ?? '#D94040' }}>{c.name[0]}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-semibold text-text-primary">{c.name}</p>
                  {c.favorite && <Star size={12} className="text-warning fill-warning shrink-0" />}
                </div>
                {(c.role || c.company) && (
                  <p className="text-xs text-text-secondary">{[c.role, c.company].filter(Boolean).join(' · ')}</p>
                )}
                {proj && (
                  <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: (accentColor ?? '#6B6B6B') + '20', color: accentColor ?? '#6B6B6B' }}>
                    {proj.name.slice(0, 14)}
                  </span>
                )}
                {c.email && <p className="text-[11px] text-accent mt-0.5">{c.email}</p>}
                {c.phone && <p className="text-[11px] text-text-secondary">{c.phone}</p>}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => toggleFavorite(c.id)}>
                  <Star size={15} className={c.favorite ? 'text-warning fill-warning' : 'text-border hover:text-warning'} />
                </button>
                <button onClick={() => openEdit(c)} className="text-text-secondary hover:text-accent">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(c.id)} className={deleteConfirm === c.id ? 'text-accent' : 'text-text-secondary hover:text-accent'}>
                  {deleteConfirm === c.id ? <Check size={15} /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowForm(false)} />
          <div className="relative bg-background rounded-t-[20px] sm:rounded-[16px] w-full max-w-md p-5 shadow-xl max-h-[85dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary">{editTarget ? '명함 수정' : '명함 추가'}</h3>
              <button onClick={() => setShowForm(false)} className="text-text-secondary"><X size={18} /></button>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: '이름 *', key: 'name', placeholder: '홍길동' },
                { label: '회사', key: 'company', placeholder: '(주)비앤테크' },
                { label: '직책', key: 'role', placeholder: 'CX 팀장' },
                { label: '전화', key: 'phone', placeholder: '010-0000-0000' },
                { label: '이메일', key: 'email', placeholder: 'hello@company.com' },
                { label: '메모', key: 'note', placeholder: '기타 메모' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">{label}</label>
                  <input
                    type="text"
                    value={(form as any)[key] ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary placeholder:text-border focus:outline-none focus:border-accent"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1 block">프로젝트 연결</label>
                <select
                  value={form.projectId ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value || null }))}
                  className="w-full text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="">없음</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* 즐겨찾기 토글 */}
              <button
                onClick={() => setForm((f) => ({ ...f, favorite: !f.favorite }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-[8px] border text-sm font-medium transition-colors ${form.favorite ? 'border-warning bg-warning/10 text-warning' : 'border-border text-text-secondary'}`}
              >
                <Star size={15} className={form.favorite ? 'fill-warning' : ''} />
                {form.favorite ? '즐겨찾기 등록됨' : '즐겨찾기 추가'}
              </button>

              <button
                onClick={handleSave}
                disabled={!form.name.trim()}
                className="w-full bg-accent text-white text-sm font-bold py-2.5 rounded-[10px] hover:bg-accent-hover transition-colors disabled:opacity-40 mt-1"
              >
                {editTarget ? '저장' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
