import type { JointTriplet } from '../models/exerciseDefinition';
import type { NormalizedLandmarkResult } from '../models/trackerTypes';
import { calculateAngle, calculateAngle3D } from './angleMath';

/**
 * MediaPipe PoseLandmarker landmark indices (BlazePose 33-point topology)
 * used to resolve each JointTriplet to an actual A-B-C angle (B = vertex).
 *
 * Every non-highKnees joint has a left- and right-side variant. At runtime
 * we pick whichever side MediaPipe currently reports as more visible, so
 * tracking keeps working if the user is angled toward the camera.
 */
type LandmarkTriple = [number, number, number];

const JOINT_LANDMARKS: Record<Exclude<JointTriplet, 'highKnees'>, { left: LandmarkTriple; right: LandmarkTriple }> = {
  // Elbow angle: shoulder -> elbow -> wrist (push-up, bicep curl)
  shoulderElbowWrist: { left: [11, 13, 15], right: [12, 14, 16] },
  // Knee angle: hip -> knee -> ankle (squat, lunge)
  hipKneeAnkle: { left: [23, 25, 27], right: [24, 26, 28] },
  // Hip/torso fold angle: shoulder -> hip -> knee (sit-up)
  shoulderHipKnee: { left: [11, 23, 25], right: [12, 24, 26] },
  // Body straightness angle: shoulder -> hip -> ankle (plank)
  shoulderHipAnkle: { left: [11, 23, 27], right: [12, 24, 28] },
  // Shoulder press arm-raise angle: elbow -> shoulder -> hip
  elbowShoulderHip: { left: [13, 11, 23], right: [14, 12, 24] },
};

/** Minimum average landmark visibility required to trust a computed angle. */
const MIN_VISIBILITY = 0.5;

/**
 * FIX (flaw #2.3 — side selection jitter): a side switch is only accepted
 * once the alternate side is visibly and persistently more reliable than
 * the current one. This prevents single noisy frames (a shadow flicker,
 * a momentary occlusion) from flipping the tracked side mid-rep and
 * causing angle discontinuities / erratic counter jumps.
 */
const SIDE_SWITCH_VISIBILITY_MARGIN = 0.15;
const SIDE_SWITCH_PERSIST_FRAMES = 6;

/** Per-tracking-session mutable state used to debounce side switching. */
export interface SideResolverState {
  side: 'left' | 'right' | null;
  candidateSide: 'left' | 'right' | null;
  candidateStreak: number;
}

export function createSideResolverState(): SideResolverState {
  return { side: null, candidateSide: null, candidateStreak: 0 };
}

export interface ExerciseAngleResult {
  /** Angle in degrees at the joint vertex. */
  angle: number;
  /** Whether the chosen side's landmarks were reliably visible. */
  isPositionOk: boolean;
  /** Which side of the body was used for this frame. */
  side: 'left' | 'right';
}

function averageVisibility(landmarks: NormalizedLandmarkResult, indices: LandmarkTriple): number {
  const total = indices.reduce((sum, i) => sum + (landmarks[i]?.visibility ?? 0), 0);
  return total / indices.length;
}

function resolveSide(
  state: SideResolverState,
  leftVisibility: number,
  rightVisibility: number
): 'left' | 'right' {
  const preferredRaw: 'left' | 'right' = rightVisibility >= leftVisibility ? 'right' : 'left';

  // No side chosen yet — take whichever is currently more visible.
  if (state.side === null) {
    state.side = preferredRaw;
    state.candidateSide = null;
    state.candidateStreak = 0;
    return state.side;
  }

  // Preferred side matches what we're already tracking — reset any pending switch.
  if (preferredRaw === state.side) {
    state.candidateSide = null;
    state.candidateStreak = 0;
    return state.side;
  }

  // Only entertain a switch if the alternate side clears the current side
  // by a real margin (not just a marginal single-frame flicker).
  const currentVis = state.side === 'right' ? rightVisibility : leftVisibility;
  const altVis = preferredRaw === 'right' ? rightVisibility : leftVisibility;
  if (altVis < currentVis + SIDE_SWITCH_VISIBILITY_MARGIN) {
    state.candidateSide = null;
    state.candidateStreak = 0;
    return state.side;
  }

  // Require the candidate side to persist for several consecutive frames.
  if (state.candidateSide === preferredRaw) {
    state.candidateStreak++;
  } else {
    state.candidateSide = preferredRaw;
    state.candidateStreak = 1;
  }

  if (state.candidateStreak >= SIDE_SWITCH_PERSIST_FRAMES) {
    state.side = preferredRaw;
    state.candidateSide = null;
    state.candidateStreak = 0;
  }

  return state.side;
}

/**
 * Resolve the raw joint angle for a given exercise's primaryJoint from a
 * single frame of pose landmarks. Returns null if the joint is `highKnees`
 * (handled separately by HighKneesTracker) or if landmarks are missing.
 *
 * @param landmarks 2D normalized screen-space landmarks (always available).
 * @param joint the joint triplet to resolve for the active exercise.
 * @param worldLandmarks optional metric 3D world-space landmarks. FIX for
 *   flaw #2.2: when supplied, the angle is computed in 3D to avoid
 *   perspective-foreshortening distortion when the user isn't square to
 *   the camera. Falls back to the 2D calculation if unavailable.
 * @param sideState optional mutable hysteresis state (create one per
 *   tracking session with `createSideResolverState()`) to fix flaw #2.3.
 *   If omitted, side is chosen per-frame with no debounce (legacy behavior).
 */
export function getExerciseAngle(
  landmarks: NormalizedLandmarkResult,
  joint: JointTriplet,
  worldLandmarks?: NormalizedLandmarkResult | null,
  sideState?: SideResolverState
): ExerciseAngleResult | null {
  if (joint === 'highKnees') return null;

  const config = JOINT_LANDMARKS[joint];
  const leftVisibility = averageVisibility(landmarks, config.left);
  const rightVisibility = averageVisibility(landmarks, config.right);

  const side: 'left' | 'right' = sideState
    ? resolveSide(sideState, leftVisibility, rightVisibility)
    : rightVisibility >= leftVisibility
      ? 'right'
      : 'left';

  const [aIdx, bIdx, cIdx] = config[side];
  const visibility = side === 'right' ? rightVisibility : leftVisibility;

  const A = landmarks[aIdx];
  const B = landmarks[bIdx];
  const C = landmarks[cIdx];
  if (!A || !B || !C) return null;

  let angle: number;
  const wA = worldLandmarks?.[aIdx];
  const wB = worldLandmarks?.[bIdx];
  const wC = worldLandmarks?.[cIdx];
  if (wA && wB && wC) {
    angle = calculateAngle3D(wA, wB, wC);
  } else {
    angle = calculateAngle(A, B, C);
  }

  return {
    angle,
    isPositionOk: visibility >= MIN_VISIBILITY,
    side,
  };
}
