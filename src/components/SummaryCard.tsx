// Summary card — shows the result of a completed (or past) session.
// Used at the end of an assessment and on the Passport screen.
import type { SessionResult } from '../models/sessionResult';

interface SummaryCardProps {
  exerciseName: string;
  icon: string;
  mode: 'repBased' | 'timeBased';
  session: SessionResult;
}

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function SummaryCard({ exerciseName, icon, mode, session }: SummaryCardProps) {
  const primaryLabel = mode === 'timeBased' ? 'Seconds Held' : 'Valid Reps';
  const accuracyColor =
    session.accuracy >= 80 ? 'text-primary' : session.accuracy >= 50 ? 'text-secondary-color' : 'text-danger';

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{icon}</span>
        <div>
          <h3 className="text-lg font-bold">{exerciseName}</h3>
          <p className="text-muted text-xs">
            {new Date(session.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-primary">{session.validReps}</div>
          <div className="text-muted text-xs mt-1 uppercase tracking-wide">{primaryLabel}</div>
        </div>
        <div className="bg-surface rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-danger">{session.formBreaks}</div>
          <div className="text-muted text-xs mt-1 uppercase tracking-wide">Form Breaks</div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="text-sm text-muted">
          Duration <span className="text-[var(--color-text-main)] font-medium">{formatDuration(session.durationSeconds)}</span>
        </div>
        <div className={`text-sm font-semibold ${accuracyColor}`}>
          {session.accuracy}% accuracy
        </div>
      </div>
    </div>
  );
}
