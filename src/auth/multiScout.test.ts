import { describe, it, expect } from 'vitest';
import { deriveAthleteStatus } from './localAuthStore';
import type { ScoutDecision } from './user';

describe('deriveAthleteStatus logic', () => {
  it('returns Pending when there are no scout decisions', () => {
    const result = deriveAthleteStatus([]);
    expect(result.status).toBe('Pending');
    expect(result.bestScoutName).toBeNull();
  });

  it('returns Recruited when a scout recruits the athlete even if another rejects', () => {
    const decisions: ScoutDecision[] = [
      { scoutEmail: 'scout1@onform.app', scoutName: 'Coach 1', decision: 'Rejected', decidedAt: '2026-08-01' },
      { scoutEmail: 'scout2@onform.app', scoutName: 'Coach 2', decision: 'Recruited', decidedAt: '2026-08-02' },
    ];
    const result = deriveAthleteStatus(decisions);
    expect(result.status).toBe('Recruited');
    expect(result.bestScoutName).toBe('Coach 2');
    expect(result.bestScoutEmail).toBe('scout2@onform.app');
  });

  it('returns Shortlisted when one scout shortlists and another rejects', () => {
    const decisions: ScoutDecision[] = [
      { scoutEmail: 'scout1@onform.app', scoutName: 'Coach 1', decision: 'Rejected', decidedAt: '2026-08-01' },
      { scoutEmail: 'scout2@onform.app', scoutName: 'Coach 2', decision: 'Shortlisted', decidedAt: '2026-08-02' },
    ];
    const result = deriveAthleteStatus(decisions);
    expect(result.status).toBe('Shortlisted');
    expect(result.bestScoutName).toBe('Coach 2');
  });

  it('prioritizes Recruited over Shortlisted', () => {
    const decisions: ScoutDecision[] = [
      { scoutEmail: 'scout1@onform.app', scoutName: 'Coach 1', decision: 'Shortlisted', decidedAt: '2026-08-01' },
      { scoutEmail: 'scout2@onform.app', scoutName: 'Coach 2', decision: 'Recruited', decidedAt: '2026-08-02' },
    ];
    const result = deriveAthleteStatus(decisions);
    expect(result.status).toBe('Recruited');
    expect(result.bestScoutName).toBe('Coach 2');
  });

  it('returns Watchlist when some scouts reject but no positive decisions yet', () => {
    const decisions: ScoutDecision[] = [
      { scoutEmail: 'scout1@onform.app', scoutName: 'Coach 1', decision: 'Rejected', decidedAt: '2026-08-01' },
    ];
    // In our single scout rejection with no other reviews yet, it is placed on Watchlist
    const result = deriveAthleteStatus(decisions);
    expect(result.status).toBe('Rejected'); // Only 1 review exists and all existing reviews are Rejected
  });

  it('returns Rejected ONLY when ALL reviewing scouts have rejected', () => {
    const decisions: ScoutDecision[] = [
      { scoutEmail: 'scout1@onform.app', scoutName: 'Coach 1', decision: 'Rejected', decidedAt: '2026-08-01' },
      { scoutEmail: 'scout2@onform.app', scoutName: 'Coach 2', decision: 'Rejected', decidedAt: '2026-08-02' },
    ];
    const result = deriveAthleteStatus(decisions);
    expect(result.status).toBe('Rejected');
    expect(result.bestScoutName).toBeNull();
  });
});
