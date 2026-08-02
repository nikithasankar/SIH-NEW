import { describe, it, expect } from 'vitest';
import { RepStateMachine } from './repStateMachine';
import type { ExerciseDefinition } from '../models/exerciseDefinition';

// Helper: create a push-up exercise definition
const pushupDef: ExerciseDefinition = {
  id: 'pushup',
  displayName: 'Push-Up',
  iconAsset: '💪',
  mode: 'repBased',
  primaryJoint: 'shoulderElbowWrist',
  upThresholdDeg: 160,
  downThresholdDeg: 90,
  isInverted: false,
};

// Helper: create a shoulder press exercise definition (inverted)
const shoulderPressDef: ExerciseDefinition = {
  id: 'shoulder_press',
  displayName: 'Shoulder Press',
  iconAsset: '🏋️‍♂️',
  mode: 'repBased',
  primaryJoint: 'elbowShoulderHip',
  upThresholdDeg: 90,
  downThresholdDeg: 160,
  isInverted: true,
};

/**
 * Helper to feed a sequence of angle values and bypass the smoother's
 * averaging effect by repeating each value enough times (5) to fill
 * the smoother buffer completely with that value.
 */
function feedStableAngle(machine: RepStateMachine, angle: number, times: number = 5) {
  let status;
  for (let i = 0; i < times; i++) {
    status = machine.processAngle(angle);
  }
  return status!;
}

/**
 * Feed an angle sequence and collect ALL events that fire across all frames.
 * This is needed because lastEvent is cleared each frame, so cheat detection
 * events can fire on an intermediate frame during smoother transition.
 */
function feedAndCollectEvents(machine: RepStateMachine, angle: number, times: number = 5) {
  const events: Array<'rep_completed' | 'form_break'> = [];
  let status;
  for (let i = 0; i < times; i++) {
    status = machine.processAngle(angle);
    if (status.lastEvent) events.push(status.lastEvent);
  }
  return { status: status!, events };
}

