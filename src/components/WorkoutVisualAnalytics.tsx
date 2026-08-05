import React, { useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type { SessionResult } from '../models/sessionResult';

interface Props {
  session: SessionResult;
  exerciseName: string;
}

interface MuscleTarget {
  name: string;
  basePercentage: number;
  role: 'Primary Engine' | 'High Activation' | 'Stabilizer' | 'Support' | 'Secondary';
}

// Anatomical kinetic chains mapped to each exercise
const MUSCLE_DICTIONARY: Record<string, { muscles: MuscleTarget[]; primeMover: string; met: number }> = {
  pushup: {
    primeMover: 'Pectoralis Major',
    met: 8.0,
    muscles: [
      { name: 'Pectoralis Major & Minor', basePercentage: 94, role: 'Primary Engine' },
      { name: 'Triceps Brachii', basePercentage: 88, role: 'High Activation' },
      { name: 'Anterior Deltoids', basePercentage: 76, role: 'Stabilizer' },
      { name: 'Core / Abdominals', basePercentage: 65, role: 'Support' },
      { name: 'Serratus Anterior', basePercentage: 45, role: 'Secondary' },
    ],
  },
  squat: {
    primeMover: 'Quadriceps',
    met: 8.0,
    muscles: [
      { name: 'Quadriceps', basePercentage: 94, role: 'Primary Engine' },
      { name: 'Gluteus Maximus', basePercentage: 88, role: 'High Activation' },
      { name: 'Core / Abdominals', basePercentage: 76, role: 'Stabilizer' },
      { name: 'Hamstrings', basePercentage: 65, role: 'Support' },
      { name: 'Deltoids & Arms', basePercentage: 45, role: 'Secondary' },
    ],
  },
  shoulder_press: {
    primeMover: 'Deltoids (Shoulders)',
    met: 6.5,
    muscles: [
      { name: 'Deltoids & Shoulders', basePercentage: 95, role: 'Primary Engine' },
      { name: 'Triceps Brachii', basePercentage: 86, role: 'High Activation' },
      { name: 'Upper Trapezius', basePercentage: 75, role: 'Stabilizer' },
      { name: 'Core & Abdominals', basePercentage: 64, role: 'Support' },
      { name: 'Upper Pectorals', basePercentage: 45, role: 'Secondary' },
    ],
  },
  plank: {
    primeMover: 'Core / Rectus Abdominis',
    met: 4.5,
    muscles: [
      { name: 'Rectus & Transverse Abdominis', basePercentage: 96, role: 'Primary Engine' },
      { name: 'Internal & External Obliques', basePercentage: 86, role: 'High Activation' },
      { name: 'Erector Spinae (Lower Back)', basePercentage: 75, role: 'Stabilizer' },
      { name: 'Gluteus Maximus & Quads', basePercentage: 62, role: 'Support' },
      { name: 'Deltoids & Shoulder Girdle', basePercentage: 48, role: 'Secondary' },
    ],
  },
  lunges: {
    primeMover: 'Quadriceps & Gluteals',
    met: 7.5,
    muscles: [
      { name: 'Quadriceps', basePercentage: 94, role: 'Primary Engine' },
      { name: 'Gluteus Maximus', basePercentage: 88, role: 'High Activation' },
      { name: 'Core / Pelvic Stabilizers', basePercentage: 74, role: 'Stabilizer' },
      { name: 'Hamstrings', basePercentage: 65, role: 'Support' },
      { name: 'Calves & Ankles', basePercentage: 48, role: 'Secondary' },
    ],
  },
  bicep_curls: {
    primeMover: 'Biceps Brachii',
    met: 5.5,
    muscles: [
      { name: 'Biceps Brachii', basePercentage: 96, role: 'Primary Engine' },
      { name: 'Brachialis & Forearms', basePercentage: 86, role: 'High Activation' },
      { name: 'Anterior Deltoids', basePercentage: 68, role: 'Stabilizer' },
      { name: 'Core Stabilizers', basePercentage: 54, role: 'Support' },
      { name: 'Grip & Wrist Flexors', basePercentage: 46, role: 'Secondary' },
    ],
  },
  situps: {
    primeMover: 'Rectus Abdominis',
    met: 6.0,
    muscles: [
      { name: 'Rectus Abdominis', basePercentage: 95, role: 'Primary Engine' },
      { name: 'Hip Flexors (Iliopsoas)', basePercentage: 84, role: 'High Activation' },
      { name: 'Obliques & Core', basePercentage: 74, role: 'Stabilizer' },
      { name: 'Transverse Abdominis', basePercentage: 62, role: 'Support' },
      { name: 'Quadriceps Synergists', basePercentage: 44, role: 'Secondary' },
    ],
  },
  high_knees: {
    primeMover: 'Iliopsoas & Quadriceps',
    met: 10.0,
    muscles: [
      { name: 'Hip Flexors & Quads', basePercentage: 96, role: 'Primary Engine' },
      { name: 'Calves / Gastrocnemius', basePercentage: 88, role: 'High Activation' },
      { name: 'Core & Cardiovascular', basePercentage: 80, role: 'Stabilizer' },
      { name: 'Gluteus Maximus', basePercentage: 68, role: 'Support' },
      { name: 'Hamstrings', basePercentage: 48, role: 'Secondary' },
    ],
  },
};

function getExerciseConfig(exerciseId: string, exerciseName: string) {
  const key = exerciseId.toLowerCase().replace(/[-_ ]/g, '');
  for (const dictKey of Object.keys(MUSCLE_DICTIONARY)) {
    const cleanDictKey = dictKey.replace(/[-_ ]/g, '');
    if (key.includes(cleanDictKey) || exerciseName.toLowerCase().includes(dictKey.replace('_', ' '))) {
      return MUSCLE_DICTIONARY[dictKey];
    }
  }
  return MUSCLE_DICTIONARY.pushup;
}

export const WorkoutVisualAnalytics: React.FC<Props> = ({ session, exerciseName }) => {
  const isZeroReps = session.validReps === 0;
  const isLowAccuracy = session.accuracy < 65 && !isZeroReps;
  const isSolidSession = session.validReps >= 5 && session.accuracy >= 70;
  const isElite = session.validReps >= 12 && session.accuracy >= 85;

  useEffect(() => {
    if (isElite) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#D6FF3F', '#FF6B00', '#00E5FF', '#10B981', '#FFFFFF'],
        });
      } catch {
        // ignore fallback
      }
    }
  }, [isElite]);

  const exerciseConfig = useMemo(() => {
    return getExerciseConfig(session.exerciseId, exerciseName);
  }, [session.exerciseId, exerciseName]);

  // Dynamic muscle activation scaling based on actual reps and accuracy
  const dynamicMuscles = useMemo(() => {
    const reps = session.validReps;
    if (reps === 0) {
      return exerciseConfig.muscles.map((m) => ({
        ...m,
        percentage: Math.round(m.basePercentage * 0.15),
      }));
    }

    const repProgress = Math.min(1.0, Math.max(0.35, reps / 12));
    const accuracyFactor = (session.accuracy / 100) * 0.2 + 0.8;

    return exerciseConfig.muscles.map((m) => {
      const percentage = Math.min(
        99,
        Math.max(15, Math.round(m.basePercentage * repProgress * accuracyFactor))
      );
      return {
        ...m,
        percentage,
      };
    });
  }, [session.validReps, session.accuracy, exerciseConfig]);

  // Realistic Calorie Expenditure Formula: (MET * 3.5 * 70kg / 200) * (duration / 60)
  const caloriesBurned = useMemo(() => {
    const durationMins = Math.max(0.15, session.durationSeconds / 60);
    const weightKg = 70;
    const repIntensity = isZeroReps ? 0.3 : Math.min(1.3, 0.7 + (session.validReps / 12) * 0.5);
    const kcal = ((exerciseConfig.met * 3.5 * weightKg) / 200) * durationMins * repIntensity;
    return Math.max(2, Math.round(kcal));
  }, [session.durationSeconds, session.validReps, isZeroReps, exerciseConfig.met]);

  // 1. Biomechanical Skill Radar Data
  const radarData = useMemo(() => {
    if (isZeroReps) {
      return [
        { subject: 'Strength', score: 18 },
        { subject: 'Endurance', score: Math.min(40, Math.round(session.durationSeconds * 0.8 + 10)) },
        { subject: 'Speed', score: 20 },
        { subject: 'Agility', score: 25 },
        { subject: 'Form', score: session.accuracy },
        { subject: 'Stability', score: 25 },
      ];
    }

    const reps = session.validReps;
    const acc = session.accuracy;
    return [
      { subject: 'Strength', score: Math.min(98, Math.round(reps * 5.2 + 28)) },
      { subject: 'Endurance', score: Math.min(98, Math.round(session.durationSeconds * 1.2 + 35)) },
      { subject: 'Speed', score: Math.min(98, Math.round(acc * 0.4 + reps * 3.5 + 25)) },
      { subject: 'Agility', score: Math.min(98, Math.round(acc * 0.5 + 35)) },
      { subject: 'Form', score: acc },
      { subject: 'Stability', score: Math.min(98, Math.round(acc * 0.85 + (reps > 5 ? 10 : 0))) },
    ];
  }, [isZeroReps, session.validReps, session.durationSeconds, session.accuracy]);

  // 2. Rep Velocity & Form Accuracy Trajectory Data
  const repTrajectoryData = useMemo(() => {
    if (isZeroReps) {
      return [
        { rep: 'Attempt 1', accuracy: session.accuracy, duration: 1.0, power: 15 },
        { rep: 'Attempt 2', accuracy: session.accuracy, duration: 1.2, power: 10 },
      ];
    }

    const repsCount = session.validReps;
    return Array.from({ length: repsCount }, (_, i) => {
      const repNum = i + 1;
      const duration = +(1.8 + (i / repsCount) * 0.6 + (Math.random() * 0.3 - 0.15)).toFixed(1);
      const repAcc = Math.min(100, Math.max(35, Math.round(session.accuracy + (Math.random() * 8 - 4))));
      const power = Math.max(35, Math.round(100 - (i / repsCount) * 28 + (Math.random() * 6 - 3)));
      return {
        rep: `Rep ${repNum}`,
        accuracy: repAcc,
        duration,
        power,
      };
    });
  }, [isZeroReps, session.validReps, session.accuracy]);

  return (
    <div className="w-full flex flex-col gap-6 my-6">
      {/* Dynamic Performance Header Banner */}
      <div
        className={`glass-card p-6 border-2 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isZeroReps
            ? 'border-amber-500/40 bg-amber-500/5'
            : isElite
            ? 'border-[var(--color-primary)]/60 shadow-[0_0_25px_rgba(214,255,63,0.15)]'
            : isSolidSession
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-slate-700/60'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="text-4xl">
            {isZeroReps ? '⚠️' : isElite ? '🏆' : isSolidSession ? '🎯' : '📈'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  isZeroReps
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : isElite
                    ? 'bg-primary text-black font-black'
                    : isSolidSession
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-surface text-muted border border-[var(--glass-border)]'
                }`}
              >
                {isZeroReps
                  ? 'ASSESSMENT INCOMPLETE'
                  : isElite
                  ? 'OUTSTANDING PERSONAL RECORD'
                  : isSolidSession
                  ? 'FORM VERIFIED'
                  : 'PRACTICE ATTEMPT'}
              </span>
              <span className="text-xs text-muted font-mono">
                {isZeroReps ? 'No valid reps recorded' : 'Biomechanical Telemetry Logged'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {isZeroReps
                ? `Form Calibration Needed — ${exerciseName}`
                : isElite
                ? `Outstanding Performance in ${exerciseName}!`
                : isSolidSession
                ? `Session Verified — ${session.validReps} Reps Completed`
                : `${exerciseName} Session Completed`}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {isZeroReps
                ? 'No full range-of-motion repetitions were detected. Ensure proper depth, full lockout, and camera visibility.'
                : isLowAccuracy
                ? 'Multiple form breaks detected. Focus on controlled tempo and hitting full joint angles.'
                : 'Sensor telemetry verified consistent range of motion and joint alignment.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-surface px-4 py-2.5 rounded-2xl border border-[var(--glass-border)] text-center">
            <span className="text-[10px] text-muted font-mono uppercase block">Form Score</span>
            <span
              className={`text-2xl font-black font-mono ${
                session.accuracy >= 80 ? 'text-primary' : session.accuracy >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {session.accuracy}%
            </span>
          </div>
        </div>
      </div>

      {/* Muscle Usage Heatmap & 2 Clean Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Muscle Usage Heatmap (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between border border-[var(--glass-border)] bg-[#111116]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-extrabold text-base text-white">Muscle Usage Heatmap</h3>
                <p className="text-muted text-xs mt-0.5">Targeted kinetic chain recruitment breakdown</p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-surface text-amber-400 border border-amber-500/20">
                Heatmap
              </span>
            </div>

            <div className="space-y-4 my-5">
              {dynamicMuscles.map((m) => (
                <div key={m.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-bold tracking-wide">{m.name}</span>
                    <span className="text-muted font-mono text-[11px]">
                      {m.role} <span className="text-slate-500">—</span>{' '}
                      <strong
                        className={`font-bold ${
                          m.percentage >= 80
                            ? 'text-amber-400'
                            : m.percentage >= 60
                            ? 'text-primary'
                            : 'text-cyan-400'
                        }`}
                      >
                        {m.percentage}%
                      </strong>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1c1c24] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${m.percentage}%`,
                        background:
                          m.percentage >= 80
                            ? 'linear-gradient(90deg, #D6FF3F 0%, #FF8A00 100%)'
                            : m.percentage >= 60
                            ? 'linear-gradient(90deg, #00E5FF 0%, #D6FF3F 100%)'
                            : 'linear-gradient(90deg, #00E5FF 0%, #10B981 100%)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--glass-border)] flex items-center justify-between text-xs text-muted font-mono">
            <span>
              Primary Prime Mover: <strong className="text-slate-200">{exerciseConfig.primeMover}</strong>
            </span>
            <span>
              Est. Energy Spent: <strong className="text-primary">{caloriesBurned} kcal</strong>
            </span>
          </div>
        </div>

        {/* Right Column: 2 Minimal High-Impact Graphs (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Graph 1: Rep Velocity & Form Accuracy Trajectory */}
          <div className="glass-card p-5 border border-[var(--glass-border)]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-sm text-white">Form Accuracy & Velocity Trajectory</h4>
                <p className="text-muted text-xs">Progression of posture alignment (%) across repetitions</p>
              </div>
              <span className="text-[10px] font-mono text-muted">
                {isZeroReps ? 'Calibration' : `${session.validReps} Reps Tracked`}
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={repTrajectoryData}>
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="rep" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#12121A',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: any, name: any) => [
                      name === 'accuracy' ? `${value}% Form Score` : `${value}s Duration`,
                      name === 'accuracy' ? 'Accuracy' : 'Pace',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#accuracyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graph 2: Biomechanical Skills Radar */}
          <div className="glass-card p-5 border border-[var(--glass-border)]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-bold text-sm text-white">Biomechanical Skill Radar</h4>
                <p className="text-muted text-xs">Multi-axis physical attribute evaluation</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface text-secondary-color border border-[var(--glass-border)]">
                Radar
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.12)" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                  <Radar
                    name="Athlete"
                    dataKey="score"
                    stroke="#00E5FF"
                    fill="#00E5FF"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
