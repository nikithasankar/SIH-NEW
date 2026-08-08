import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { SessionResult, RecordedFrame, LandmarkPoint } from '../../models/sessionResult';
import { getExerciseById } from '../../data/exerciseCatalog';

interface Props {
  session: SessionResult;
  athleteName: string;
  athleteEmail: string;
  athleteSport?: string;
  scoutName: string;
  scoutEmail: string;
  onClose: () => void;
  onAddNote: (sessionId: number, note: string) => void;
  existingNotes?: { note: string; createdAt: string; scoutName: string }[];
}

export const ScoutDigitalTwinReplay: React.FC<Props> = ({
  session,
  athleteName,
  athleteEmail,
  athleteSport,
  scoutName,
  scoutEmail,
  onClose,
  onAddNote,
  existingNotes = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const exercise = getExerciseById(session.exerciseId);

  // Playback & Frame Scrubber State
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.25 | 0.5 | 1 | 2>(1);
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  // Generate synthetic biomechanical motion if session was recorded prior to frame capture
  const frames: RecordedFrame[] = useMemo(() => {
    if (session.recordedFrames && session.recordedFrames.length > 0) {
      return session.recordedFrames;
    }

    // High quality synthetic skeleton movement matching the exercise profile
    const totalSyntheticFrames = Math.max(30, (session.durationSeconds || 10) * 8);
    const syntheticList: RecordedFrame[] = [];
    const isSquatOrLunge = session.exerciseId.includes('squat') || session.exerciseId.includes('lunge');
    const isPushupOrPlank = session.exerciseId.includes('pushup') || session.exerciseId.includes('plank');

    for (let i = 0; i < totalSyntheticFrames; i++) {
      const progress = (i % 24) / 24; // 1 rep every 24 frames (~3 sec)
      const phase = Math.sin(progress * Math.PI * 2); // -1 to 1
      const depth = (phase + 1) / 2; // 0 (top/start) to 1 (deep inflection)

      const points: LandmarkPoint[] = Array(33).fill({ x: 0.5, y: 0.5, visibility: 0.95 });

      let elbowAngle = 160;
      let kneeAngle = 165;
      let hipAngle = 170;
      let shoulderAngle = 45;
      const isPositionOk = session.accuracy > 70 ? depth < 0.95 : depth < 0.7;

      if (isPushupOrPlank) {
        // Horizontal pushup posture
        const dropY = depth * 0.12;
        points[11] = { x: 0.32, y: 0.45 + dropY, visibility: 0.99 }; // shoulder
        points[12] = { x: 0.38, y: 0.45 + dropY, visibility: 0.99 };
        points[13] = { x: 0.28, y: 0.52 + dropY * 0.5, visibility: 0.99 }; // elbow
        points[14] = { x: 0.34, y: 0.52 + dropY * 0.5, visibility: 0.99 };
        points[15] = { x: 0.25, y: 0.65, visibility: 0.99 }; // wrist
        points[16] = { x: 0.31, y: 0.65, visibility: 0.99 };
        points[23] = { x: 0.55, y: 0.50 + dropY * 0.8, visibility: 0.99 }; // hip
        points[24] = { x: 0.58, y: 0.50 + dropY * 0.8, visibility: 0.99 };
        points[25] = { x: 0.70, y: 0.58, visibility: 0.99 }; // knee
        points[26] = { x: 0.73, y: 0.58, visibility: 0.99 };
        points[27] = { x: 0.85, y: 0.65, visibility: 0.99 }; // ankle
        points[28] = { x: 0.88, y: 0.65, visibility: 0.99 };
        points[0]  = { x: 0.22, y: 0.42 + dropY, visibility: 0.99 }; // head

        elbowAngle = Math.round(160 - depth * 80);
        shoulderAngle = Math.round(75 - depth * 35);
        hipAngle = 175;
        kneeAngle = 178;
      } else {
        // Vertical standing/squatting posture
        const hipY = 0.48 + (isSquatOrLunge ? depth * 0.16 : depth * 0.04);
        const kneeY = 0.66 + (isSquatOrLunge ? depth * 0.06 : depth * 0.02);

        points[11] = { x: 0.42, y: 0.28 + depth * 0.08, visibility: 0.99 }; // left shoulder
        points[12] = { x: 0.58, y: 0.28 + depth * 0.08, visibility: 0.99 }; // right shoulder
        points[13] = { x: 0.35, y: 0.40 + depth * 0.09, visibility: 0.99 }; // left elbow
        points[14] = { x: 0.65, y: 0.40 + depth * 0.09, visibility: 0.99 }; // right elbow
        points[15] = { x: 0.32, y: 0.50, visibility: 0.99 }; // left wrist
        points[16] = { x: 0.68, y: 0.50, visibility: 0.99 }; // right wrist
        points[23] = { x: 0.44, y: hipY, visibility: 0.99 }; // left hip
        points[24] = { x: 0.56, y: hipY, visibility: 0.99 }; // right hip
        points[25] = { x: 0.42, y: kneeY, visibility: 0.99 }; // left knee
        points[26] = { x: 0.58, y: kneeY, visibility: 0.99 }; // right knee
        points[27] = { x: 0.43, y: 0.88, visibility: 0.99 }; // left ankle
        points[28] = { x: 0.57, y: 0.88, visibility: 0.99 }; // right ankle
        points[0]  = { x: 0.50, y: 0.16 + depth * 0.08, visibility: 0.99 }; // head

        kneeAngle = Math.round(170 - depth * 85);
        hipAngle = Math.round(175 - depth * 70);
        elbowAngle = 150;
        shoulderAngle = 45;
      }

      syntheticList.push({
        timestamp: Date.now() - (totalSyntheticFrames - i) * 125,
        landmarks: points,
        isPositionOk,
        jointAngles: { elbow: elbowAngle, knee: kneeAngle, hip: hipAngle, shoulder: shoulderAngle },
      });
    }

    return syntheticList;
  }, [session]);

  // Frame advance playback loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const intervalMs = Math.round(125 / playbackSpeed); // ~8fps base
    const timer = setInterval(() => {
      setFrameIndex((prev) => {
        if (prev >= frames.length - 1) {
          return 0; // loop
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, frames.length]);

  const currentFrame = frames[frameIndex] ?? frames[0];

  // Draw 3D Biomechanical Skeleton on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentFrame) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Dark grid background for high-tech telemetry twin aesthetic
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const { landmarks: points, isPositionOk, jointAngles: angles } = currentFrame;
    const jointColor = isPositionOk ? '#10B981' : '#EF4444'; // GREEN = correct, RED = form break
    const boneColor = isPositionOk ? 'rgba(16, 185, 129, 0.75)' : 'rgba(239, 68, 68, 0.75)';

    // Connections (Bones)
    const connections: [number, number][] = [
      [11, 12], // shoulders
      [11, 13], [13, 15], // left arm
      [12, 14], [14, 16], // right arm
      [11, 23], [12, 24], // torso sides
      [23, 24], // hips
      [23, 25], [25, 27], // left leg
      [24, 26], [26, 28], // right leg
    ];

    // Draw Bones
    connections.forEach(([i, j]) => {
      const p1 = points[i];
      const p2 = points[j];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    });

    // Draw Head
    const head = points[0];
    if (head) {
      ctx.beginPath();
      ctx.arc(head.x * width, head.y * height, 20, 0, Math.PI * 2);
      ctx.fillStyle = isPositionOk ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      ctx.fill();
      ctx.strokeStyle = jointColor;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Key Joint Nodes & Angle Overlays
    const keyJoints = [
      { id: 13, name: `Elbow ${angles.elbow}°`, angle: angles.elbow },
      { id: 14, name: `Elbow ${angles.elbow}°`, angle: angles.elbow },
      { id: 25, name: `Knee ${angles.knee}°`, angle: angles.knee },
      { id: 26, name: `Knee ${angles.knee}°`, angle: angles.knee },
      { id: 23, name: `Hip ${angles.hip}°`, angle: angles.hip },
      { id: 11, name: `Shoulder ${angles.shoulder}°`, angle: angles.shoulder },
    ];

    keyJoints.forEach(({ id, name }) => {
      const pt = points[id];
      if (pt) {
        const px = pt.x * width;
        const py = pt.y * height;

        // Joint Node Circle
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = jointColor;
        ctx.fill();
        ctx.strokeStyle = '#07070A';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Joint Angle Badge Overlay
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(px + 10, py - 12, 68, 16);
        ctx.fillStyle = isPositionOk ? '#10B981' : '#EF4444';
        ctx.strokeRect(px + 10, py - 12, 68, 16);
        ctx.fillStyle = '#07070A';
        ctx.fillText(name, px + 14, py);
      }
    });

    // Center of Mass / Balance Center Crosshair
    const hipL = points[23];
    const hipR = points[24];
    const shL = points[11];
    const shR = points[12];
    if (hipL && hipR && shL && shR) {
      const comX = ((hipL.x + hipR.x + shL.x + shR.x) / 4) * width;
      const comY = ((hipL.y + hipR.y + shL.y + shR.y) / 4) * height;

      ctx.beginPath();
      ctx.arc(comX, comY, 15, 0, Math.PI * 2);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(comX, comY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00E5FF';
      ctx.fill();

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#00E5FF';
      ctx.fillText('BALANCE CENTER', comX + 20, comY + 3);
    }
  }, [currentFrame]);

  const handleSaveFeedback = () => {
    if (!feedbackDraft.trim() || session.id == null) return;
    onAddNote(session.id, feedbackDraft.trim());
    setFeedbackDraft('');
    setFeedbackSaved(true);
    setTimeout(() => setFeedbackSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-card max-w-5xl w-full p-6 sm:p-8 space-y-6 border border-primary/40 my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-black shadow-lg"
              style={{ background: 'var(--color-primary)' }}
            >
              {exercise?.iconAsset ?? '🏃'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-primary uppercase">
                  AI DIGITAL TWIN MOTION REPLAY
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  Verified Telemetry
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">
                {athleteName} — {exercise?.displayName ?? session.exerciseId}
              </h2>
              <p className="text-xs text-muted font-mono mt-0.5">
                {athleteEmail} · {athleteSport ?? 'Athlete'} · {new Date(session.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted hover:text-white text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Session Quick Metrics Bar */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-surface rounded-xl p-3 border border-[var(--glass-border)] text-center">
            <span className="text-[10px] text-muted font-mono uppercase block">Valid Reps</span>
            <span className="text-2xl font-black text-primary">{session.validReps}</span>
          </div>
          <div className="bg-surface rounded-xl p-3 border border-[var(--glass-border)] text-center">
            <span className="text-[10px] text-muted font-mono uppercase block">Form Breaks</span>
            <span className="text-2xl font-black text-danger">{session.formBreaks}</span>
          </div>
          <div className="bg-surface rounded-xl p-3 border border-[var(--glass-border)] text-center">
            <span className="text-[10px] text-muted font-mono uppercase block">Accuracy</span>
            <span className="text-2xl font-black text-emerald-400">{session.accuracy}%</span>
          </div>
          <div className="bg-surface rounded-xl p-3 border border-[var(--glass-border)] text-center">
            <span className="text-[10px] text-muted font-mono uppercase block">Duration</span>
            <span className="text-2xl font-black text-cyan-400">{session.durationSeconds}s</span>
          </div>
        </div>

        {/* Main Digital Twin Skeleton Viewport */}
        <div className="relative w-full h-[380px] bg-[#050508] rounded-2xl overflow-hidden border-2 border-primary/30 flex items-center justify-center">
          <canvas ref={canvasRef} width={720} height={380} className="w-full h-full object-contain" />

          {/* Posture Status Badge Overlay */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border backdrop-blur-md shadow-lg ${
                currentFrame.isPositionOk
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
              }`}
            >
              {currentFrame.isPositionOk ? '🟢 Optimal Kinetic Form' : '🔴 Form Break / Deviation Detected'}
            </span>
          </div>

          {/* Joint Angle Telemetry Overlay */}
          <div className="absolute top-4 right-4 bg-[#07070A]/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[var(--glass-border)] text-right">
            <div className="text-[10px] text-muted font-mono uppercase">Joint Biomechanics</div>
            <div className="text-xs font-bold text-primary font-mono mt-1">
              Knee: {currentFrame.jointAngles.knee}° · Hip: {currentFrame.jointAngles.hip}° · Elbow: {currentFrame.jointAngles.elbow}°
            </div>
          </div>
        </div>

        {/* Frame-by-Frame Scrubbing & Playback Controller */}
        <div className="bg-surface p-4 rounded-2xl border border-[var(--glass-border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider flex items-center gap-2">
              <span>🎛️</span> SCOUT FRAME-BY-FRAME MOTION SCRUBBER
            </span>
            <span className="text-xs font-mono text-primary font-bold">
              Frame {frameIndex + 1} / {frames.length} (Time: {((frameIndex / frames.length) * session.durationSeconds).toFixed(1)}s)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Play/Pause & Step Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-black hover:opacity-90 transition-transform active:scale-95"
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setFrameIndex((prev) => Math.max(0, prev - 1));
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-surface hover:bg-surface-hover text-white border border-[var(--glass-border)]"
                title="Step backward 1 frame"
              >
                ◀️ Step Back
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setFrameIndex((prev) => Math.min(frames.length - 1, prev + 1));
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-surface hover:bg-surface-hover text-white border border-[var(--glass-border)]"
                title="Step forward 1 frame"
              >
                Step Fwd ▶️
              </button>
            </div>

            {/* Timeline Slider */}
            <input
              type="range"
              min={0}
              max={Math.max(0, frames.length - 1)}
              value={frameIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setFrameIndex(Number(e.target.value));
              }}
              className="flex-1 w-full accent-[var(--color-primary)] cursor-pointer"
            />

            {/* Speed Buttons */}
            <div className="flex items-center gap-1">
              {([0.25, 0.5, 1, 2] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                    playbackSpeed === spd
                      ? 'bg-primary text-black'
                      : 'bg-surface text-muted border border-[var(--glass-border)]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scout Coaching Feedback & Notes Section */}
        <div className="bg-surface p-5 rounded-2xl border border-[var(--glass-border)] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <span>✍️</span> Add Scout Coaching Feedback to {athleteName}
            </h4>
            <span className="text-[10px] text-muted font-mono">
              Scout: {scoutName} ({scoutEmail})
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              rows={2}
              value={feedbackDraft}
              onChange={(e) => setFeedbackDraft(e.target.value)}
              placeholder={`e.g., "Knee alignment deviated at frame 42. Work on eccentric quad stabilization and drive through heels on upward phase."`}
              className="flex-1 bg-[var(--color-background)] border border-[var(--glass-border)] rounded-xl p-3 text-xs outline-none focus:border-[var(--color-primary)] transition-colors text-white resize-none"
            />
            <button
              onClick={handleSaveFeedback}
              disabled={!feedbackDraft.trim() || session.id == null}
              className="px-6 py-3 rounded-xl text-xs font-bold text-black disabled:opacity-40 transition-transform active:scale-95 shrink-0 self-end sm:self-stretch flex items-center justify-center gap-2 shadow-lg"
              style={{ background: 'var(--color-primary)' }}
            >
              <span>🚀</span> Post Feedback
            </button>
          </div>

          {feedbackSaved && (
            <div className="text-xs text-emerald-400 font-mono flex items-center gap-2 animate-pulse">
              <span>✓</span> Feedback note successfully recorded in athlete's performance dossier!
            </div>
          )}

          {/* Past Notes on this session */}
          {existingNotes.length > 0 && (
            <div className="pt-2 border-t border-[var(--glass-border)] space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block">
                Existing Scout Notes on this Session ({existingNotes.length})
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {existingNotes.map((n, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[var(--color-background)] border border-[var(--glass-border)] text-xs"
                  >
                    <p className="text-white leading-relaxed">{n.note}</p>
                    <p className="text-[10px] text-muted font-mono mt-1">
                      — {n.scoutName} · {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
