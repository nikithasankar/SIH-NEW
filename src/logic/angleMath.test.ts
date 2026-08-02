import { describe, it, expect } from 'vitest';
import { calculateAngle, distance, AngleSmoother } from './angleMath';

describe('calculateAngle', () => {
  it('returns 90° for a perfect right angle', () => {
    const A = { x: 1, y: 0 };
    const B = { x: 0, y: 0 }; // vertex
    const C = { x: 0, y: 1 };
    const angle = calculateAngle(A, B, C);
    expect(angle).toBeCloseTo(90, 1);
  });

  it('returns 180° for a straight line', () => {
    const A = { x: -1, y: 0 };
    const B = { x: 0, y: 0 };
    const C = { x: 1, y: 0 };
    const angle = calculateAngle(A, B, C);
    expect(angle).toBeCloseTo(180, 1);
  });

  it('returns 0° when points A and C are at the same position relative to B', () => {
    const A = { x: 1, y: 0 };
    const B = { x: 0, y: 0 };
    const C = { x: 1, y: 0 };
    const angle = calculateAngle(A, B, C);
    expect(angle).toBeCloseTo(0, 1);
  });

  it('returns 60° for an equilateral triangle vertex', () => {
    const A = { x: 1, y: 0 };
    const B = { x: 0, y: 0 };
    const C = { x: 0.5, y: Math.sqrt(3) / 2 };
    const angle = calculateAngle(A, B, C);
    expect(angle).toBeCloseTo(60, 1);
  });

  it('returns 45° correctly', () => {
    const A = { x: 1, y: 0 };
    const B = { x: 0, y: 0 };
    const C = { x: 1, y: 1 };
    const angle = calculateAngle(A, B, C);
    expect(angle).toBeCloseTo(45, 1);
  });

  it('never returns NaN due to float rounding (clamp test)', () => {
    // When points are extremely close, floating-point errors could push
    // the cosine ratio slightly outside [-1, 1]. The clamp prevents NaN.
    const A = { x: 1e-15, y: 0 };
    const B = { x: 0, y: 0 };
    const C = { x: 1e-15, y: 1e-30 };
    const angle = calculateAngle(A, B, C);
    expect(Number.isNaN(angle)).toBe(false);
  });

  it('handles collinear points in the same direction (0°)', () => {
    const A = { x: 2, y: 0 };
    const B = { x: 0, y: 0 };
    const C = { x: 3, y: 0 };
    const angle = calculateAngle(A, B, C);
    expect(angle).toBeCloseTo(0, 1);
  });

  it('handles normalized coordinate range (0-1)', () => {
    // Simulating MediaPipe normalized coordinates
    const A = { x: 0.3, y: 0.5 };
    const B = { x: 0.5, y: 0.5 };
    const C = { x: 0.5, y: 0.7 };
    const angle = calculateAngle(A, B, C);
    expect(angle).toBeCloseTo(90, 1);
  });
});

describe('distance', () => {
  it('returns 0 for identical points', () => {
    expect(distance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
  });

  it('returns correct distance for unit right triangle', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5, 5);
  });
});

describe('AngleSmoother', () => {
  it('returns the single value when only one value pushed', () => {
    const smoother = new AngleSmoother(5);
    expect(smoother.push(90)).toBe(90);
  });

  it('returns the average of all values when buffer is full', () => {
    const smoother = new AngleSmoother(5);
    smoother.push(80);
    smoother.push(90);
    smoother.push(100);
    smoother.push(90);
    const result = smoother.push(90);
    // (80 + 90 + 100 + 90 + 90) / 5 = 90
    expect(result).toBeCloseTo(90, 5);
  });

  it('drops oldest values when buffer exceeds window size', () => {
    const smoother = new AngleSmoother(3);
    smoother.push(100);
    smoother.push(100);
    smoother.push(100);
    // Buffer is [100, 100, 100], avg = 100
    const result = smoother.push(70);
    // Buffer is now [100, 100, 70], avg = 90
    expect(result).toBeCloseTo(90, 5);
  });

  it('resets correctly', () => {
    const smoother = new AngleSmoother(5);
    smoother.push(50);
    smoother.push(60);
    smoother.reset();
    expect(smoother.push(100)).toBe(100);
  });
});
