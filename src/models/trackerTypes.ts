import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type RepState = 'up' | 'goingDown' | 'down' | 'goingUp';

export interface TrackerStatus {
  state: RepState | 'holding' | 'broken';
  currentAngle: number;
  validReps: number;
  formBreaks: number;
  isPositionOk: boolean;
  lastEvent: 'rep_completed' | 'form_break' | null;
}

export type NormalizedLandmarkResult = NormalizedLandmark[];

export interface ExerciseTracker {
  processFrame(landmarks: NormalizedLandmarkResult): TrackerStatus;
  reset(): void;
}

export interface Point {
  x: number;
  y: number;
}
