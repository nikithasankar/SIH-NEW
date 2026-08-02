// Passport screen — detail view of a single completed session.
// Full QR-code export is out of scope here (tracked separately as Phase 11);
// this wires up the core session detail view on top of persisted data.
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SummaryCard } from '../components/SummaryCard';
import { QRPassport } from '../components/QRPassport';
import { getExerciseById } from '../data/exerciseCatalog';
import { useSessionContext } from '../context/SessionContext';
import { useAuth } from '../auth/AuthContext';

export function PassportScreen() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessions, loading, removeSession } = useSessionContext();
  const { user } = useAuth();

  const id = sessionId ? Number(sessionId) : NaN;
  const session = sessions.find((s) => s.id === id);
  const exercise = session ? getExerciseById(session.exerciseId) : undefined;

  const handleDelete = async () => {
    if (session?.id == null) return;
    await removeSession(session.id);
    navigate('/app/history');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted text-sm">Loading session…</p>
      </div>
    );
  }

  if (!session || !exercise) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-danger text-lg mb-4">Session not found</p>
        <Link to="/app/history" className="text-primary underline">Back to history</Link>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 pt-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-muted hover:text-[var(--color-text-main)] transition-colors text-sm"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold">Fitness Passport</h1>
        <div className="w-12" />
      </div>

      <SummaryCard
        exerciseName={exercise.displayName}
        icon={exercise.iconAsset}
        mode={exercise.mode}
        session={session}
      />

      <div className="mt-4">
        <QRPassport
          exerciseName={exercise.displayName}
          icon={exercise.iconAsset}
          athleteName={user?.name}
          session={session}
        />
      </div>

      <div className="flex gap-3 mt-6">
        <Link
          to={`/app/assess/${exercise.id}`}
          className="flex-1 py-3 rounded-2xl font-semibold text-center neon-glow hover:scale-[1.02] active:scale-[0.98] transition-transform"
          style={{ background: 'var(--color-primary)', color: 'var(--color-background)' }}
        >
          Do It Again
        </Link>
        <button
          onClick={handleDelete}
          className="flex-1 glass-card py-3 font-medium text-danger hover:opacity-90 transition-opacity"
        >
          Delete Session
        </button>
      </div>
    </div>
  );
}