describe('RepStateMachine — Normal (Push-Up)', () => {
  it('starts in UP state', () => {
    const m = new RepStateMachine(pushupDef);
    const s = feedStableAngle(m, 170);
    expect(s.state).toBe('up');
    expect(s.validReps).toBe(0);
  });

  it('transitions UP → GOING_DOWN when angle drops below (upThreshold - 10°)', () => {
    const m = new RepStateMachine(pushupDef);
    feedStableAngle(m, 170); // UP
    // upThreshold - 10 = 150. Need angle < 150
    const s = feedStableAngle(m, 145);
    expect(s.state).toBe('goingDown');
  });

  it('does NOT transition UP → GOING_DOWN within the 10° buffer', () => {
    const m = new RepStateMachine(pushupDef);
    feedStableAngle(m, 170); // UP
    // 155 is > 150, so should stay in UP
    const s = feedStableAngle(m, 155);
    expect(s.state).toBe('up');
  });

  it('transitions GOING_DOWN → DOWN when angle reaches downThreshold', () => {
    const m = new RepStateMachine(pushupDef);
    feedStableAngle(m, 170); // UP
    feedStableAngle(m, 145); // GOING_DOWN
    const s = feedStableAngle(m, 85); // below downThreshold (90)
    expect(s.state).toBe('down');
  });

  it('transitions DOWN → GOING_UP when angle rises past (downThreshold + 10°)', () => {
    const m = new RepStateMachine(pushupDef);
    feedStableAngle(m, 170);
    feedStableAngle(m, 145);
    feedStableAngle(m, 85);  // DOWN
    // downThreshold + 10 = 100. Need angle > 100
    const s = feedStableAngle(m, 105);
    expect(s.state).toBe('goingUp');
  });

  it('does NOT transition DOWN → GOING_UP within the 10° buffer', () => {
    const m = new RepStateMachine(pushupDef);
    feedStableAngle(m, 170);
    feedStableAngle(m, 145);
    feedStableAngle(m, 85);  // DOWN
    // 95 is within the buffer (needs > 100)
    const s = feedStableAngle(m, 95);
    expect(s.state).toBe('down');
  });

  it('completes a full rep: UP → GOING_DOWN → DOWN → GOING_UP → UP', () => {
    const m = new RepStateMachine(pushupDef);
    feedStableAngle(m, 170); // UP
    feedStableAngle(m, 145); // GOING_DOWN
    feedStableAngle(m, 85);  // DOWN
    feedStableAngle(m, 105); // GOING_UP
    const s = feedStableAngle(m, 165); // back to UP
    expect(s.state).toBe('up');
    expect(s.validReps).toBe(1);
    expect(s.lastEvent).toBe('rep_completed');
  });

  it('counts multiple reps correctly', () => {
    const m = new RepStateMachine(pushupDef);
    for (let rep = 0; rep < 3; rep++) {
      feedStableAngle(m, 170);
      feedStableAngle(m, 145);
      feedStableAngle(m, 85);
      feedStableAngle(m, 105);
      feedStableAngle(m, 165);
    }
    const s = feedStableAngle(m, 170);
    expect(s.validReps).toBe(3);
  });

  it('detects cheat (form break) when angle rises past extremeAngle + 15° before reaching downThreshold', () => {
    const m = new RepStateMachine(pushupDef);
    feedStableAngle(m, 170); // UP
    feedStableAngle(m, 145); // GOING_DOWN, extremeAngle = ~145
    feedStableAngle(m, 120); // Still GOING_DOWN, extremeAngle = ~120
    // Now rise back up past extremeAngle + 15°. Use a wide enough gap
    // so the smoother settles above the cheat threshold.
    const { status: s, events } = feedAndCollectEvents(m, 155, 8);
    expect(s.formBreaks).toBe(1);
    expect(events).toContain('form_break');
    expect(s.state).toBe('goingUp'); // Transitions to GOING_UP, not UP
    expect(s.validReps).toBe(0); // No rep counted
  });

  it('does NOT trigger form break if angle stays close to extremeAngle (within 15°)', () => {
    const m = new RepStateMachine(pushupDef);
    feedStableAngle(m, 170);
    feedStableAngle(m, 145); // GOING_DOWN, extremeAngle = 145
    feedStableAngle(m, 130); // extremeAngle = 130
    // Rise slightly but within 15° of extremeAngle
    const s = feedStableAngle(m, 142); // 142 < 130 + 15 = 145
    expect(s.formBreaks).toBe(0);
    expect(s.state).toBe('goingDown'); // Still going down
  });

  it('does NOT count a cheated rep, but can still complete a clean rep afterwards', () => {
    // FIX for flaw #2.1: a cheat/form-break recovering to lockout must NOT
    // increment validReps. Only a goingUp phase that passed through a real
    // `down` (full range of motion) may count.
    const m = new RepStateMachine(pushupDef);
    feedStableAngle(m, 170); // UP
    feedStableAngle(m, 145); // GOING_DOWN
    feedStableAngle(m, 120); // GOING_DOWN, extremeAngle = ~120
    feedStableAngle(m, 155, 8); // CHEAT → GOING_UP, formBreaks = 1
    const cheatRecovery = feedStableAngle(m, 170, 8); // GOING_UP → UP, no rep should be counted
    expect(cheatRecovery.validReps).toBe(0);
    expect(cheatRecovery.formBreaks).toBe(1);

    // Now do a clean rep
    feedStableAngle(m, 170);
    feedStableAngle(m, 145);
    feedStableAngle(m, 85);
    feedStableAngle(m, 105);
    const s = feedStableAngle(m, 165);
    // Only 1 rep total: the clean one. The cheated attempt earned nothing.
    expect(s.validReps).toBe(1);
    expect(s.formBreaks).toBe(1);
  });

  it('resets all state correctly', () => {
    const m = new RepStateMachine(pushupDef);
    feedStableAngle(m, 170);
    feedStableAngle(m, 145);
    feedStableAngle(m, 85);
    feedStableAngle(m, 105);
    feedStableAngle(m, 165);
    expect(feedStableAngle(m, 170).validReps).toBe(1);

    m.reset();
    const s = feedStableAngle(m, 170);
    expect(s.validReps).toBe(0);
    expect(s.formBreaks).toBe(0);
    expect(s.state).toBe('up');
  });
});

