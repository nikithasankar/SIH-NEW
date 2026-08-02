import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  startCamera,
  stopCamera,
  type CameraError,
  type CameraConstraints,
} from '../services/cameraService';

export type CameraState =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'error';

interface CameraFeedProps {
  /** Whether the camera should be active */
  active?: boolean;
  /** Camera constraints override */
  constraints?: CameraConstraints;
  /** Callback when camera starts successfully, provides video element */
  onReady?: (video: HTMLVideoElement) => void;
  /** Callback when camera stops */
  onStop?: () => void;
  /** Mirror the video horizontally (default: true for selfie cam) */
  mirror?: boolean;
  /** Additional CSS class for the container */
  className?: string;
  /** Children rendered on top of the video (e.g. canvas overlay) */
  children?: ReactNode;
}

const ERROR_MESSAGES: Record<CameraError, { icon: string; title: string; body: string }> = {
  not_supported: {
    icon: '🚫',
    title: 'Browser Not Supported',
    body: 'Your browser does not support camera access. Please use Chrome, Firefox, or Safari.',
  },
  permission_denied: {
    icon: '🔒',
    title: 'Camera Access Denied',
    body: 'Please allow camera access in your browser settings and refresh the page.',
  },
  no_device: {
    icon: '📷',
    title: 'No Camera Found',
    body: 'No camera was detected. Please connect a camera and try again.',
  },
  in_use: {
    icon: '⚠️',
    title: 'Camera In Use',
    body: 'Your camera is being used by another application. Please close it and try again.',
  },
  unknown: {
    icon: '❌',
    title: 'Camera Error',
    body: 'An unexpected error occurred while accessing the camera.',
  },
};

export function CameraFeed({
  active = true,
  constraints,
  onReady,
  onStop,
  mirror = true,
  className = '',
  children,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [error, setError] = useState<CameraError | null>(null);
  // FIX (CV pipeline flaw — canvas & video aspect ratio desync): webcams
  // typically stream 16:9, but the container used to be hardcoded to a
  // 4:3 box with `object-cover`, silently cropping the video while the
  // pose overlay canvas (drawn full-bleed over the same box) still used
  // normalized 0-1 landmark coordinates computed against the *uncropped*
  // frame. The skeleton would visibly drift off the user's real body.
  // Now we read the stream's true intrinsic size once it's known and size
  // the container to match exactly, so nothing is ever cropped.
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 3);

  const start = useCallback(async () => {
    if (!videoRef.current) return;
    setCameraState('requesting');
    setError(null);

    try {
      const stream = await startCamera(videoRef.current, constraints);
      streamRef.current = stream;
      const video = videoRef.current;
      // FIX: derive the container's aspect ratio from the real stream
      // dimensions (e.g. true 16:9) instead of assuming 4:3.
      if (video.videoWidth && video.videoHeight) {
        setAspectRatio(video.videoWidth / video.videoHeight);
      } else {
        video.addEventListener(
          'loadedmetadata',
          () => {
            if (video.videoWidth && video.videoHeight) {
              setAspectRatio(video.videoWidth / video.videoHeight);
            }
          },
          { once: true }
        );
      }
      setCameraState('active');
      onReady?.(videoRef.current);
    } catch (err) {
      const cameraError = err as CameraError;
      setError(cameraError);
      setCameraState('error');
    }
  }, [constraints, onReady]);

  const stop = useCallback(() => {
    stopCamera(videoRef.current ?? null, streamRef.current);
    streamRef.current = null;
    setCameraState('idle');
    onStop?.();
  }, [onStop]);

  // Start/stop camera based on `active` prop
  useEffect(() => {
    if (active) {
      start();
    } else {
      stop();
    }
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const retry = useCallback(() => {
    stop();
    start();
  }, [stop, start]);

  return (
    <div
      className={`relative overflow-hidden bg-black rounded-2xl ${className}`}
      style={{ aspectRatio: String(aspectRatio) }}
    >
      {/* Video element — always present but may be hidden.
          FIX: object-contain (not object-cover) + container aspect ratio
          matched to the real stream means the full, uncropped frame is
          always what's visible — exactly what the 0-1 normalized pose
          landmarks were computed against. */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 w-full h-full object-contain"
        style={{
          transform: mirror ? 'scaleX(-1)' : 'none',
          display: cameraState === 'active' ? 'block' : 'none',
        }}
      />

      {/* Children overlay (canvas, etc.) — only when active */}
      {cameraState === 'active' && children}

      {/* Idle state */}
      {cameraState === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl block mb-3">📷</span>
            <p className="text-muted text-sm">Camera inactive</p>
          </div>
        </div>
      )}

      {/* Requesting permission */}
      {cameraState === 'requesting' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-t-[var(--color-primary)] border-[var(--color-surface)] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--color-text-main)] font-medium mb-1">Requesting Camera Access</p>
            <p className="text-muted text-sm">Please allow camera permissions when prompted</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {cameraState === 'error' && error && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="text-center max-w-xs">
            <span className="text-5xl block mb-3">{ERROR_MESSAGES[error].icon}</span>
            <h3 className="text-[var(--color-text-main)] font-semibold text-lg mb-2">
              {ERROR_MESSAGES[error].title}
            </h3>
            <p className="text-muted text-sm mb-5">{ERROR_MESSAGES[error].body}</p>
            <button
              onClick={retry}
              className="px-6 py-2.5 rounded-full font-medium text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-background)',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
