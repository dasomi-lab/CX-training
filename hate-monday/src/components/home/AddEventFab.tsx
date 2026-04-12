import Link from 'next/link';
import { Upload } from 'lucide-react';

export default function AddEventFab() {
  return (
    <Link
      href="/upload"
      className="flex items-center gap-1.5 bg-accent text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-[0_2px_8px_rgba(217,64,64,0.35)] hover:bg-accent-hover transition-colors"
    >
      <Upload size={13} />
      파일 업로드
    </Link>
  );
}
