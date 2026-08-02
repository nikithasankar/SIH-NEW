import type { ExerciseDefinition } from '../models/exerciseDefinition';

interface ExerciseCardProps {
  exercise: ExerciseDefinition;
  onClick: () => void;
}

export function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  return (
    <button
      onClick={onClick}
      className="glass-card p-6 flex flex-col items-center gap-3 hover:scale-[1.03] active:scale-[0.98] transition-transform"
    >
      <span className="text-4xl">{exercise.iconAsset}</span>
      <span className="font-semibold text-[var(--color-text-main)]">{exercise.displayName}</span>
      <span className="text-muted text-xs uppercase tracking-wider">
        {exercise.mode === 'timeBased' ? 'Hold' : 'Reps'}
      </span>
    </button>
  );
}
