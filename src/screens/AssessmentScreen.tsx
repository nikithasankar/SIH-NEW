import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getExerciseById } from '../data/exerciseCatalog';
import { CameraFeed } from '../components/CameraFeed';
import { PoseOverlayCanvas } from '../components/PoseOverlayCanvas';
import { RepCounterDisplay } from '../components/RepCounterDisplay';
import { HoldTimerDisplay } from '../components/HoldTimerDisplay';
import { StatusIndicatorPill } from '../components/StatusIndicatorPill';
import { CheaterFlashOverlay } from '../components/CheaterFlashOverlay';
import { SummaryCard } from '../components/SummaryCard';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { useExerciseTracker } from '../hooks/useExerciseTracker';
import { useSessionContext } from '../context/SessionContext';
import { getVideoDimensions } from '../services/cameraService';
import { calculateAccuracy } from '../logic/accuracyScore';
import { closePoseLandmarker } from '../services/poseDetectionService';
import { useVoiceFeedback } from '../hooks/useVoiceFeedback';
import { getCoachFeedback } from '../logic/coachFeedback';
import type { SessionResult } from '../models/sessionResult';

type AssessmentPhase = 'preview' | 'active' | 'summary';

export function AssessmentScreen() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const exercise = exerciseId ? getExerciseById(exerciseId) : undefined;
  const { saveSession } = useSessionContext();

  const [phase, setPhase] = useState<AssessmentPhase>('preview');
  const [cameraReady, setCameraReady] = useState(false);
  const [videoDims, setVideoDims] = useState({ width: 640, height: 480 });
  const [cheatFlash, setCheatFlash] = useState(false);
  const [coachCue, setCoachCue] = useState<string | null>(null);
  const [savedSession, setSavedSession] = useState<SessionResult | null>(null);
  const [savedSessionId, setSavedSessionId] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const cheatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coachCueTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hadPreviousFormBreakRef = useRef(false);

  const { status, processFrame, reset } = useExerciseTracker(exercise);

  const handlePoseResult = useCallback(
    (landmarks: Parameters<typeof processFrame>[0], worldLandmarks: Parameters<typeof processFrame>[1]) => {
      processFrame(landmarks, worldLandmarks);
    },
    [processFrame]
  );

  const { landmarks, state: poseState } = usePoseDetection({
    videoElement: videoRef.current,
    active: cameraReady && (phase === 'preview' || phase === 'active'),
    onResult: phase === 'active' ? handlePoseResult : undefined,
  });

  const { speak } = useVoiceFeedback();

  // Antigravity AI Coach: Dynamic exercise-specific cues & positive reinforcement
  useEffect(() => {
    if (phase !== 'active' || !exercise) return;

    if (status.lastEvent === 'form_break') {
      const cue = getCoachFeedback(exercise.id, 'form_break');
      speak(cue, { priority: true });
      setCoachCue(cue);
      hadPreviousFormBreakRef.current = true;
      if (coachCueTimeoutRef.current) clearTimeout(coachCueTimeoutRef.current);
      coachCueTimeoutRef.current = setTimeout(() => setCoachCue(null), 2500);
    } else if (status.lastEvent === 'rep_completed') {
      const cue = getCoachFeedback(exercise.id, 'rep_completed', hadPreviousFormBreakRef.current);
      speak(cue);
      setCoachCue(cue);
      hadPreviousFormBreakRef.current = false;
      if (coachCueTimeoutRef.current) clearTimeout(coachCueTimeoutRef.current);
      coachCueTimeoutRef.current = setTimeout(() => setCoachCue(null), 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.lastEvent, status.formBreaks, status.validReps, exercise?.id]);

  // FIX (flaw: resource deallocation) — release the WASM/GPU-backed
  // PoseLandmarker when the assessment screen is fully unmounted (i.e. the
  // user navigates away), not just paused. `usePoseDetection` intentionally
  // keeps the singleton alive across pause/resume within a session; this is
  // the one place that should actually tear it down.
  useEffect(() => {
    return () => {
      closePoseLandmarker();
    };
  }, []);

  const handleCameraReady = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
    setCameraReady(true);
    setVideoDims(getVideoDimensions(video));
  }, []);

  const handleCameraStop = useCallback(() => {
    setCameraReady(false);
  }, []);

  // Briefly flash a "cheat" warning whenever a new form break is registered.
  useEffect(() => {
    if (status.lastEvent === 'form_break') {
      setCheatFlash(true);
      if (cheatTimeoutRef.current) clearTimeout(cheatTimeoutRef.current);
      cheatTimeoutRef.current = setTimeout(() => setCheatFlash(false), 900);
    }
    return () => {
      if (cheatTimeoutRef.current) clearTimeout(cheatTimeoutRef.current);
    };
    // formBreaks is included so repeated form breaks re-trigger the flash
    // even though lastEvent's string value doesn't change between them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.lastEvent, status.formBreaks]);

  const handleStart = useCallback(() => {
    reset();
    startTimeRef.current = performance.now();
    setPhase('active');
  }, [reset]);

  const handleStop = useCallback(async () => {
    if (!exercise) return;

    const durationSeconds = startTimeRef.current
      ? Math.max(1, Math.round((performance.now() - startTimeRef.current) / 1000))
      : 0;

    const validReps = status.validReps;
    const formBreaks = status.formBreaks;
    const accuracy = calculateAccuracy(validReps, formBreaks);

    const session: SessionResult = {
      exerciseId: exercise.id,
      validReps,
      formBreaks,
      accuracy,
      durationSeconds,
      timestamp: new Date().toISOString(),
    };

    setSavedSession(session);
    setPhase('summary');

    try {
      const id = await saveSession(session);
      setSavedSessionId(id);
    } catch (err) {
      console.error('Failed to save session', err);
    }
  }, [exercise, status, saveSession]);

  const handleTryAgain = useCallback(() => {
    reset();
    setSavedSession(null);
    setSavedSessionId(null);
    setPhase('preview');
  }, [reset]);

  if (!exercise) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger text-lg mb-4">Exercise not found</p>
          <Link to="/app/exercises" className="text-primary underline">Back to exercises</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-4 pb-20">
      {/* Top bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-muted hover:text-[var(--color-text-main)] transition-colors text-sm"
        >
          ← Back
        </button>
        <h1 className="text-lg font-bold">{exercise.displayName}</h1>
        <div className="w-12" /> {/* spacer for centering */}
      </div>

      {phase !== 'summary' && (
        <div className="w-full max-w-2xl">
          <CameraFeed
            active={phase === 'preview' || phase === 'active'}
            onReady={handleCameraReady}
            onStop={handleCameraStop}
            mirror={true}
            className="w-full"
          >
            {landmarks && (
              <PoseOverlayCanvas
                landmarks={landmarks}
                width={videoDims.width}
                height={videoDims.height}
                mirror={true}
                isPositionOk={status.isPositionOk}
              />
            )}

            <CheaterFlashOverlay
              visible={cheatFlash}
              message={exercise.mode === 'timeBased' ? 'Hold Steady!' : 'Full Range!'}
            />

            {/* Exercise info overlay when in preview mode */}
            {phase === 'preview' && cameraReady && (
              <div className="absolute inset-0 flex items-end justify-center pb-8 z-10">
                <div className="text-center">
                  <div className="glass-card px-6 py-4 mb-4">
                    <span className="text-4xl block mb-2">{exercise.iconAsset}</span>
                    <p className="text-[var(--color-text-main)] font-medium text-sm">
                      {exercise.mode === 'timeBased' ? 'Hold Position' : 'Count Reps'}
                    </p>
                    <p className="text-muted text-xs mt-1">
                      {exercise.primaryJoint !== 'highKnees'
                        ? `Up: ${exercise.upThresholdDeg}° · Down: ${exercise.downThresholdDeg}°`
                        : 'Alternating leg raises'}
                    </p>
                  </div>
                  <button
                    onClick={handleStart}
                    disabled={poseState !== 'ready'}
                    className="px-8 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95 neon-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                      background: 'var(--color-primary)',
                      color: 'var(--color-background)',
                    }}
                  >
                    {poseState === 'ready' ? 'Start Assessment' : 'Loading Model…'}
                  </button>
                </div>
              </div>
            )}

            {/* Live tracking overlay */}
            {phase === 'active' && (
              <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 pointer-events-none">
                <div className="flex items-start justify-between pointer-events-auto">
                  <div className="glass-card px-4 py-2">
                    {exercise.mode === 'timeBased' ? (
                      <HoldTimerDisplay seconds={status.validReps} />
                    ) : (
                      <RepCounterDisplay count={status.validReps} />
                    )}
                  </div>
                  <StatusIndicatorPill isPositionOk={status.isPositionOk} />
                </div>

                {/* ONFORM AI Coach Live Cue Banner */}
                {coachCue && (
                  <div className="self-center animate-slide-up glass-card px-5 py-2.5 rounded-full border border-[var(--color-primary)] text-center shadow-lg pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-widest font-black text-primary">🎙️ ONFORM AI Coach:</span>
                      <span className="text-sm font-bold text-white">{coachCue}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-end justify-between pointer-events-auto">
                  <div className="glass-card px-3 py-1.5 text-sm">
                    <span className="text-muted">Form breaks: </span>
                    <span className="text-danger font-semibold">{status.formBreaks}</span>
                  </div>
                  <button
                    onClick={handleStop}
                    className="glass-card px-4 py-2 text-danger font-medium text-sm hover:opacity-80 transition-opacity"
                  >
                    Stop
                  </button>
                </div>
              </div>
            )}
          </CameraFeed>
        </div>
      )}

      {/* Summary phase */}
      {phase === 'summary' && savedSession && (
        <div className="w-full max-w-2xl">
          <SummaryCard
            exerciseName={exercise.displayName}
            icon={exercise.iconAsset}
            mode={exercise.mode}
            session={savedSession}
          />
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleTryAgain}
              className="flex-1 glass-card py-3 font-medium hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <button
              onClick={() => (savedSessionId != null ? navigate(`/app/passport/${savedSessionId}`) : navigate('/app/history'))}
              className="flex-1 py-3 rounded-2xl font-semibold neon-glow hover:scale-[1.02] active:scale-[0.98] transition-transform"
              style={{ background: 'var(--color-primary)', color: 'var(--color-background)' }}
            >
              View Passport
            </button>
          </div>
        </div>
      )}

      {/* Status text below camera */}
      {phase !== 'summary' && (
        <div className="mt-4 text-center">
          {phase === 'preview' && !cameraReady && (
            <p className="text-muted text-sm">Starting camera...</p>
          )}
          {phase === 'preview' && cameraReady && poseState !== 'ready' && poseState !== 'error' && (
            <p className="text-muted text-sm">Loading pose detection model...</p>
          )}
          {phase === 'preview' && cameraReady && poseState === 'error' && (
            <p className="text-danger text-sm">
              Couldn't load the pose detection model. Check your connection and try again.
            </p>
          )}
          {phase === 'preview' && cameraReady && poseState === 'ready' && (
            <p className="text-muted text-sm">Position yourself in frame, then press Start</p>
          )}
          {phase === 'active' && (
            <p className={`text-sm font-medium ${status.isPositionOk ? 'text-primary animate-pulse' : 'text-danger'}`}>
              {status.isPositionOk
                ? 'Tracking your form...'
                : 'Move into frame — make sure your full body is visible'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
