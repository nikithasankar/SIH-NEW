import { describe, it, expect } from 'vitest';
import { HighKneesTracker } from './highKneesTracker';
import type { NormalizedLandmarkResult } from '../models/trackerTypes';

/**
 * Build a mock landmark array for high knees.
 * MediaPipe returns 33 landmarks. We only need:
 *   11 = left_shoulder, 12 = right_shoulder,
 *   23 = left_hip, 24 = right_hip,
 *   25 = left_knee, 26 = right_knee
 *
 * Y-axis: 0 = top of frame, 1 = bottom (so raising a knee = lower Y value)
 */
function makeLandmarks(overrides: {
  leftShoulderY?: number;
  leftHipY?: number;
  rightHipY?: number;
  leftKneeY?: number;
  rightKneeY?: number;
}): NormalizedLandmarkResult {
  const defaults: Record<number, { x: number; y: number; z: number; visibility: number }> = {
    11: { x: 0.4, y: overrides.leftShoulderY ?? 0.3, z: 0, visibility: 1.0 }, // left shoulder
    12: { x: 0.6, y: 0.3, z: 0, visibility: 1.0 }, // right shoulder
    23: { x: 0.4, y: overrides.leftHipY ?? 0.6, z: 0, visibility: 1.0 },    // left hip
    24: { x: 0.6, y: overrides.rightHipY ?? 0.6, z: 0, visibility: 1.0 },   // right hip
    25: { x: 0.4, y: overrides.leftKneeY ?? 0.75, z: 0, visibility: 1.0 },  // left knee
    26: { x: 0.6, y: overrides.rightKneeY ?? 0.75, z: 0, visibility: 1.0 }, // right knee
  };

  // Create full 33-landmark array with low visibility for unused landmarks
  const landmarks: NormalizedLandmarkResult = [];
  for (let i = 0; i < 33; i++) {
    if (defaults[i]) {
      landmarks.push(defaults[i]);
    } else {
      landmarks.push({ x: 0.5, y: 0.5, z: 0, visibility: 0.1 });
    }
  }
  return landmarks;
}

describe('HighKneesTracker', () => {
  // torsoScale = distance(leftShoulder, leftHip)
  // With defaults: shoulder at (0.4, 0.3), hip at (0.4, 0.6) → distance = 0.3
  // raiseThreshold = 0.3 * 0.15 = 0.045
  // leftUp when leftKnee.y < (leftHip.y - raiseThreshold) = 0.6 - 0.045 = 0.555

  it('starts with zero reps and zero form breaks', () => {
    const tracker = new HighKneesTracker(0.15);
    const neutral = makeLandmarks({});
    const s = tracker.processFrame(neutral);
    expect(s.validReps).toBe(0);
    expect(s.formBreaks).toBe(0);
  });

  it('counts a valid rep when left knee is raised', () => {
    const tracker = new HighKneesTracker(0.15);

    // Start with neutral position
    tracker.processFrame(makeLandmarks({}));

    // Raise left knee (Y must be < 0.555 with defaults)
    const s = tracker.processFrame(makeLandmarks({ leftKneeY: 0.50 }));
    expect(s.validReps).toBe(1);
    expect(s.lastEvent).toBe('rep_completed');
  });

  it('counts alternating legs as valid reps', () => {
    const tracker = new HighKneesTracker(0.15);

    // Neutral
    tracker.processFrame(makeLandmarks({}));

    // Raise left
    tracker.processFrame(makeLandmarks({ leftKneeY: 0.50 }));
    expect(tracker.processFrame(makeLandmarks({ leftKneeY: 0.50 })).validReps).toBe(1);

    // Return left to neutral
    tracker.processFrame(makeLandmarks({}));

    // Raise right
    const s = tracker.processFrame(makeLandmarks({ rightKneeY: 0.50 }));
    expect(s.validReps).toBe(2);
  });

  it('detects form break when same leg raises consecutively', () => {
    const tracker = new HighKneesTracker(0.15);

    // Neutral
    tracker.processFrame(makeLandmarks({}));

    // Raise left — valid
    tracker.processFrame(makeLandmarks({ leftKneeY: 0.50 }));

    // Return left to neutral
    tracker.processFrame(makeLandmarks({}));

    // Raise left AGAIN — form break (should have alternated to right)
    const s = tracker.processFrame(makeLandmarks({ leftKneeY: 0.50 }));
    expect(s.formBreaks).toBe(1);
    expect(s.lastEvent).toBe('form_break');
    expect(s.validReps).toBe(1); // Still 1 from the first raise
  });

  it('uses body-scale-relative threshold, not literal pixel values', () => {
    const tracker = new HighKneesTracker(0.15);

    // Simulate a person far from camera (small torso in normalized space)
    // Shoulder at Y=0.45, hip at Y=0.55 → torsoScale = 0.1
    // raiseThreshold = 0.1 * 0.15 = 0.015
    // leftUp when leftKnee.y < (0.55 - 0.015) = 0.535

    const farNeutral = makeLandmarks({
      leftShoulderY: 0.45,
      leftHipY: 0.55,
      rightHipY: 0.55,
      leftKneeY: 0.60,
      rightKneeY: 0.60,
    });
    tracker.processFrame(farNeutral);

    // Small raise that crosses the relative threshold
    const farRaised = makeLandmarks({
      leftShoulderY: 0.45,
      leftHipY: 0.55,
      rightHipY: 0.55,
      leftKneeY: 0.52, // Below 0.535
      rightKneeY: 0.60,
    });
    const s = tracker.processFrame(farRaised);
    expect(s.validReps).toBe(1);
  });

  it('handles low visibility landmarks gracefully', () => {
    const tracker = new HighKneesTracker(0.15);
    const landmarks = makeLandmarks({});
    // Set a required landmark to low visibility
    landmarks[25] = { x: 0.4, y: 0.50, z: 0, visibility: 0.3 }; // left knee barely visible
    const s = tracker.processFrame(landmarks);
    expect(s.isPositionOk).toBe(false);
  });

  it('resets correctly', () => {
    const tracker = new HighKneesTracker(0.15);
    tracker.processFrame(makeLandmarks({}));
    tracker.processFrame(makeLandmarks({ leftKneeY: 0.50 }));
    expect(tracker.processFrame(makeLandmarks({})).validReps).toBe(1);

    tracker.reset();
    const s = tracker.processFrame(makeLandmarks({}));
    expect(s.validReps).toBe(0);
    expect(s.formBreaks).toBe(0);
  });
});
