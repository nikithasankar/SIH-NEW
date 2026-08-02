// Progress screen — Phase 8
import { EmptyState } from '../components/EmptyState';
import { WeeklyStatsChart } from '../components/WeeklyStatsChart';
import { useSessionContext } from '../context/SessionContext';

export function ProgressScreen() {
  const { sessions, loading, totalSessions, averageAccuracy, streak } = useSessionContext();

  if (!loading && sessions.length === 0) {
    return (
      <div className="w-full flex flex-col gap-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Progress</h1>
        <EmptyState
          icon="📈"
          title="No data yet"
          description="Complete workouts to see your progress charts."
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Progress</h1>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{totalSessions}</div>
          <div className="text-muted text-xs mt-1">Sessions</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-secondary-color">{averageAccuracy}%</div>
          <div className="text-muted text-xs mt-1">Avg Accuracy</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>{streak}</div>
          <div className="text-muted text-xs mt-1">Day Streak</div>
        </div>
      </div>

      <WeeklyStatsChart sessions={sessions} />
    </div>
  );
}
