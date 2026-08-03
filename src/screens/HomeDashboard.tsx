import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useSessionContext } from '../context/SessionContext';

interface Exercise {
  id: string;
  name: string;
  category: 'Strength' | 'Lower Body' | 'Core' | 'Cardio' | 'Arms';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationOrReps: string;
  icon: string;
  primaryJoint: string;
  description: string;
}

const AVAILABLE_EXERCISES: Exercise[] = [
  {
    id: 'pushup',
    name: 'Standard Push-Ups',
    category: 'Strength',
    difficulty: 'Beginner',
    durationOrReps: '12 Reps',
    icon: '💪',
    primaryJoint: '90° Elbow Flexion',
    description: 'Upper body pushing strength focusing on chest, triceps, and anterior deltoids.',
  },
  {
    id: 'squat',
    name: 'Deep Squats',
    category: 'Lower Body',
    difficulty: 'Beginner',
    durationOrReps: '15 Reps',
    icon: '🏋️',
    primaryJoint: 'Hip Below Knee',
    description: 'Fundamental compound movement targeting quadriceps, hamstrings, and glutes.',
  },
  {
    id: 'shoulder_press',
    name: 'Overhead Shoulder Press',
    category: 'Strength',
    difficulty: 'Intermediate',
    durationOrReps: '10-12 Reps',
    icon: '🏋️‍♂️',
    primaryJoint: '160° Lockout',
    description: 'Vertical pressing power testing shoulder stability and full overhead range.',
  },
  {
    id: 'plank',
    name: 'Forearm Isometric Plank',
    category: 'Core',
    difficulty: 'Intermediate',
    durationOrReps: '60 Seconds',
    icon: '🧘',
    primaryJoint: '180° Neutral Spine',
    description: 'Isometric anti-extension core hold to strengthen deep abdominal wall.',
  },
  {
    id: 'lunge',
    name: 'Alternating Lunges',
    category: 'Lower Body',
    difficulty: 'Beginner',
    durationOrReps: '20 Reps',
    icon: '🦵',
    primaryJoint: '90° Knee Drop',
    description: 'Unilateral leg strength, balance, and hip stability with alternating steps.',
  },
  {
    id: 'bicep_curl',
    name: 'Dumbbell Bicep Curls',
    category: 'Arms',
    difficulty: 'Beginner',
    durationOrReps: '12 Reps',
    icon: '💪',
    primaryJoint: '50° Peak Squeeze',
    description: 'Isolated elbow flexion targeting the biceps brachii with controlled tempo.',
  },
  {
    id: 'situp',
    name: 'Core Sit-Ups',
    category: 'Core',
    difficulty: 'Beginner',
    durationOrReps: '15 Reps',
    icon: '🤸',
    primaryJoint: '70° Spine Flexion',
    description: 'Dynamic trunk flexion engaging rectus abdominis through full range of motion.',
  },
  {
    id: 'high_knees',
    name: 'Cardio High Knees',
    category: 'Cardio',
    difficulty: 'Intermediate',
    durationOrReps: '45 Seconds',
    icon: '🏃',
    primaryJoint: 'Hip-Level Elevation',
    description: 'High-tempo cardiovascular conditioning training explosive hip flexor drive.',
  },
];

const CATEGORIES = ['All', 'Strength', 'Lower Body', 'Core', 'Cardio', 'Arms'] as const;

