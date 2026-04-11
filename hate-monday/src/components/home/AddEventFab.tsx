import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function AddEventFab() {
  return (
    <Link
      href="/upload"
      className="flex items-center gap-1.5 bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-[0_2px_8px_rgba(217,64,64,0.35)] hover:bg-accent-hover transition-colors"
    >
      <Plus size={14} />
      Add Event
    </Link>
  );
}
