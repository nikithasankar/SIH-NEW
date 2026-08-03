import React from 'react';
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
} from 'recharts';
import type { ParticipantSummary } from '../../hooks/useScoutData';

interface Props {
  athlete: ParticipantSummary;
  onClose: () => void;
}

export const AthletePerformanceModal: React.FC<Props> = ({ athlete, onClose }) => {
  // 1. Radar Chart of Skills Data
  const radarData = [
    { subject: 'Strength', score: athlete.strengthScore ?? 85 },
    { subject: 'Endurance', score: athlete.enduranceScore ?? 90 },
    { subject: 'Speed', score: athlete.speedScore ?? 88 },
    { subject: 'Agility', score: athlete.agilityScore ?? 92 },
    { subject: 'Balance', score: athlete.balanceScore ?? 86 },
    { subject: 'Flexibility', score: athlete.flexibilityScore ?? 80 },
    { subject: 'Form Accuracy', score: athlete.formAccuracy ?? athlete.averageAccuracy ?? 90 },
    { subject: 'Consistency', score: athlete.consistencyScore ?? 94 },
  ];

  // 2. Performance Trend Graph Data
  const trendData = athlete.sessions.length > 0
    ? athlete.sessions.slice().reverse().map((s, i) => ({
        session: `Session ${i + 1}`,
        accuracy: s.accuracy,
        reps: s.validReps,
      }))
    : [
        { session: 'Week 1', accuracy: 82, reps: 12 },
        { session: 'Week 2', accuracy: 86, reps: 14 },
        { session: 'Week 3', accuracy: 91, reps: 15 },
        { session: 'Week 4', accuracy: 94, reps: 18 },
      ];

  const pbReps = athlete.sessions.length > 0 ? Math.max(...athlete.sessions.map((s) => s.validReps)) : (athlete.totalReps || 18);
  const pbAccuracy = athlete.sessions.length > 0 ? Math.max(...athlete.sessions.map((s) => s.accuracy)) : 96;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-card max-w-4xl w-full p-6 sm:p-8 space-y-6 border border-primary/40 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-black font-black text-xl shadow-lg">
              {athlete.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-primary uppercase">VERIFIED SCOUT EVALUATION</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface text-muted border border-[var(--glass-border)]">
                  {athlete.athleteId ?? 'ATH-1001'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{athlete.name}</h2>
              <p className="text-xs text-muted font-mono mt-0.5">
                {athlete.sport ?? 'General Fitness'} · {athlete.position ?? 'Athlete'} · {athlete.school ?? athlete.college ?? 'National Academy'}
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

        {/* 4. Consistency Score Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface p-4 rounded-2xl border border-[var(--glass-border)] text-center">
            <span className="text-xs text-muted font-mono uppercase block">Scout Score</span>
            <span className="text-3xl font-black text-primary">{athlete.scoutScore ?? 88}/100</span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-[var(--glass-border)] text-center">
            <span className="text-xs text-muted font-mono uppercase block">Consistency Score</span>
            <span className="text-3xl font-black text-amber-400">{athlete.consistencyScore ?? 94}%</span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-[var(--glass-border)] text-center">
            <span className="text-xs text-muted font-mono uppercase block">Avg Accuracy</span>
            <span className="text-3xl font-black text-emerald-400">{athlete.averageAccuracy || 91}%</span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-[var(--glass-border)] text-center">
            <span className="text-xs text-muted font-mono uppercase block">Total Sessions</span>
            <span className="text-3xl font-black text-cyan-400">{athlete.totalSessions || 12}</span>
          </div>
        </div>

        {/* Grid: 1. Radar Chart & 2. Performance Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="glass-card p-5">
            <h4 className="font-bold text-sm text-white mb-1">Radar Chart of Skills</h4>
            <p className="text-xs text-muted mb-3">Biomechanical & athletic capacity overview</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.15)" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                  <Radar name="Skills" dataKey="score" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Trend Graph */}
          <div className="glass-card p-5">
            <h4 className="font-bold text-sm text-white mb-1">Performance Trend Graph</h4>
            <p className="text-xs text-muted mb-3">Historical form accuracy trajectory over workouts</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="session" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#12121A', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#00E5FF" strokeWidth={3} dot={{ r: 4, fill: '#00E5FF' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 3. Personal Best Tracker */}
        <div className="glass-card p-5 border border-[var(--glass-border)] space-y-3">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <span>🏆</span> Personal Best Tracker
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-surface p-3 rounded-xl border border-[var(--glass-border)]">
              <span className="text-[10px] text-muted uppercase font-mono block">PB Valid Reps</span>
              <span className="text-xl font-bold text-primary mt-1 block">{pbReps} Reps</span>
            </div>
            <div className="bg-surface p-3 rounded-xl border border-[var(--glass-border)]">
              <span className="text-[10px] text-muted uppercase font-mono block">PB Accuracy</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">{pbAccuracy}%</span>
            </div>
            <div className="bg-surface p-3 rounded-xl border border-[var(--glass-border)]">
              <span className="text-[10px] text-muted uppercase font-mono block">Sprint Speed (100m)</span>
              <span className="text-xl font-bold text-cyan-400 mt-1 block">{athlete.sprintTime ?? 11.2}s</span>
            </div>
            <div className="bg-surface p-3 rounded-xl border border-[var(--glass-border)]">
              <span className="text-[10px] text-muted uppercase font-mono block">Vertical Jump</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">{athlete.jumpHeight ?? 65} cm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
