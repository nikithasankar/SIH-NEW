
interface HoldTimerDisplayProps {
  seconds: number;
}

export function HoldTimerDisplay({ seconds }: HoldTimerDisplayProps) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <div className="flex flex-col items-center">
      <span className="text-6xl font-bold text-primary">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <span className="text-muted text-sm uppercase tracking-widest">Hold Time</span>
    </div>
  );
}
