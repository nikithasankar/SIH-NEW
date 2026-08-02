// Streak calculator — implemented in Phase 8
// Computes streak from stored session timestamps at read time.
// Does NOT store streak as a separate counter.

import type { SessionResult } from '../models/sessionResult';

/**
 * Calculate consecutive calendar days with at least one session,
 * counting backward from today or yesterday.
 * A session done yesterday but not today still keeps the streak alive.
 * Two consecutive missed days breaks it.
 */
export function calculateStreak(sessions: SessionResult[]): number {
  if (sessions.length === 0) return 0;

  // Collect unique session dates (local calendar days)
  const sessionDates = new Set<string>();
  for (const session of sessions) {
    const date = new Date(session.timestamp);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    sessionDates.add(dateStr);
  }

  const today = new Date();
  const todayStr = formatDate(today);

  // Start from today if there's a session today, otherwise from yesterday
  let currentDate = new Date(today);
  if (!sessionDates.has(todayStr)) {
    currentDate.setDate(currentDate.getDate() - 1);
    const yesterdayStr = formatDate(currentDate);
    if (!sessionDates.has(yesterdayStr)) {
      return 0; // No session today or yesterday — streak is broken
    }
  }

  // Count backward
  let streak = 0;
  while (sessionDates.has(formatDate(currentDate))) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
