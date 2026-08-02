import { useThemeContext } from '../context/ThemeContext';
import { useSessionContext } from '../context/SessionContext';
import { useAuth } from '../auth/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

export function ProfileScreen() {
  const { theme, toggleTheme } = useThemeContext();
  const { totalReps, totalSessions, averageAccuracy } = useSessionContext();
  const { user, logout } = useAuth();

  return (
    <div className="w-full flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Profile</h1>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-2xl font-bold text-[var(--color-background)]">
            {user?.name
              ?.split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('') ?? '🏃'}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user?.name ?? 'Athlete'}</h2>
            <p className="text-muted text-sm">{user?.email ?? 'ONFORM Athlete'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>

      {/* Summary stats */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Summary</h3>
        <div className="space-y-3 text-muted text-sm">
          <div className="flex justify-between">
            <span>Total Reps</span>
            <span className="text-[var(--color-text-main)]">{totalReps}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Sessions</span>
            <span className="text-[var(--color-text-main)]">{totalSessions}</span>
          </div>
          <div className="flex justify-between">
            <span>Average Accuracy</span>
            <span className="text-[var(--color-text-main)]">
              {totalSessions > 0 ? `${averageAccuracy}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full glass-card p-4 text-center font-semibold text-danger hover:opacity-80 transition-opacity"
      >
        Log Out
      </button>
    </div>
  );
}
