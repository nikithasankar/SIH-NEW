// Pose overlay canvas — Phase 4
import { useEffect, useRef } from 'react';
import type { NormalizedLandmarkResult } from '../models/trackerTypes';

/** BlazePose 33-point skeleton connectors (subset relevant to a torso+limbs view). */
const POSE_CONNECTIONS: ReadonlyArray<[number, number]> = [
  // face-ish (kept minimal)
  [11, 12],
  // arms
  [11, 13], [13, 15],
  [12, 14], [14, 16],
  // torso
  [11, 23], [12, 24], [23, 24],
  // legs
  [23, 25], [25, 27],
  [24, 26], [26, 28],
  // feet
  [27, 29], [29, 31], [27, 31],
  [28, 30], [30, 32], [28, 32],
];

const MIN_DRAW_VISIBILITY = 0.4;

interface PoseOverlayCanvasProps {
  landmarks: NormalizedLandmarkResult | null;
  /** Native pixel dimensions of the source video (from getVideoDimensions). */
  width: number;
  height: number;
  /** Match the mirror transform applied to the underlying <video>. */
  mirror?: boolean;
  /** Tints the skeleton red when the user's form/position isn't trackable. */
  isPositionOk?: boolean;
}

export function PoseOverlayCanvas({
  landmarks,
  width,
  height,
  mirror = true,
  isPositionOk = true,
}: PoseOverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!landmarks || landmarks.length === 0) return;

    const strokeColor = isPositionOk
      ? getComputedStyle(document.documentElement).getPropertyValue('--skeleton-color').trim() || '#00FF88'
      : '#FF3B30';

    ctx.lineWidth = Math.max(2, canvas.width / 200);
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineCap = 'round';

    for (const [a, b] of POSE_CONNECTIONS) {
      const pa = landmarks[a];
      const pb = landmarks[b];
      if (!pa || !pb) continue;
      if ((pa.visibility ?? 1) < MIN_DRAW_VISIBILITY || (pb.visibility ?? 1) < MIN_DRAW_VISIBILITY) continue;

      ctx.beginPath();
      ctx.moveTo(pa.x * canvas.width, pa.y * canvas.height);
      ctx.lineTo(pb.x * canvas.width, pb.y * canvas.height);
      ctx.stroke();
    }

    const pointRadius = Math.max(2.5, canvas.width / 160);
    for (const lm of landmarks) {
      if ((lm.visibility ?? 1) < MIN_DRAW_VISIBILITY) continue;
      ctx.beginPath();
      ctx.arc(lm.x * canvas.width, lm.y * canvas.height, pointRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [landmarks, isPositionOk]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
      style={{ transform: mirror ? 'scaleX(-1)' : 'none' }}
    />
  );
}
