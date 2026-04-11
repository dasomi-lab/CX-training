import BottomNav from './BottomNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <main className="pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
