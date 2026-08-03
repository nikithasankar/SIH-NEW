import { useLocation, Link } from 'react-router-dom';

const navItems = [
  { path: '/app', icon: '🏠', label: 'Home' },
  { path: '/app/exercises', icon: '🏋️', label: 'Train' },
  { path: '/app/status', icon: '📊', label: 'Status' },
  { path: '/app/history', icon: '📜', label: 'History' },
  { path: '/app/progress', icon: '📈', label: 'Progress' },
  { path: '/app/profile', icon: '👤', label: 'Profile' },
];

export function BottomNavBar() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bottom-nav-safe"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderTop: '1px solid var(--glass-border)',
      }}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-all ${
                isActive ? 'text-primary scale-110' : 'text-muted'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
