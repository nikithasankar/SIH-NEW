import type { TrackerStatus } from '../models/trackerTypes';
import type { ExerciseDefinition } from '../models/exerciseDefinition';
import { AngleSmoother } from './angleMath';

/**
 * Hold timer for time-based exercises (plank).
 *
 * Valid band: downThreshold ≤ angle ≤ upThreshold (e.g. 160°–180°)
 * While inside the band: accumulate holdSeconds (once per real second elapsed, not per frame)
 * On exiting the band: formBreaks++, pause accumulation until back in-band
 *
 * FIX (flaw #2.5 — form-break thrashing on boundary): a plain single
 * threshold flickers dozens of times a second when the angle hovers right
 * at the boundary (e.g. 159.9° ↔ 160.1° landmark noise). We now apply a
 * ±HYSTERESIS_DEG buffer: once in-band, the user must drop *below*
 * (lowerBound - HYSTERESIS_DEG) to be considered "broken", and once broken,
 * must rise back *above* (lowerBound + HYSTERESIS_DEG) to re-enter. This
 * mirrors the same hysteresis technique already used in RepStateMachine.
 */
const HYSTERESIS_DEG = 3;

export class HoldTimer {
  private holdSeconds = 0;
  private formBreaks = 0;
  private currentAngle = 0;
  private isInBand = false;
  private lastEvent: 'rep_completed' | 'form_break' | null = null;
  private smoother = new AngleSmoother(5);

  /** Timestamp (ms) when the current in-band stretch began */
  private bandEntryTime: number | null = null;
  /** Accumulated hold time from previous in-band stretches (ms) */
  private accumulatedMs = 0;

  private readonly lowerBound: number;
  private readonly upperBound: number;

  constructor(exercise: ExerciseDefinition) {
    this.lowerBound = exercise.downThresholdDeg; // 160° for plank
    this.upperBound = exercise.upThresholdDeg;   // 180° for plank
  }

  /**
   * Process a single frame's raw angle value.
   * @param rawAngle - The raw angle in degrees
   * @param timestampMs - The current timestamp in milliseconds (e.g. performance.now())
   */
  processAngle(rawAngle: number, timestampMs: number): TrackerStatus {
    const angle = this.smoother.push(rawAngle);
    this.currentAngle = angle;
    this.lastEvent = null;

    // FIX: hysteresis buffer — the exit/re-entry threshold differs from the
    // pure lowerBound depending on which side we're currently on.
    const effectiveLowerBound = this.isInBand
      ? this.lowerBound - HYSTERESIS_DEG
      : this.lowerBound + HYSTERESIS_DEG;
    const inBand = angle >= effectiveLowerBound && angle <= this.upperBound + HYSTERESIS_DEG;

    if (inBand) {
      if (!this.isInBand) {
        // Just entered the band
        this.isInBand = true;
        this.bandEntryTime = timestampMs;
      }
      // Update hold seconds from accumulated + current stretch
      const currentStretchMs = timestampMs - (this.bandEntryTime ?? timestampMs);
      this.holdSeconds = Math.floor((this.accumulatedMs + currentStretchMs) / 1000);
    } else {
      if (this.isInBand) {
        // Just left the band — form break
        // Finalize the time from the stretch that just ended
        const currentStretchMs = timestampMs - (this.bandEntryTime ?? timestampMs);
        this.accumulatedMs += currentStretchMs;
        this.holdSeconds = Math.floor(this.accumulatedMs / 1000);

        this.formBreaks++;
        this.lastEvent = 'form_break';
        this.isInBand = false;
        this.bandEntryTime = null;
      }
    }

    return this.getStatus();
  }

  getStatus(): TrackerStatus {
    return {
      state: this.isInBand ? 'holding' : 'broken',
      currentAngle: this.currentAngle,
      validReps: this.holdSeconds,  // validReps doubles as hold seconds for time-based
      formBreaks: this.formBreaks,
      isPositionOk: this.isInBand,
      lastEvent: this.lastEvent,
    };
  }

  reset(): void {
    this.holdSeconds = 0;
    this.formBreaks = 0;
    this.currentAngle = 0;
    this.isInBand = false;
    this.lastEvent = null;
    this.bandEntryTime = null;
    this.accumulatedMs = 0;
    this.smoother.reset();
  }
}
