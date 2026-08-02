import type { TrackerStatus, NormalizedLandmarkResult } from '../models/trackerTypes';
import { distance } from './angleMath';

// MediaPipe PoseLandmarker indices
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12; // FIX (flaw #2.4): now used for a bilateral torso scale
const LEFT_HIP = 23;
const RIGHT_HIP = 24;
const LEFT_KNEE = 25;
const RIGHT_KNEE = 26;

/** Minimum visibility score for a landmark to be considered reliable */
const MIN_VISIBILITY = 0.6;

/**
 * High Knees tracker — uses body-scale-relative Y-coordinate checks,
 * NOT literal pixel offsets from the Flutter source.
 *
 * MediaPipe returns normalized coordinates (0.0–1.0) regardless of
 * video resolution. The original Flutter constants (20.0, 60.0) are
 * meaningless in normalized space.
 *
 * Instead: torsoScale = distance(shoulder, hip), raiseThreshold = torsoScale * 0.15
 * This is resolution- and distance-independent.
 *
 * Alternating check: if the same leg raises twice consecutively,
 * it's a form break, not a valid rep.
 *
 * FIX (flaw #2.4a — single-side torso scale): torsoScale now averages both
 * the left and right shoulder-hip distances, so the tracker keeps working
 * (and stays accurately scaled) even if the user turns and one side is
 * partially occluded.
 *
 * FIX (flaw #2.4b — vertical oscillation from running/jumping in place):
 * the raise test no longer compares knee.y against the *instantaneous*
 * hip.y. Because running/jumping in place moves the whole body (hips
 * included) up and down together, that produced missed reps and false
 * triggers. Instead we keep a slow-moving baseline of hip height (an
 * exponential low-pass filter) and compare the knee to that baseline,
 * which is far less sensitive to the whole-body bounce riding on top of
 * the genuine per-step knee raise.
 */
export class HighKneesTracker {
  private validReps = 0;
  private formBreaks = 0;
  private lastEvent: 'rep_completed' | 'form_break' | null = null;
  private lastLeg: 'left' | 'right' | null = null;

  /** Was a leg raised in the previous frame? Track per-leg to detect transitions. */
  private leftWasUp = false;
  private rightWasUp = false;

  /** Slow-moving baseline hip height (normalized y), low-pass filtered. */
  private baselineHipY: number | null = null;
  private readonly baselineSmoothing = 0.02; // ~small alpha = slow-moving baseline

  /** Tunable multiplier for raise threshold relative to torso length */
  private readonly raiseMultiplier: number;

  constructor(raiseMultiplier: number = 0.15) {
    this.raiseMultiplier = raiseMultiplier;
  }

  processFrame(landmarks: NormalizedLandmarkResult): TrackerStatus {
    this.lastEvent = null;

    // Check visibility of required landmarks
    const requiredIndices = [LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP, LEFT_KNEE, RIGHT_KNEE];
    const allVisible = requiredIndices.every(
      (i) => landmarks[i] && (landmarks[i].visibility ?? 0) > MIN_VISIBILITY
    );

    if (!allVisible) {
      return this.getStatus(false);
    }

    const leftShoulder = landmarks[LEFT_SHOULDER];
    const rightShoulder = landmarks[RIGHT_SHOULDER];
    const leftHip = landmarks[LEFT_HIP];
    const rightHip = landmarks[RIGHT_HIP];
    const leftKnee = landmarks[LEFT_KNEE];
    const rightKnee = landmarks[RIGHT_KNEE];

    // FIX: bilateral torso scale — average of both sides instead of left-only.
    const torsoScale =
      (distance({ x: leftShoulder.x, y: leftShoulder.y }, { x: leftHip.x, y: leftHip.y }) +
        distance({ x: rightShoulder.x, y: rightShoulder.y }, { x: rightHip.x, y: rightHip.y })) /
      2;
    const raiseThreshold = torsoScale * this.raiseMultiplier;

    // FIX: compare against a slow-moving baseline hip height rather than
    // the instantaneous hip position, so whole-body bounce (running/jumping
    // in place) doesn't mask or fake a knee raise.
    const currentHipY = (leftHip.y + rightHip.y) / 2;
    if (this.baselineHipY === null) {
      this.baselineHipY = currentHipY;
    } else {
      this.baselineHipY += (currentHipY - this.baselineHipY) * this.baselineSmoothing;
    }

    // In normalized coords, Y increases downward (0 = top, 1 = bottom)
    // Knee raised = knee.y < baselineHip.y - raiseThreshold
    const leftUp = leftKnee.y < (this.baselineHipY - raiseThreshold);
    const rightUp = rightKnee.y < (this.baselineHipY - raiseThreshold);

    // Detect rising edge (transition from not-up to up)
    if (leftUp && !this.leftWasUp) {
      this.handleLegRaise('left');
    }

    if (rightUp && !this.rightWasUp) {
      this.handleLegRaise('right');
    }

    this.leftWasUp = leftUp;
    this.rightWasUp = rightUp;

    return this.getStatus(true);
  }

  private handleLegRaise(leg: 'left' | 'right'): void {
    if (this.lastLeg === null) {
      // First raise — always valid
      this.validReps++;
      this.lastEvent = 'rep_completed';
      this.lastLeg = leg;
    } else if (this.lastLeg === leg) {
      // Same leg raised consecutively — form break
      this.formBreaks++;
      this.lastEvent = 'form_break';
      // Don't update lastLeg — still waiting for the other leg
    } else {
      // Alternating leg — valid rep
      this.validReps++;
      this.lastEvent = 'rep_completed';
      this.lastLeg = leg;
    }
  }

  private getStatus(isPositionOk: boolean): TrackerStatus {
    return {
      state: 'up', // High knees doesn't use the 4-state machine
      currentAngle: 0,
      validReps: this.validReps,
      formBreaks: this.formBreaks,
      isPositionOk,
      lastEvent: this.lastEvent,
    };
  }

  reset(): void {
    this.validReps = 0;
    this.formBreaks = 0;
    this.lastEvent = null;
    this.lastLeg = null;
    this.leftWasUp = false;
    this.rightWasUp = false;
    this.baselineHipY = null;
  }
}
