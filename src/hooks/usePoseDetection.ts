/**
 * Pose detection hook — Phase 4.
 *
 * Drives a requestAnimationFrame loop that pulls frames off a <video>
 * element, runs them through the MediaPipe PoseLandmarker, and reports
 * back the latest landmarks. Designed to be paused/resumed by toggling
 * `active` (e.g. off screen, or once the assessment ends) without tearing
 * down the underlying model.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import type { PoseLandmarker } from '@mediapipe/tasks-vision';
import type { NormalizedLandmarkResult } from '../models/trackerTypes';
import { getPoseLandmarker } from '../services/poseDetectionService';

export type PoseDetectionState = 'idle' | 'loading' | 'ready' | 'error';

interface UsePoseDetectionOptions {
  /** The <video> element currently playing the camera feed, or null. */
  videoElement: HTMLVideoElement | null;
  /** Whether the detection loop should be running. */
  active: boolean;
  /**
   * Fired with the latest landmarks every time a new frame is processed.
   * FIX (flaw #2.2): also receives `worldLandmarks` — metric 3D
   * coordinates — so callers can compute distortion-free 3D joint angles
   * instead of relying solely on 2D screen-space projection.
   */
  onResult?: (landmarks: NormalizedLandmarkResult, worldLandmarks: NormalizedLandmarkResult | null) => void;
}

interface UsePoseDetectionResult {
  state: PoseDetectionState;
  /** Landmarks from the most recently processed frame (or null). */
  landmarks: NormalizedLandmarkResult | null;
  /** Metric 3D world-space landmarks from the most recently processed frame. */
  worldLandmarks: NormalizedLandmarkResult | null;
}

export function usePoseDetection({
  videoElement,
  active,
  onResult,
}: UsePoseDetectionOptions): UsePoseDetectionResult {
  const [state, setState] = useState<PoseDetectionState>('idle');
  const [landmarks, setLandmarks] = useState<NormalizedLandmarkResult | null>(null);
  const [worldLandmarks, setWorldLandmarks] = useState<NormalizedLandmarkResult | null>(null);

  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  // Keep the latest callback in a ref so the effect below doesn't need to
  // restart the detection loop every time the caller passes a new inline fn.
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!active || !videoElement) {
      stopLoop();
      setLandmarks(null);
      setWorldLandmarks(null);
      return;
    }

    let cancelled = false;
    setState('loading');

    getPoseLandmarker()
      .then((landmarker: PoseLandmarker) => {
        if (cancelled) return;
        setState('ready');

        const loop = () => {
          if (cancelled) return;

          // Only run inference once per new decoded video frame.
          if (
            videoElement.readyState >= 2 &&
            videoElement.currentTime !== lastVideoTimeRef.current
          ) {
            lastVideoTimeRef.current = videoElement.currentTime;
            const result = landmarker.detectForVideo(videoElement, performance.now());
            const points = result.landmarks?.[0] ?? null;
            const worldPoints = result.worldLandmarks?.[0] ?? null;
            setLandmarks(points);
            setWorldLandmarks(worldPoints);
            if (points) onResultRef.current?.(points, worldPoints);
          }

          rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
      })
      .catch((err) => {
        console.error('Failed to initialize pose detection', err);
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
      stopLoop();
      lastVideoTimeRef.current = -1;
    };
  }, [active, videoElement, stopLoop]);

  return { state, landmarks, worldLandmarks };
}
