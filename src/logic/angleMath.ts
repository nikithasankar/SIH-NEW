import type { Point } from '../models/trackerTypes';

/**
 * Calculate the angle (in degrees) formed by three points A-B-C,
 * where B is the vertex.
 *
 * The clamp to [-1, 1] before arccos is mandatory — floating-point
 * rounding can push the ratio slightly out of that domain and produce NaN.
 */
export function calculateAngle(A: Point, B: Point, C: Point): number {
  const BA = { x: A.x - B.x, y: A.y - B.y };
  const BC = { x: C.x - B.x, y: C.y - B.y };
  const dot = BA.x * BC.x + BA.y * BC.y;
  const magBA = Math.sqrt(BA.x ** 2 + BA.y ** 2);
  const magBC = Math.sqrt(BC.x ** 2 + BC.y ** 2);
  const cos = Math.max(-1, Math.min(1, dot / (magBA * magBC))); // clamp
  return Math.acos(cos) * (180 / Math.PI);
}

/**
 * Euclidean distance between two points (works in normalized or pixel space).
 */
export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * FIX (flaw #2.2 — 2D projected angle vs. 3D body-space distortion):
 *
 * Same A-B-C vertex-angle calculation as `calculateAngle`, but performed in
 * metric 3D space using MediaPipe's `worldLandmarks` (x, y, z in meters,
 * hip-centered) instead of normalized 2D screen coordinates. This removes
 * perspective foreshortening error that occurs when a user is angled
 * 30-45° relative to the camera — a true 90° joint flexion no longer reads
 * as 130-150°, because depth (z) is taken into account.
 */
export function calculateAngle3D(A: Point3D, B: Point3D, C: Point3D): number {
  const BA = { x: A.x - B.x, y: A.y - B.y, z: A.z - B.z };
  const BC = { x: C.x - B.x, y: C.y - B.y, z: C.z - B.z };
  const dot = BA.x * BC.x + BA.y * BC.y + BA.z * BC.z;
  const magBA = Math.sqrt(BA.x ** 2 + BA.y ** 2 + BA.z ** 2);
  const magBC = Math.sqrt(BC.x ** 2 + BC.y ** 2 + BC.z ** 2);
  if (magBA === 0 || magBC === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.acos(cos) * (180 / Math.PI);
}

/**
 * 5-frame moving-average smoother for angle values.
 * Feed raw angles one at a time; get back the smoothed value.
 */
export class AngleSmoother {
  private buffer: number[] = [];
  private readonly windowSize: number;

  constructor(windowSize: number = 5) {
    this.windowSize = windowSize;
  }

  push(rawAngle: number): number {
    this.buffer.push(rawAngle);
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }
    const sum = this.buffer.reduce((a, b) => a + b, 0);
    return sum / this.buffer.length;
  }

  reset(): void {
    this.buffer = [];
  }
}
