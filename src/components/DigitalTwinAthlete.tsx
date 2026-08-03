import React, { useEffect, useRef, useState } from 'react';

interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

interface DigitalTwinProps {
  landmarks: Landmark[] | null;
  isPositionOk?: boolean;
  isActive: boolean;
  exerciseName?: string;
}

interface RecordedFrame {
  timestamp: number;
  landmarks: Landmark[];
  isPositionOk: boolean;
  jointAngles: {
    elbow: number;
    knee: number;
    hip: number;
    shoulder: number;
  };
}

export const DigitalTwinAthlete: React.FC<DigitalTwinProps> = ({
  landmarks,
  isPositionOk = true,
  isActive,
  exerciseName = 'Workout Protocol',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Recording & Replay State for Coaches
  const [recordedFrames, setRecordedFrames] = useState<RecordedFrame[]>([]);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayFrameIndex, setReplayFrameIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState<0.5 | 1 | 2>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const motionTrailRef = useRef<{ x: number; y: number }[]>([]);

  // Calculate angle between three 2D points (A, B, C where B is vertex)
  const calculateAngle = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    c: { x: number; y: number }
  ): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return Math.round(angle);
  };

  // Generate fallback synthetic human posture if camera landmarks aren't provided yet
  const getDisplayLandmarks = (): { points: Landmark[]; angles: { elbow: number; knee: number; hip: number; shoulder: number } } => {
    if (landmarks && landmarks.length >= 25) {
      const p = landmarks;
      // Joint angles
      const elbow = calculateAngle(p[11], p[13], p[15]); // shoulder-elbow-wrist
      const knee = calculateAngle(p[23], p[25], p[27]);  // hip-knee-ankle
      const hip = calculateAngle(p[11], p[23], p[25]);   // shoulder-hip-knee
      const shoulder = calculateAngle(p[13], p[11], p[23]); // elbow-shoulder-hip
      return { points: landmarks, angles: { elbow, knee, hip, shoulder } };
    }

    // Default animated standing/squatting skeleton for preview
    const t = Date.now() / 600;
    const squatDepth = (Math.sin(t) + 1) / 2; // 0 to 1
    const hipY = 0.5 + squatDepth * 0.12;
    const kneeY = 0.68 + squatDepth * 0.05;

    const points: Landmark[] = Array(33).fill({ x: 0.5, y: 0.5 });
    points[11] = { x: 0.42, y: 0.3 }; // left shoulder
    points[12] = { x: 0.58, y: 0.3 }; // right shoulder
    points[13] = { x: 0.35, y: 0.42 + squatDepth * 0.05 }; // left elbow
    points[14] = { x: 0.65, y: 0.42 + squatDepth * 0.05 }; // right elbow
    points[15] = { x: 0.32, y: 0.52 }; // left wrist
    points[16] = { x: 0.68, y: 0.52 }; // right wrist
    points[23] = { x: 0.44, y: hipY }; // left hip
    points[24] = { x: 0.56, y: hipY }; // right hip
    points[25] = { x: 0.42, y: kneeY }; // left knee
    points[26] = { x: 0.58, y: kneeY }; // right knee
    points[27] = { x: 0.43, y: 0.88 }; // left ankle
    points[28] = { x: 0.57, y: 0.88 }; // right ankle
    points[0]  = { x: 0.5,  y: 0.18 }; // head

    const elbow = Math.round(160 - squatDepth * 30);
    const knee = Math.round(170 - squatDepth * 80);
    const hip = Math.round(175 - squatDepth * 65);
    const shoulder = Math.round(45 + squatDepth * 20);

    return { points, angles: { elbow, knee, hip, shoulder } };
  };

  const activeFrameData = isReplaying && recordedFrames.length > 0
    ? { points: recordedFrames[replayFrameIndex].landmarks, angles: recordedFrames[replayFrameIndex].jointAngles }
    : getDisplayLandmarks();

  // Record frames while active
  useEffect(() => {
    if (!isActive || isReplaying) return;

    const data = getDisplayLandmarks();
    const newFrame: RecordedFrame = {
      timestamp: Date.now(),
      landmarks: data.points,
      isPositionOk,
      jointAngles: data.angles,
    };

    setRecordedFrames((prev) => {
      const updated = [...prev, newFrame];
      // Keep up to 300 frames (~10 seconds at 30fps)
      return updated.length > 300 ? updated.slice(updated.length - 300) : updated;
    });

    // Track motion trail for wrist
    const wrist = data.points[16] || data.points[15];
    if (wrist) {
      motionTrailRef.current.push({ x: wrist.x, y: wrist.y });
      if (motionTrailRef.current.length > 40) {
        motionTrailRef.current.shift();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, landmarks, isPositionOk, isReplaying]);

  // Replay playback loop
  useEffect(() => {
    if (!isReplaying || !isPlaying || recordedFrames.length === 0) return;

    const interval = setInterval(() => {
      setReplayFrameIndex((prev) => {
        if (prev >= recordedFrames.length - 1) {
          return 0; // loop replay
        }
        return prev + 1;
      });
    }, 100 / replaySpeed);

    return () => clearInterval(interval);
  }, [isReplaying, isPlaying, replaySpeed, recordedFrames.length]);

  // Draw 3D Stick Figure & Analytics on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Dark grid background for high-tech digital twin look
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

    const { points, angles } = activeFrameData;
    const ok = isReplaying ? recordedFrames[replayFrameIndex]?.isPositionOk ?? true : isPositionOk;
    const jointColor = ok ? '#10B981' : '#EF4444'; // GREEN if posture correct, RED if incorrect
    const boneColor = ok ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)';

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

    // Draw Motion Path Trail (Wrist trajectory line)
    if (motionTrailRef.current.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      motionTrailRef.current.forEach((pt, idx) => {
        const px = pt.x * width;
        const py = pt.y * height;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Bones
    connections.forEach(([i, j]) => {
      const p1 = points[i];
      const p2 = points[j];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    });

    // Draw Head
    const head = points[0];
    if (head) {
      ctx.beginPath();
      ctx.arc(head.x * width, head.y * height, 18, 0, Math.PI * 2);
      ctx.fillStyle = ok ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      ctx.fill();
      ctx.strokeStyle = jointColor;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Key Joint Nodes & Real-Time Angles
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
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fillStyle = jointColor;
        ctx.fill();
        ctx.strokeStyle = '#07070A';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Joint Angle Badge Overlay
        ctx.font = '10px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(px + 10, py - 12, 64, 16);
        ctx.fillStyle = ok ? '#10B981' : '#EF4444';
        ctx.strokeRect(px + 10, py - 12, 64, 16);
        ctx.fillStyle = '#07070A';
        ctx.fillText(name, px + 14, py);
      }
    });

    // Calculate & Draw Balance Center / Center of Mass
    const hipL = points[23];
    const hipR = points[24];
    const shL = points[11];
    const shR = points[12];
    if (hipL && hipR && shL && shR) {
      const comX = ((hipL.x + hipR.x + shL.x + shR.x) / 4) * width;
      const comY = ((hipL.y + hipR.y + shL.y + shR.y) / 4) * height;

      // Glowing Center of Mass Target Crosshair
      ctx.beginPath();
      ctx.arc(comX, comY, 14, 0, Math.PI * 2);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(comX, comY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00E5FF';
      ctx.fill();

      // Label
      ctx.font = '9px monospace';
      ctx.fillStyle = '#00E5FF';
      ctx.fillText('BALANCE CENTER', comX + 18, comY + 3);
    }

  }, [activeFrameData, isPositionOk, isReplaying, replayFrameIndex, recordedFrames]);

  return (
    <div className="w-full glass-card p-5 mt-6 border-2 border-[var(--color-primary)]/30 flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--glass-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
              REAL-TIME DIGITAL TWIN SKELETON
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Biomechanical Motion Twin — {exerciseName}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
            isPositionOk
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            {isPositionOk ? '🟢 Correct Posture' : '🔴 Incorrect Joint Alignment'}
          </span>
          <button
            onClick={() => {
              setIsReplaying(!isReplaying);
              setIsPlaying(!isReplaying);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
              isReplaying
                ? 'bg-amber-500 text-black shadow-sm'
                : 'bg-surface hover:bg-surface-hover text-white border border-[var(--glass-border)]'
            }`}
          >
            {isReplaying ? '📼 Exit Replay Mode' : '🎬 Coach Replay Mode'}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="relative w-full h-[340px] bg-[#050508] rounded-2xl overflow-hidden border border-[var(--glass-border)] flex items-center justify-center">
        <canvas ref={canvasRef} width={640} height={340} className="w-full h-full object-contain" />

        {/* Live Legend Overlay */}
        <div className="absolute top-3 left-3 bg-[#07070A]/80 backdrop-blur-md p-2.5 rounded-xl border border-[var(--glass-border)] text-[10px] font-mono space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Green = Correct Posture</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-300">Red = Incorrect Joint Angle</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">Cyan = Balance Center</span>
          </div>
        </div>

        {/* Live Metrics Badge Overlay */}
        <div className="absolute top-3 right-3 bg-[#07070A]/80 backdrop-blur-md px-3 py-2 rounded-xl border border-[var(--glass-border)] text-right">
          <div className="text-[10px] text-muted font-mono uppercase">Joint Angle Telemetry</div>
          <div className="text-xs font-bold text-primary font-mono mt-0.5">
            Knee: {activeFrameData.angles.knee}° | Hip: {activeFrameData.angles.hip}°
          </div>
        </div>
      </div>

      {/* Coach Frame-by-Frame Motion Replay Controls */}
      <div className="bg-surface p-4 rounded-2xl border border-[var(--glass-border)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider flex items-center gap-2">
            <span>🎥</span> COACH FRAME-BY-FRAME REPLAY CONTROLLER
          </span>
          <span className="text-xs font-mono text-primary">
            Frame {replayFrameIndex + 1} / {Math.max(1, recordedFrames.length)} ({recordedFrames.length > 0 ? (recordedFrames.length / 30).toFixed(1) : 0}s recorded)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsReplaying(true);
                setIsPlaying(!isPlaying);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-primary text-black hover:opacity-90 transition-transform active:scale-95"
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            <button
              onClick={() => {
                setIsReplaying(true);
                setIsPlaying(false);
                setReplayFrameIndex((prev) => Math.max(0, prev - 1));
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-surface hover:bg-surface-hover text-white border border-[var(--glass-border)]"
            >
              ◀️ Step Back
            </button>
            <button
              onClick={() => {
                setIsReplaying(true);
                setIsPlaying(false);
                setReplayFrameIndex((prev) => Math.min(recordedFrames.length - 1, prev + 1));
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-surface hover:bg-surface-hover text-white border border-[var(--glass-border)]"
            >
              Step Fwd ▶️
            </button>
          </div>

          {/* Scrubber Timeline Slider */}
          <input
            type="range"
            min={0}
            max={Math.max(0, recordedFrames.length - 1)}
            value={replayFrameIndex}
            onChange={(e) => {
              setIsReplaying(true);
              setIsPlaying(false);
              setReplayFrameIndex(Number(e.target.value));
            }}
            className="flex-1 w-full accent-[var(--color-primary)] cursor-pointer"
          />

          {/* Speed Selector */}
          <div className="flex items-center gap-1">
            {([0.5, 1, 2] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setReplaySpeed(spd)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                  replaySpeed === spd ? 'bg-primary text-black' : 'bg-surface text-muted border border-[var(--glass-border)]'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
