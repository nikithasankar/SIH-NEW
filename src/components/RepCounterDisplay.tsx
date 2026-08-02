
interface RepCounterDisplayProps {
  count: number;
  label?: string;
}

export function RepCounterDisplay({ count, label = 'Reps' }: RepCounterDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-6xl font-bold text-primary">{count}</span>
      <span className="text-muted text-sm uppercase tracking-widest">{label}</span>
    </div>
  );
}
