
interface StatusIndicatorPillProps {
  isPositionOk: boolean;
}

export function StatusIndicatorPill({ isPositionOk }: StatusIndicatorPillProps) {
  return (
    <div
      className={`px-4 py-1.5 rounded-full text-sm font-medium ${
        isPositionOk
          ? 'bg-green-500/20 text-green-400'
          : 'bg-red-500/20 text-red-400'
      }`}
    >
      {isPositionOk ? '✓ Position OK' : '✗ Adjust Position'}
    </div>
  );
}