export const HomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totalReps, totalSessions, averageAccuracy, streak } = useSessionContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredExercises = useMemo(() => {
    if (selectedCategory === 'All') return AVAILABLE_EXERCISES;
    return AVAILABLE_EXERCISES.filter((ex) => ex.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="w-full flex flex-col gap-10 sm:gap-12 pb-8">
      {/* Header & Athlete Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-2 border-b border-[var(--glass-border)]">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-primary uppercase">
              ATHLETE TRAINING CONSOLE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome Back, {user?.name ? user.name.split(' ')[0] : 'Athlete'}
          </h1>
          <p className="text-muted text-sm sm:text-base mt-1">
            Choose an activity below to calibrate your form with <strong className="text-white">ONFORM AI Coach</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/status')}
            className="px-4 py-2.5 rounded-2xl glass-card flex items-center gap-2 text-xs font-bold text-white hover:border-primary/50 transition-colors"
          >
            <span>📊</span> View Status
          </button>
          <button
            onClick={() => navigate('/app/exercises')}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-black transition-transform duration-150 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(214,255,63,0.25)]"
            style={{ background: 'var(--color-primary)' }}
          >
            All Workouts →
          </button>
        </div>
      </div>

      {/* Athlete Stats Quick Bar (Fluid Responsive 4-Column Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
          <span className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">Total Reps</span>
          <div className="text-3xl sm:text-4xl font-black text-primary mt-2">{totalReps}</div>
          <span className="text-[11px] text-muted mt-1">Verified movements</span>
        </div>

        <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
          <span className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">Sessions</span>
          <div className="text-3xl sm:text-4xl font-black text-secondary-color mt-2">{totalSessions}</div>
          <span className="text-[11px] text-muted mt-1">Completed workouts</span>
        </div>

        <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
          <span className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">Avg Accuracy</span>
          <div className="text-3xl sm:text-4xl font-black text-white mt-2">
            {totalSessions > 0 ? `${averageAccuracy}%` : '—'}
          </div>
          <span className="text-[11px] text-muted mt-1">Biomechanical precision</span>
        </div>

        <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
          <span className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">Day Streak</span>
          <div className="text-3xl sm:text-4xl font-black mt-2" style={{ color: 'var(--color-warning)' }}>
            {streak} 🔥
          </div>
          <span className="text-[11px] text-muted mt-1">Consecutive training days</span>
        </div>
      </div>

      {/* Featured Quick Start Banner */}
      <div className="glass-card p-6 sm:p-8 relative overflow-hidden border border-[var(--color-primary)]/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-primary/10 text-primary border border-primary/20">
              RECOMMENDED TODAY
            </span>
            <span className="text-xs text-muted font-mono">15 Min Biomechanical Benchmark</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">Standard Push-Up & Squat Calibration</h3>
          <p className="text-muted text-sm leading-relaxed">
            Test full depth with real-time audio corrections from ONFORM AI Coach. Capture your benchmark score to update your QR Passport.
          </p>
        </div>
        <button
          onClick={() => navigate('/app/assess/pushup')}
          className="px-6 py-3.5 rounded-2xl font-bold text-sm text-black transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(214,255,63,0.3)] shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          Launch Benchmark ⚡
        </button>
      </div>

      {/* Category Filter Pills & Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Exercise Protocols</h2>
          <p className="text-muted text-sm">Select an activity to launch real-time AI camera tracking.</p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'shadow-sm text-black'
                    : 'bg-surface text-muted hover:text-white hover:bg-surface-hover border border-[var(--glass-border)]'
                }`}
                style={isActive ? { background: 'var(--color-primary)' } : undefined}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expansive Responsive 4-Column Grid (NO cramped dead zones) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => navigate(`/app/assess/${exercise.id}`)}
            className="group glass-card p-6 cursor-pointer hover:border-[var(--color-primary)] hover:translate-y-[-3px] transition-all duration-300 flex flex-col justify-between min-h-[240px] relative overflow-hidden"
          >
            <div
              className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[var(--color-primary)] opacity-0 group-hover:opacity-10 blur-2xl transition-opacity pointer-events-none"
            />

            <div>
              {/* Card Header: Icon & Badges */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-2xl border border-[var(--glass-border)] group-hover:border-[var(--color-primary)]/40 transition-colors">
                  {exercise.icon}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                    exercise.difficulty === 'Beginner'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : exercise.difficulty === 'Intermediate'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {exercise.difficulty}
                  </span>
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                    {exercise.category}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                {exercise.name}
              </h3>
              <p className="text-muted text-xs line-clamp-2 mt-1.5 leading-relaxed">
                {exercise.description}
              </p>
            </div>

            {/* Card Footer: Target & Launch Trigger */}
            <div className="pt-4 mt-4 border-t border-[var(--glass-border)] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-secondary-color block font-medium">
                  {exercise.primaryJoint}
                </span>
                <span className="text-xs font-mono text-muted">
                  Goal: {exercise.durationOrReps}
                </span>
              </div>

              <div className="h-9 w-9 rounded-full bg-surface group-hover:bg-primary group-hover:text-black text-muted border border-[var(--glass-border)] flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm">
                →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