describe('RepStateMachine — Inverted (Shoulder Press)', () => {
  it('starts in UP state (flexed ~90°)', () => {
    const m = new RepStateMachine(shoulderPressDef);
    const s = feedStableAngle(m, 85);
    expect(s.state).toBe('up');
  });

  it('transitions UP → GOING_DOWN when angle rises past (upThreshold + 10°)', () => {
    const m = new RepStateMachine(shoulderPressDef);
    feedStableAngle(m, 85); // UP at 85° (below upThreshold 90°)
    // For inverted: UP → GOING_DOWN when angle > (90 + 10) = 100
    const s = feedStableAngle(m, 105);
    expect(s.state).toBe('goingDown');
  });

  it('does NOT transition UP → GOING_DOWN within the 10° buffer (inverted)', () => {
    const m = new RepStateMachine(shoulderPressDef);
    feedStableAngle(m, 85);
    // 95 is < 100, should stay in UP
    const s = feedStableAngle(m, 95);
    expect(s.state).toBe('up');
  });

  it('transitions GOING_DOWN → DOWN when angle exceeds downThreshold (inverted)', () => {
    const m = new RepStateMachine(shoulderPressDef);
    feedStableAngle(m, 85);  // UP
    feedStableAngle(m, 105); // GOING_DOWN
    // For inverted: GOING_DOWN → DOWN when angle > downThreshold (160)
    const s = feedStableAngle(m, 165);
    expect(s.state).toBe('down');
  });

  it('transitions DOWN → GOING_UP when angle drops below (downThreshold - 10°) (inverted)', () => {
    const m = new RepStateMachine(shoulderPressDef);
    feedStableAngle(m, 85);
    feedStableAngle(m, 105);
    feedStableAngle(m, 165); // DOWN
    // For inverted: DOWN → GOING_UP when angle < (160 - 10) = 150
    const s = feedStableAngle(m, 145);
    expect(s.state).toBe('goingUp');
  });

  it('completes a full inverted rep', () => {
    const m = new RepStateMachine(shoulderPressDef);
    feedStableAngle(m, 85);  // UP
    feedStableAngle(m, 105); // GOING_DOWN
    feedStableAngle(m, 165); // DOWN
    feedStableAngle(m, 145); // GOING_UP
    // For inverted: GOING_UP → UP when angle < upThreshold (90)
    const s = feedStableAngle(m, 85);
    expect(s.state).toBe('up');
    expect(s.validReps).toBe(1);
    expect(s.lastEvent).toBe('rep_completed');
  });

  it('detects cheat in inverted mode (angle drops before reaching full extension)', () => {
    const m = new RepStateMachine(shoulderPressDef);
    feedStableAngle(m, 85);  // UP
    feedStableAngle(m, 105); // GOING_DOWN, extremeAngle = ~105
    feedStableAngle(m, 140); // GOING_DOWN, extremeAngle = ~140
    // For inverted cheat: angle < (extremeAngle - 15) before reaching downThreshold
    // extremeAngle = ~140, so cheat if angle < 125. Use wide gap.
    const { status: s, events } = feedAndCollectEvents(m, 105, 8);
    expect(s.formBreaks).toBe(1);
    expect(events).toContain('form_break');
    expect(s.state).toBe('goingUp');
    expect(s.validReps).toBe(0);
  });
});
