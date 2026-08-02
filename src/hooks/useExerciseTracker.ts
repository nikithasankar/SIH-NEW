/**
 * Exercise tracker hook — Phase 5.
 *
 * Bridges live MediaPipe landmarks into the pure logic classes
 * (RepStateMachine / HoldTimer / HighKneesTracker), based on the active
 * ExerciseDefinition, and exposes the resulting TrackerStatus as React
 * state so screens can render it directly.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExerciseDefinition } from '../models/exerciseDefinition';
import type { NormalizedLandmarkResult, TrackerStatus } from '../models/trackerTypes';
import { RepStateMachine } from '../logic/repStateMachine';
import { HoldTimer } from '../logic/holdTimer';
import { HighKneesTracker } from '../logic/highKneesTracker';
import { getExerciseAngle, createSideResolverState, type SideResolverState } from '../logic/jointConfig';

type Tracker = RepStateMachine | HoldTimer | HighKneesTracker;

const INITIAL_STATUS: TrackerStatus = {
  state: 'up',
  currentAngle: 0,
  validReps: 0,
  formBreaks: 0,
  isPositionOk: false,
  lastEvent: null,
};

interface UseExerciseTrackerResult {
  status: TrackerStatus;
  /** Feed one frame's landmarks (2D + optional 3D world) into the active tracker. */
  processFrame: (landmarks: NormalizedLandmarkResult | null, worldLandmarks?: NormalizedLandmarkResult | null) => void;
  /** Reset counters/state (e.g. before starting a new attempt). */
  reset: () => void;
}

function createTracker(exercise: ExerciseDefinition): Tracker {
  if (exercise.primaryJoint === 'highKnees') {
    return new HighKneesTracker();
  }
  if (exercise.mode === 'timeBased') {
    return new HoldTimer(exercise);
  }
  return new RepStateMachine(exercise);
}

export function useExerciseTracker(exercise: ExerciseDefinition | undefined): UseExerciseTrackerResult {
  const trackerRef = useRef<Tracker | null>(null);
  // FIX (flaw #2.3): persistent hysteresis state so side selection doesn't
  // reset (and re-jitter) every frame — one resolver per tracking session.
  const sideStateRef = useRef<SideResolverState>(createSideResolverState());
  const [status, setStatus] = useState<TrackerStatus>(INITIAL_STATUS);

  // (Re)instantiate the correct tracker whenever the exercise changes.
  useEffect(() => {
    trackerRef.current = exercise ? createTracker(exercise) : null;
    sideStateRef.current = createSideResolverState();
    setStatus(INITIAL_STATUS);
  }, [exercise]);

  const processFrame = useCallback(
    (landmarks: NormalizedLandmarkResult | null, worldLandmarks?: NormalizedLandmarkResult | null) => {
      const tracker = trackerRef.current;
      if (!exercise || !tracker || !landmarks || landmarks.length === 0) {
        return;
      }

      if (tracker instanceof HighKneesTracker) {
        setStatus(tracker.processFrame(landmarks));
        return;
      }

      // FIX: pass worldLandmarks (3D) + persistent side state (hysteresis)
      const angleResult = getExerciseAngle(landmarks, exercise.primaryJoint, worldLandmarks, sideStateRef.current);
      if (!angleResult) {
        setStatus((prev) => ({ ...prev, isPositionOk: false }));
        return;
      }

      if (tracker instanceof HoldTimer) {
        const next = tracker.processAngle(angleResult.angle, performance.now());
        // next.isPositionOk reflects "currently inside the hold band"; here we
        // report visibility instead so the pill means "camera can see you".
        setStatus({ ...next, isPositionOk: angleResult.isPositionOk });
      } else {
        const next = tracker.processAngle(angleResult.angle);
        setStatus({ ...next, isPositionOk: angleResult.isPositionOk });
      }
    },
    [exercise]
  );

  const reset = useCallback(() => {
    trackerRef.current?.reset();
    sideStateRef.current = createSideResolverState();
    setStatus(INITIAL_STATUS);
  }, []);

  return { status, processFrame, reset };
}
