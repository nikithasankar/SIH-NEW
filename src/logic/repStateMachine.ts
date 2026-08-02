import type { RepState, TrackerStatus } from '../models/trackerTypes';
import type { ExerciseDefinition } from '../models/exerciseDefinition';
import { AngleSmoother } from './angleMath';

/**
 * 4-state rep counter state machine.
 *
 * States: UP → GOING_DOWN → DOWN → GOING_UP → UP (1 rep)
 *
 * Key behaviors:
 * - 10° hysteresis buffers at every transition to prevent jitter flickering
 * - extremeAngle tracking during GOING_DOWN for cheat detection
 * - Cheat/form-break: if angle rises back past (extremeAngle + 15°)
 *   before reaching downThreshold → formBreak, skip to GOING_UP
 * - Inverted exercises (shoulder press): all comparison directions flip
 */
export class RepStateMachine {
  private state: RepState = 'up';
  private validReps = 0;
  private formBreaks = 0;
  private extremeAngle = 0;
  private currentAngle = 0;
  private lastEvent: 'rep_completed' | 'form_break' | null = null;
  /**
   * FIX (flaw #2.1 — cheated reps counted as valid):
   * Only a `goingUp` phase reached via `down` (full depth) should ever
   * count a rep. A `goingUp` phase reached via a cheat/form-break in
   * `goingDown` must NOT increment validReps when the user locks back out.
   */
  private reachedFullRange = false;
  private smoother = new AngleSmoother(5);

  private readonly upThreshold: number;
  private readonly downThreshold: number;
  private readonly isInverted: boolean;

  constructor(exercise: ExerciseDefinition) {
    this.upThreshold = exercise.upThresholdDeg;
    this.downThreshold = exercise.downThresholdDeg;
    this.isInverted = exercise.isInverted ?? false;
  }

  /**
   * Process a single frame's raw angle value through the state machine.
   * The angle is smoothed internally via the 5-frame moving average.
   */
  processAngle(rawAngle: number): TrackerStatus {
    const angle = this.smoother.push(rawAngle);
    this.currentAngle = angle;
    this.lastEvent = null;

    if (this.isInverted) {
      this.processInverted(angle);
    } else {
      this.processNormal(angle);
    }

    return this.getStatus();
  }

  /**
   * Normal (non-inverted) state machine.
   * UP is the extended position (high angle), DOWN is the flexed position (low angle).
   *
   * UP → GOING_DOWN: angle < (upThreshold - 10°)
   * GOING_DOWN → DOWN: angle < downThreshold
   * DOWN → GOING_UP: angle > (downThreshold + 10°)
   * GOING_UP → UP: angle > upThreshold → rep counted
   *
   * Cheat in GOING_DOWN: angle > (extremeAngle + 15°) before reaching downThreshold
   */
  private processNormal(angle: number): void {
    switch (this.state) {
      case 'up':
        if (angle < this.upThreshold - 10) {
          this.state = 'goingDown';
          this.extremeAngle = angle;
        }
        break;

      case 'goingDown':
        // Track the deepest angle reached
        this.extremeAngle = Math.min(this.extremeAngle, angle);

        if (angle < this.downThreshold) {
          // Full depth reached
          this.state = 'down';
        } else if (angle > this.extremeAngle + 15) {
          // Cheat: came back up before reaching full depth
          this.formBreaks++;
          this.lastEvent = 'form_break';
          this.reachedFullRange = false; // FIX: mark this goingUp as cheat-sourced
          this.state = 'goingUp';
        }
        break;

      case 'down':
        if (angle > this.downThreshold + 10) {
          this.reachedFullRange = true; // FIX: only the true path sets this
          this.state = 'goingUp';
        }
        break;

      case 'goingUp':
        if (angle > this.upThreshold) {
          // FIX: only count the rep if this goingUp phase followed a real
          // `down` (full range of motion), never a cheat/form-break.
          if (this.reachedFullRange) {
            this.validReps++;
            this.lastEvent = 'rep_completed';
          }
          this.reachedFullRange = false;
          this.state = 'up';
        }
        break;
    }
  }

  /**
   * Inverted state machine (shoulder press).
   * UP is the flexed position (low angle ~90°), DOWN is overhead (high angle ~160°).
   * All comparison directions are flipped.
   *
   * UP → GOING_DOWN: angle > (upThreshold + 10°)
   * GOING_DOWN → DOWN: angle > downThreshold
   * DOWN → GOING_UP: angle < (downThreshold - 10°)
   * GOING_UP → UP: angle < upThreshold → rep counted
   *
   * Cheat in GOING_DOWN: angle < (extremeAngle - 15°) before reaching downThreshold
   */
  private processInverted(angle: number): void {
    switch (this.state) {
      case 'up':
        if (angle > this.upThreshold + 10) {
          this.state = 'goingDown';
          this.extremeAngle = angle;
        }
        break;

      case 'goingDown':
        // Track the most extreme angle reached (highest for inverted)
        this.extremeAngle = Math.max(this.extremeAngle, angle);

        if (angle > this.downThreshold) {
          // Full extension reached
          this.state = 'down';
        } else if (angle < this.extremeAngle - 15) {
          // Cheat: came back down before reaching full extension
          this.formBreaks++;
          this.lastEvent = 'form_break';
          this.reachedFullRange = false; // FIX
          this.state = 'goingUp';
        }
        break;

      case 'down':
        if (angle < this.downThreshold - 10) {
          this.reachedFullRange = true; // FIX
          this.state = 'goingUp';
        }
        break;

      case 'goingUp':
        if (angle < this.upThreshold) {
          if (this.reachedFullRange) {
            this.validReps++;
            this.lastEvent = 'rep_completed';
          }
          this.reachedFullRange = false;
          this.state = 'up';
        }
        break;
    }
  }

  getStatus(): TrackerStatus {
    return {
      state: this.state,
      currentAngle: this.currentAngle,
      validReps: this.validReps,
      formBreaks: this.formBreaks,
      isPositionOk: true,
      lastEvent: this.lastEvent,
    };
  }

  reset(): void {
    this.state = 'up';
    this.validReps = 0;
    this.formBreaks = 0;
    this.extremeAngle = 0;
    this.currentAngle = 0;
    this.lastEvent = null;
    this.reachedFullRange = false;
    this.smoother.reset();
  }
}
