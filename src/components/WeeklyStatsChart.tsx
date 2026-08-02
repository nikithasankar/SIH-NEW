// Weekly stats chart — Phase 8
// Pure-SVG bar chart (no chart library dependency) showing valid reps
// completed per day over the last 7 days.
import type { SessionResult } from '../models/sessionResult';

interface WeeklyStatsChartProps {
  sessions: SessionResult[];
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// FIX (flaw #4.2 — weekly chart date offset bug): dateKey previously used
// d.getMonth() (0-indexed) while streakCalculator.ts used d.getMonth() + 1
// (1-indexed), so a session logged on the same calendar day could land in
// two different "buckets" depending on which component read it. Both now
// share the same zero-padded YYYY-MM-DD format.
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function WeeklyStatsChart({ sessions }: WeeklyStatsChartProps) {
  const today = new Date();
  const days: { key: string; label: string; reps: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ key: dateKey(d), label: DAY_LABELS[d.getDay()], reps: 0 });
  }

  for (const session of sessions) {
    const key = dateKey(new Date(session.timestamp));
    const day = days.find((d) => d.key === key);
    if (day) day.reps += session.validReps;
  }

  const maxReps = Math.max(1, ...days.map((d) => d.reps));
  const hasAnyData = days.some((d) => d.reps > 0);

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold mb-4">This Week</h3>
      {!hasAnyData ? (
        <p className="text-muted text-sm text-center py-6">No workouts logged this week yet.</p>
      ) : (
        <div className="flex items-end justify-between gap-2 h-32">
          {days.map((day, i) => {
            const heightPct = Math.max(4, (day.reps / maxReps) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${heightPct}%`,
                      background: day.reps > 0 ? 'var(--color-primary)' : 'var(--glass-border)',
                      minHeight: 4,
                    }}
                    title={`${day.reps} reps`}
                  />
                </div>
                <span className="text-muted text-[10px] font-medium">{day.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
