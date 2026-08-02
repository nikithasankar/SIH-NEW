import { Outlet } from 'react-router-dom';
import { BottomNavBar } from '../components/BottomNavBar';

export function ParticipantLayout() {
  return (
    <div className="min-h-dvh w-full flex flex-col justify-between relative bg-[var(--color-background)]">
      <main className="dashboard-container flex-1 w-full flex flex-col">
        <div className="w-full flex-1 flex flex-col pb-24 pt-6 md:pt-8">
          <Outlet />
        </div>
      </main>
      <BottomNavBar />
    </div>
  );
}

