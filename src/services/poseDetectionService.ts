/**
 * Pose detection service — Phase 4.
 *
 * Wraps MediaPipe Tasks Vision's PoseLandmarker. Loads the WASM runtime and
 * the (lite) pose model once, lazily, and exposes a small detect API on top
 * of it. This is a plain module (not a hook) so the potentially-expensive
 * model load only ever happens once per page session, even across
 * remounts of the assessment screen.
 */
import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';

// Served from the CDN so no model assets need to be checked into the repo.
// Swap these for self-hosted paths (e.g. under /public) if offline/CSP
// constraints require it.
const WASM_BASE_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_ASSET_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

let landmarkerInstance: PoseLandmarker | null = null;
let loadingPromise: Promise<PoseLandmarker> | null = null;

/**
 * Lazily create (or return the cached) PoseLandmarker configured for
 * VIDEO running mode, tracking a single person.
 */
export async function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (landmarkerInstance) return landmarkerInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
    const landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_ASSET_URL,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    landmarkerInstance = landmarker;
    return landmarker;
  })().catch((err) => {
    // Allow a retry on the next call if loading fails.
    loadingPromise = null;
    throw err;
  });

  return loadingPromise;
}

/**
 * Run pose detection on a single video frame. `timestampMs` should be a
 * monotonically increasing timestamp (e.g. performance.now()) — MediaPipe's
 * VIDEO mode requires strictly increasing timestamps per call.
 */
export function detectForVideo(
  landmarker: PoseLandmarker,
  video: HTMLVideoElement,
  timestampMs: number
): PoseLandmarkerResult {
  return landmarker.detectForVideo(video, timestampMs);
}

/** Release the WASM/GPU resources held by the landmarker, if any. */
export function closePoseLandmarker(): void {
  landmarkerInstance?.close();
  landmarkerInstance = null;
  loadingPromise = null;
}
