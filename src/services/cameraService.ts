/**
 * Camera service — manages getUserMedia lifecycle.
 *
 * Provides start/stop control and explicit error states for:
 * - Permission denied
 * - No camera found
 * - Browser not supported
 */

export type CameraError =
  | 'not_supported'
  | 'permission_denied'
  | 'no_device'
  | 'in_use'
  | 'unknown';

export interface CameraConstraints {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
  frameRate?: number;
}

const DEFAULT_CONSTRAINTS: CameraConstraints = {
  width: 640,
  height: 480,
  facingMode: 'user',
  frameRate: 30,
};

/**
 * Request camera access and attach the stream to a <video> element.
 * Returns the MediaStream on success, or throws a typed error string.
 */
export async function startCamera(
  videoElement: HTMLVideoElement,
  constraints: CameraConstraints = {}
): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw 'not_supported' as CameraError;
  }

  const merged = { ...DEFAULT_CONSTRAINTS, ...constraints };

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: merged.width },
        height: { ideal: merged.height },
        facingMode: merged.facingMode,
        frameRate: { ideal: merged.frameRate },
      },
      audio: false,
    });

    videoElement.srcObject = stream;
    await videoElement.play();

    return stream;
  } catch (err: unknown) {
    if (err instanceof DOMException) {
      switch (err.name) {
        case 'NotAllowedError':
          throw 'permission_denied' as CameraError;
        case 'NotFoundError':
          throw 'no_device' as CameraError;
        case 'NotReadableError':
        case 'AbortError':
          throw 'in_use' as CameraError;
        default:
          throw 'unknown' as CameraError;
      }
    }
    throw 'unknown' as CameraError;
  }
}

/**
 * Stop all tracks on a MediaStream and detach from the video element.
 */
export function stopCamera(
  videoElement: HTMLVideoElement | null,
  stream: MediaStream | null
): void {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
  if (videoElement) {
    videoElement.srcObject = null;
  }
}

/**
 * Get the actual video dimensions after the stream has started.
 * These may differ from the requested constraints.
 */
export function getVideoDimensions(videoElement: HTMLVideoElement): {
  width: number;
  height: number;
} {
  return {
    width: videoElement.videoWidth,
    height: videoElement.videoHeight,
  };
}
