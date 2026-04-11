'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FolderKanban, Calendar, CheckSquare, Users } from 'lucide-react';

const tabs = [
  { label: 'Home',     icon: Home,          href: '/home' },
  { label: 'Projects', icon: FolderKanban,  href: '/projects' },
  { label: 'Calendar', icon: Calendar,      href: '/calendar' },
  { label: 'Tasks',    icon: CheckSquare,   href: '/tasks' },
  { label: 'Contacts', icon: Users,         href: '/contacts' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-16">
      <div className="flex h-full max-w-lg mx-auto">
        {tabs.map(({ label, icon: Icon, href }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-medium transition-colors ${
                active ? 'text-accent' : 'text-text-secondary'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
