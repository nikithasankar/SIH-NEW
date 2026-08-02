import type { SessionResult } from '../models/sessionResult';
import { getExerciseById } from '../data/exerciseCatalog';

interface SessionListTileProps {
  session: SessionResult;
  onClick?: () => void;
}

export function SessionListTile({ session, onClick }: SessionListTileProps) {
  const exercise = getExerciseById(session.exerciseId);
  const date = new Date(session.timestamp);

  return (
    <button
      onClick={onClick}
      className="glass-card w-full p-4 flex items-center gap-4 text-left hover:opacity-90 transition-opacity"
    >
      <span className="text-3xl">{exercise?.iconAsset ?? '🏃'}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[var(--color-text-main)]">
          {exercise?.displayName ?? session.exerciseId}
        </div>
        <div className="text-muted text-sm">
          {date.toLocaleDateString()} · {session.validReps} reps · {session.accuracy}% accuracy
        </div>
      </div>
    </button>
  );
}
