import BottomNav from './BottomNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh overflow-hidden bg-background">
      <main className="h-full overflow-y-auto pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
