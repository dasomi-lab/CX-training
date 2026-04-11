'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useDataStore } from '@/store/useDataStore';
import { Contact } from '@/types';
import { mockProjects } from '@/lib/mockData';

const EMPTY: Omit<Contact, 'id'> = {
  projectId: null,
  name: '',
  company: '',
  role: '',
  phone: '',
  email: '',
  note: '',
};

export default function ContactsPage() {
  const { contacts, projects, addContact, updateContact, deleteContact } = useDataStore();
  const projMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Contact | null>(null);
  const [form, setForm] = useState<Omit<Contact, 'id'>>(EMPTY);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (c: Contact) => {
    setEditTarget(c);
    setForm({ projectId: c.projectId, name: c.name, company: c.company ?? '', role: c.role ?? '', phone: c.phone ?? '', email: c.email ?? '', note: c.note ?? '' });
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
    if (deleteConfirm === id) {
      deleteContact(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] px-4 pt-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-text-primary">Contacts</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-accent-hover transition-colors"
        >
          <Plus size={14} /> 명함 추가
        </button>
      </div>

      {/* Contact list */}
      <div className="flex flex-col gap-3">
        {contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
            <p className="text-sm">명함이 없습니다. 추가해보세요!</p>
          </div>
        )}
        {contacts.map((c) => {
          const proj = c.projectId ? projMap[c.projectId] : null;
          return (
            <div key={c.id} className="bg-background rounded-[12px] border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-4 flex gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-accent font-bold text-sm">{c.name[0]}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-text-primary">{c.name}</p>
                  {proj && (
                    <span className="text-[10px] text-text-secondary bg-surface px-1.5 py-0.5 rounded-full border border-border truncate max-w-[90px]">
                      {proj.name.slice(0, 10)}
                    </span>
                  )}
                </div>
                {(c.role || c.company) && (
                  <p className="text-xs text-text-secondary">{[c.role, c.company].filter(Boolean).join(' · ')}</p>
                )}
                {c.email && <p className="text-[11px] text-accent mt-0.5">{c.email}</p>}
                {c.phone && <p className="text-[11px] text-text-secondary">{c.phone}</p>}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <button onClick={() => openEdit(c)} className="text-text-secondary hover:text-accent">
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className={deleteConfirm === c.id ? 'text-accent' : 'text-text-secondary hover:text-accent'}
                >
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
              <h3 className="text-base font-semibold text-text-primary">
                {editTarget ? '명함 수정' : '명함 추가'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-text-secondary">
                <X size={18} />
              </button>
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

              {/* Project link */}
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1 block">프로젝트 연결</label>
                <select
                  value={form.projectId ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value || null }))}
                  className="w-full text-sm bg-background border border-border rounded-[8px] px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="">없음</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

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
