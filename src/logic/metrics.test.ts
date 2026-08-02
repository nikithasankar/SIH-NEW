import { describe, it, expect } from 'vitest';
import { calculateAccuracy } from './accuracyScore';
import { calculateStreak } from './streakCalculator';
import type { SessionResult } from '../models/sessionResult';

describe('calculateAccuracy', () => {
  it('returns 100 when no reps or form breaks', () => {
    expect(calculateAccuracy(0, 0)).toBe(100);
  });

  it('returns 100 for perfect form', () => {
    expect(calculateAccuracy(10, 0)).toBe(100);
  });

  it('calculates correctly with form breaks', () => {
    // 8 / (8 + 2) * 100 = 80
    expect(calculateAccuracy(8, 2)).toBe(80);
  });

  it('returns 0 when all are form breaks', () => {
    expect(calculateAccuracy(0, 5)).toBe(0);
  });
});

describe('calculateStreak', () => {
  function makeSession(daysAgo: number): SessionResult {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(12, 0, 0, 0);
    return {
      exerciseId: 'pushup',
      validReps: 10,
      formBreaks: 0,
      accuracy: 100,
      durationSeconds: 60,
      timestamp: d.toISOString(),
    };
  }

  it('returns 0 for empty sessions', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('returns 1 for a session today only', () => {
    expect(calculateStreak([makeSession(0)])).toBe(1);
  });

  it('returns 1 for a session yesterday only (grace period)', () => {
    expect(calculateStreak([makeSession(1)])).toBe(1);
  });

  it('returns 0 when last session was 2 days ago', () => {
    expect(calculateStreak([makeSession(2)])).toBe(0);
  });

  it('counts consecutive days backward from today', () => {
    const sessions = [makeSession(0), makeSession(1), makeSession(2)];
    expect(calculateStreak(sessions)).toBe(3);
  });

  it('counts consecutive days backward from yesterday (grace)', () => {
    // No session today, but sessions yesterday, day before, etc.
    const sessions = [makeSession(1), makeSession(2), makeSession(3)];
    expect(calculateStreak(sessions)).toBe(3);
  });

  it('breaks streak on a gap day', () => {
    // Sessions today, yesterday, and 3 days ago (gap at day 2)
    const sessions = [makeSession(0), makeSession(1), makeSession(3)];
    expect(calculateStreak(sessions)).toBe(2);
  });

  it('handles multiple sessions on the same day', () => {
    const sessions = [makeSession(0), makeSession(0), makeSession(1)];
    expect(calculateStreak(sessions)).toBe(2);
  });
});
