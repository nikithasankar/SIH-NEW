// Accuracy score calculation
export function calculateAccuracy(validReps: number, formBreaks: number): number {
  const total = validReps + formBreaks;
  if (total === 0) return 100;
  return Math.round((validReps / total) * 100);
}
