import { describe, it, expect } from 'vitest';
import { HoldTimer } from './holdTimer';
import type { ExerciseDefinition } from '../models/exerciseDefinition';

const plankDef: ExerciseDefinition = {
  id: 'plank',
  displayName: 'Plank',
  iconAsset: '🧘',
  mode: 'timeBased',
  primaryJoint: 'shoulderHipAnkle',
  upThresholdDeg: 180,
  downThresholdDeg: 160,
  isInverted: false,
};

/**
 * Feed a stable angle to fill the smoother buffer (5 frames),
 * advancing the timestamp by intervalMs per frame.
 */
function feedStable(
  timer: HoldTimer,
  angle: number,
  startMs: number,
  intervalMs: number = 100,
  frames: number = 5
) {
  let status;
  for (let i = 0; i < frames; i++) {
    status = timer.processAngle(angle, startMs + i * intervalMs);
  }
  return { status: status!, endMs: startMs + (frames - 1) * intervalMs };
}

describe('HoldTimer (Plank)', () => {
  it('starts in broken state (not yet in band)', () => {
    const t = new HoldTimer(plankDef);
    const s = t.getStatus();
    expect(s.state).toBe('broken');
    expect(s.validReps).toBe(0); // holdSeconds
  });

  it('enters holding state when angle is within band (160°–180°)', () => {
    const t = new HoldTimer(plankDef);
    const { status } = feedStable(t, 170, 0);
    expect(status.state).toBe('holding');
    expect(status.isPositionOk).toBe(true);
  });

  it('does NOT enter holding state when angle is below band', () => {
    const t = new HoldTimer(plankDef);
    const { status } = feedStable(t, 150, 0);
    expect(status.state).toBe('broken');
    expect(status.isPositionOk).toBe(false);
  });

  it('accumulates hold seconds by real time, not frame count', () => {
    const t = new HoldTimer(plankDef);
    // Feed 170° for 3 seconds worth of frames (at 30fps = 90 frames, 33ms apart)
    let timeMs = 0;
    for (let i = 0; i < 90; i++) {
      t.processAngle(170, timeMs);
      timeMs += 33; // ~30fps
    }
    const s = t.getStatus();
    // ~3 seconds (90 * 33ms = 2970ms → floor = 2 seconds)
    expect(s.validReps).toBeGreaterThanOrEqual(2);
    expect(s.validReps).toBeLessThanOrEqual(3);
  });

  it('increments formBreaks when exiting the band', () => {
    const t = new HoldTimer(plankDef);
    // Enter the band
    let timeMs = 0;
    for (let i = 0; i < 5; i++) {
      t.processAngle(170, timeMs);
      timeMs += 100;
    }
    expect(t.getStatus().state).toBe('holding');

    // Exit the band
    for (let i = 0; i < 5; i++) {
      t.processAngle(140, timeMs);
      timeMs += 100;
    }
    const s = t.getStatus();
    expect(s.formBreaks).toBe(1);
    expect(s.state).toBe('broken');
  });

  it('fires form_break event only on the transition out of band', () => {
    const t = new HoldTimer(plankDef);
    let timeMs = 0;
    // Enter band
    for (let i = 0; i < 5; i++) {
      t.processAngle(170, timeMs);
      timeMs += 100;
    }

    // The first frame below band (after smoother settles) triggers form_break
    // Feed enough frames of 140° to settle the smoother
    let formBreakSeen = false;
    for (let i = 0; i < 10; i++) {
      const s = t.processAngle(140, timeMs);
      if (s.lastEvent === 'form_break') formBreakSeen = true;
      timeMs += 100;
    }
    expect(formBreakSeen).toBe(true);
    expect(t.getStatus().formBreaks).toBe(1);
  });

  it('resumes accumulation when returning to band', () => {
    const t = new HoldTimer(plankDef);
    let timeMs = 0;

    // Hold for 2 seconds
    for (let i = 0; i < 60; i++) {
      t.processAngle(170, timeMs);
      timeMs += 33;
    }
    const holdAfterFirst = t.getStatus().validReps;

    // Break form for a bit
    for (let i = 0; i < 30; i++) {
      t.processAngle(140, timeMs);
      timeMs += 33;
    }

    // Return to band for another 2 seconds
    for (let i = 0; i < 60; i++) {
      t.processAngle(170, timeMs);
      timeMs += 33;
    }
    const s = t.getStatus();
    // Total hold should be approximately holdAfterFirst + 2 more seconds
    expect(s.validReps).toBeGreaterThan(holdAfterFirst);
    expect(s.formBreaks).toBe(1);
  });

  it('resets correctly', () => {
    const t = new HoldTimer(plankDef);
    for (let i = 0; i < 30; i++) {
      t.processAngle(170, i * 100);
    }
    expect(t.getStatus().validReps).toBeGreaterThan(0);

    t.reset();
    const s = t.getStatus();
    expect(s.validReps).toBe(0);
    expect(s.formBreaks).toBe(0);
    expect(s.state).toBe('broken');
  });
});
