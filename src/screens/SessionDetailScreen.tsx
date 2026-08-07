import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SummaryCard } from '../components/SummaryCard';
import { WorkoutVisualAnalytics } from '../components/WorkoutVisualAnalytics';
import { getExerciseById } from '../data/exerciseCatalog';
import { useSessionContext } from '../context/SessionContext';
import { getNotesForSession } from '../data/sessionRepository';
import type { ScoutNote } from '../models/sessionResult';

export function SessionDetailScreen() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessions, loading, removeSession } = useSessionContext();
  const [scoutNotes, setScoutNotes] = useState<ScoutNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const id = sessionId ? Number(sessionId) : NaN;
  const session = sessions.find((s) => s.id === id);
  const exercise = session ? getExerciseById(session.exerciseId) : undefined;

  // Fetch coach/scout notes for this specific workout session
  useEffect(() => {
    if (session?.id != null) {
      setLoadingNotes(true);
      getNotesForSession(session.id)
        .then((notes) => setScoutNotes(notes))
        .catch((err) => console.error('Failed to load scout notes', err))
        .finally(() => setLoadingNotes(false));
    }
  }, [session?.id]);

  const handleDelete = async () => {
    if (session?.id == null) return;
    if (window.confirm('Are you sure you want to delete this workout session?')) {
      await removeSession(session.id);
      navigate('/app/history');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <p className="text-muted text-sm">Loading session telemetry…</p>
      </div>
    );
  }

  if (!session || !exercise) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-danger text-lg mb-4">Workout session not found</p>
        <Link to="/app/history" className="text-primary underline text-sm">
          ← Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--glass-border)]">
        <button
          onClick={() => navigate('/app/history')}
          className="text-muted hover:text-white transition-colors text-sm flex items-center gap-1.5"
        >
          <span>←</span> Back to History
        </button>
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
            <span>{exercise.iconAsset}</span> {exercise.displayName} Session Breakdown
          </h1>
          <p className="text-xs text-muted font-mono mt-0.5">
            {new Date(session.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="w-20" />
      </div>

      {/* Session Summary Card */}
      <SummaryCard
        exerciseName={exercise.displayName}
        icon={exercise.iconAsset}
        mode={exercise.mode}
        session={session}
      />

      {/* Scout / Coach Feedback & Messages */}
      <div className="glass-card p-6 border border-cyan-500/30 bg-[#10141d] rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <div>
              <h3 className="font-extrabold text-base text-white">Scout & Coach Feedback</h3>
              <p className="text-xs text-muted">Notes and recommendations from talent scouts</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {scoutNotes.length} {scoutNotes.length === 1 ? 'Message' : 'Messages'}
          </span>
        </div>

        {loadingNotes ? (
          <p className="text-xs text-muted">Loading scout feedback…</p>
        ) : scoutNotes.length === 0 ? (
          <div className="bg-surface/50 p-4 rounded-xl border border-[var(--glass-border)] text-center">
            <p className="text-xs text-slate-300">
              No scout messages on this session yet. Certified by ONFORM AI biomechanical engine.
            </p>
            <p className="text-[11px] text-muted mt-1">
              When scouts review this session in the Scout Portal, their coaching notes will appear right here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {scoutNotes.map((n, i) => (
              <div
                key={i}
                className="glass-card p-4 rounded-xl bg-[var(--color-background)] border border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                      {n.scoutName[0] ?? 'S'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{n.scoutName}</span>
                      <span className="text-[10px] font-mono text-muted">{n.scoutEmail}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-muted">
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed pl-9 border-l-2 border-cyan-500/40 mt-1">
                  "{n.note}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workout Visual Analytics (Trajectory + Radar + Muscle Heatmap) */}
      <WorkoutVisualAnalytics session={session} exerciseName={exercise.displayName} />

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <Link
          to={`/app/assess/${exercise.id}`}
          className="flex-1 py-3.5 rounded-2xl font-bold text-center text-black neon-glow hover:scale-[1.02] active:scale-[0.98] transition-transform"
          style={{ background: 'var(--color-primary)' }}
        >
          Do It Again 🔄
        </Link>
        <button
          onClick={handleDelete}
          className="flex-1 glass-card py-3.5 rounded-2xl font-bold text-danger hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors text-center"
        >
          Delete Session 🗑️
        </button>
      </div>
    </div>
  );
}
