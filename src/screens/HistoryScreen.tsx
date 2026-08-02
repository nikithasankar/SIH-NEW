// History screen — Phase 8
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { SessionListTile } from '../components/SessionListTile';
import { useSessionContext } from '../context/SessionContext';

export function HistoryScreen() {
  const navigate = useNavigate();
  const { sessions, loading } = useSessionContext();

  return (
    <div className="w-full flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">History</h1>

      {!loading && sessions.length === 0 && (
        <EmptyState
          icon="📋"
          title="No sessions yet"
          description="Your workout history will appear here."
        />
      )}

      {sessions.length > 0 && (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <SessionListTile
              key={session.id}
              session={session}
              onClick={() => session.id != null && navigate(`/app/passport/${session.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
