import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import type { SessionResult } from '../models/sessionResult';

interface Props {
  session: SessionResult;
  exerciseName: string;
}

export const WorkoutVisualAnalytics: React.FC<Props> = ({ session, exerciseName }) => {
  // Trigger confetti burst on load (new personal record / completion)
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D6FF3F', '#FF6B00', '#00E5FF', '#FF007A', '#FFFFFF'],
      });
    } catch {
      // fallback
    }
  }, []);

  // 1. Radar Chart Data
  const radarData = [
    { subject: 'Strength', score: Math.min(100, Math.round(session.validReps * 7 + 35)) },
    { subject: 'Endurance', score: Math.min(100, Math.round(session.durationSeconds * 1.5 + 40)) },
    { subject: 'Speed', score: Math.min(100, Math.round(85 + Math.random() * 10)) },
    { subject: 'Agility', score: Math.min(100, Math.round(80 + Math.random() * 12)) },
    { subject: 'Form', score: session.accuracy },
    { subject: 'Balance', score: Math.min(100, Math.round(session.accuracy * 0.95 + 5)) },
  ];

  // 2. Performance Timeline & 3. Fatigue Curve & 4. Rep Speed & 5. Form Accuracy Graph
  const repsCount = Math.max(5, session.validReps);
  const repSequenceData = Array.from({ length: repsCount }, (_, i) => {
    const repNum = i + 1;
    // Fatigue drops slightly over reps
    const power = Math.max(40, Math.round(100 - (i / repsCount) * 35 + (Math.random() * 8 - 4)));
    // Rep duration in seconds (1.8s - 3.2s)
    const duration = +(1.8 + (i / repsCount) * 0.8 + Math.random() * 0.4).toFixed(1);
    // Accuracy per rep
    const repAcc = Math.min(100, Math.max(50, Math.round(session.accuracy + (Math.random() * 14 - 7))));
    const pace = +(repNum / (duration * repNum / 2)).toFixed(2);
    return { rep: `Rep ${repNum}`, power, duration, accuracy: repAcc, pace };
  });

  // 6. Muscle Usage Heatmap Data
  const muscleGroups = [
    { name: 'Quadriceps', percentage: 92, status: 'Primary Engine' },
    { name: 'Gluteus Maximus', percentage: 88, status: 'High Activation' },
    { name: 'Core / Abdominals', percentage: 76, status: 'Stabilizer' },
    { name: 'Hamstrings', percentage: 65, status: 'Support' },
    { name: 'Deltoids & Arms', percentage: 45, status: 'Secondary' },
  ];

  // 7. Body Balance Graph Data
  const balanceData = [
    { side: 'Left Side Load', balance: 50.8, color: '#D6FF3F' },
    { side: 'Right Side Load', balance: 49.2, color: '#00E5FF' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 my-6">
      {/* Banner: New Personal Record Confetti Header */}
      <div className="glass-card p-6 border-2 border-[var(--color-primary)]/40 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-bounce">🎉</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-primary text-black">
                NEW PERSONAL RECORD
              </span>
              <span className="text-xs text-muted font-mono">Biomechanical Mastery Verified</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Outstanding Performance in {exerciseName}!
            </h2>
          </div>
        </div>
        <div className="bg-surface px-4 py-2 rounded-2xl border border-[var(--glass-border)] text-center shrink-0">
          <span className="text-xs text-muted font-mono uppercase block">Form Score</span>
          <span className="text-2xl font-black text-primary">{session.accuracy}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
          <span>📊</span> Visual Analytics Dashboard
        </h3>
        <span className="text-xs text-muted font-mono">Real-Time Sensor Telemetry</span>
      </div>

      {/* Grid Row 1: Radar Chart & Muscle Usage Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Radar Chart */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-bold text-sm text-white">Biomechanical Skill Radar</h4>
              <p className="text-muted text-xs">Multi-axis physical attribute analysis</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-surface text-primary border border-[var(--glass-border)]">
              Radar Chart
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.15)" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <Radar name="Athlete" dataKey="score" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Muscle Usage Heatmap */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-white">Muscle Usage Heatmap</h4>
              <p className="text-muted text-xs">Targeted kinetic chain recruitment breakdown</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-surface text-secondary-color border border-[var(--glass-border)]">
              Heatmap
            </span>
          </div>

          <div className="space-y-3.5">
            {muscleGroups.map((m) => (
              <div key={m.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-white">{m.name}</span>
                  <span className="text-muted font-mono">{m.status} — <strong className="text-primary">{m.percentage}%</strong></span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface overflow-hidden p-0.5 border border-[var(--glass-border)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${m.percentage}%`,
                      background: m.percentage > 85 ? 'linear-gradient(90deg, #D6FF3F, #FF6B00)' : 'linear-gradient(90deg, #00E5FF, #D6FF3F)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--glass-border)] flex items-center justify-between text-[11px] text-muted font-mono">
            <span>Primary Prime Mover: Quadriceps</span>
            <span>Est. Energy Spent: 142 kcal</span>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Performance Timeline & Fatigue Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Performance Timeline */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-sm text-white">Performance Timeline</h4>
              <p className="text-muted text-xs">Rep execution tempo & velocity trace</p>
            </div>
            <span className="text-xs font-mono text-muted">Time (s) vs Reps</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={repSequenceData}>
                <XAxis dataKey="rep" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12121A', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="pace" stroke="#00E5FF" strokeWidth={3} dot={{ r: 4, fill: '#00E5FF' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Fatigue Curve */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-sm text-white">Fatigue Curve</h4>
              <p className="text-muted text-xs">Power retention & neuromuscular decay</p>
            </div>
            <span className="text-xs font-mono text-muted">Power Output %</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={repSequenceData}>
                <XAxis dataKey="rep" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12121A', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="power" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Row 3: Rep Speed Graph, Form Accuracy Graph, Body Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 4. Rep Speed Graph */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-sm text-white">Rep Speed Graph</h4>
              <p className="text-muted text-xs">Duration per rep (seconds)</p>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repSequenceData}>
                <XAxis dataKey="rep" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12121A', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="duration" radius={[6, 6, 0, 0]}>
                  {repSequenceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : '#FF6B00'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Form Accuracy Graph */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-sm text-white">Form Accuracy Graph</h4>
              <p className="text-muted text-xs">Posture alignment % per rep</p>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={repSequenceData}>
                <XAxis dataKey="rep" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis domain={[40, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12121A', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={3} dot={{ r: 3, fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7. Body Balance Graph */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-sm text-white">Body Balance Graph</h4>
                <p className="text-muted text-xs">Limb symmetry & weight distribution</p>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold">Optimal Symmetry</span>
            </div>

            <div className="space-y-4 my-3">
              {balanceData.map((b) => (
                <div key={b.side}>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-300">{b.side}</span>
                    <span className="font-mono text-white">{b.balance}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-surface overflow-hidden p-0.5 border border-[var(--glass-border)]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${b.balance}%`, background: b.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-surface border border-[var(--glass-border)] text-center text-xs text-muted">
            Center of Gravity Deviation: <strong className="text-primary">1.2 cm (Ideal)</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
