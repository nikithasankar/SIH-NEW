import { useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useScoutData, type ParticipantSummary } from '../../hooks/useScoutData';
import { getExerciseById } from '../../data/exerciseCatalog';
import type { SessionResult } from '../../models/sessionResult';

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function relativeTime(iso: string | null): string {
  if (!iso) return 'No sessions yet';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function SuggestionChip({ session }: { session: SessionResult }) {
  const suggestions: string[] = [];
  if (session.formBreaks > Math.max(2, session.validReps * 0.25)) {
    suggestions.push('Focus on full range of motion — frequent form breaks recorded');
  }
  if (session.accuracy < 60) {
    suggestions.push('Slow tempo down to reinforce baseline movement mechanics');
  }
  if (session.validReps === 0 && session.durationSeconds > 0) {
    suggestions.push('Re-check camera angle — no valid repetitions registered');
  }
  if (suggestions.length === 0) {
    suggestions.push('Clean execution — ready to progress to higher volume or load');
  }

  return (
    <ul className="mt-2 space-y-1.5">
      {suggestions.map((s, i) => (
        <li key={i} className="text-xs text-secondary-color flex items-center gap-2 bg-secondary/5 px-3 py-1.5 rounded-lg border border-secondary/10">
          <span>💡</span>
          <span className="font-medium">{s}</span>
        </li>
      ))}
    </ul>
  );
}

function AthleteSessionRow({
  session,
  scoutEmail,
  onAddNote,
  notes,
}: {
  session: SessionResult;
  scoutEmail: string;
  onAddNote: (sessionId: number, note: string) => void;
  notes: { note: string; createdAt: string; scoutName: string }[];
}) {
  const exercise = getExerciseById(session.exerciseId);
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-surface rounded-2xl p-4 border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 rounded-xl bg-[var(--color-background)] border border-[var(--glass-border)]">
            {exercise?.iconAsset ?? '🏃'}
          </span>
          <div>
            <p className="font-bold text-sm text-white">{exercise?.displayName ?? session.exerciseId}</p>
            <p className="text-muted text-xs font-mono">{new Date(session.timestamp).toLocaleString()}</p>
          </div>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--color-background)] text-primary hover:border-primary/40 transition-colors"
        >
          {open ? 'Hide Details ▲' : 'Review & Notes ▼'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-3 text-center pt-3 border-t border-[var(--glass-border)]">
        <div className="bg-[var(--color-background)]/50 rounded-xl p-2">
          <div className="text-sm font-black text-primary">{session.validReps}</div>
          <div className="text-[9px] text-muted uppercase font-mono tracking-wider">Reps</div>
        </div>
        <div className="bg-[var(--color-background)]/50 rounded-xl p-2">
          <div className="text-sm font-black text-danger">{session.formBreaks}</div>
          <div className="text-[9px] text-muted uppercase font-mono tracking-wider">Breaks</div>
        </div>
        <div className="bg-[var(--color-background)]/50 rounded-xl p-2">
          <div className="text-sm font-black text-secondary-color">{session.accuracy}%</div>
          <div className="text-[9px] text-muted uppercase font-mono tracking-wider">Accuracy</div>
        </div>
        <div className="bg-[var(--color-background)]/50 rounded-xl p-2">
          <div className="text-sm font-black text-white">{formatDuration(session.durationSeconds)}</div>
          <div className="text-[9px] text-muted uppercase font-mono tracking-wider">Duration</div>
        </div>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-[var(--glass-border)] animate-slide-up space-y-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block mb-1">
              Biomechanical Evaluation
            </span>
            <SuggestionChip session={session} />
          </div>

          {notes.length > 0 && (
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block mb-1.5">
                Scout Feedback Logs
              </span>
              <div className="space-y-2">
                {notes.map((n, i) => (
                  <div key={i} className="glass-card p-3 rounded-xl bg-[var(--color-background)] border border-[var(--glass-border)]">
                    <p className="text-xs text-white leading-relaxed">{n.note}</p>
                    <p className="text-[10px] text-muted font-mono mt-1">
                      — {n.scoutName} ({scoutEmail}) · {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add coaching note for this session..."
                className="flex-1 bg-[var(--color-background)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)] transition-colors text-white"
              />
              <button
                onClick={() => {
                  if (!draft.trim() || session.id == null) return;
                  onAddNote(session.id, draft.trim());
                  setDraft('');
                }}
                disabled={!draft.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-black disabled:opacity-40 transition-transform active:scale-95 shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AthleteCard({
  athlete,
  scoutEmail,
  notesBySession,
  onAddNote,
}: {
  athlete: ParticipantSummary;
  scoutEmail: string;
  notesBySession: Record<number, { note: string; createdAt: string; scoutName: string }[]>;
  onAddNote: (sessionId: number, note: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleSessions = expanded ? athlete.sessions : athlete.sessions.slice(0, 2);

  return (
    <div className="glass-card p-6 flex flex-col justify-between hover:border-[var(--color-primary)]/40 transition-all duration-200">
      <div>
        {/* Athlete Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-black shadow-sm"
              style={{ background: 'var(--color-primary)' }}
            >
              {athlete.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <p className="font-bold text-base text-white">{athlete.name}</p>
              <p className="text-muted text-xs font-mono">{athlete.email}</p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-surface border border-[var(--glass-border)] text-muted">
            {relativeTime(athlete.lastActive)}
          </span>
        </div>

        {/* Athlete Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-surface rounded-xl p-3 text-center border border-[var(--glass-border)]">
            <div className="text-lg font-black text-primary">{athlete.totalSessions}</div>
            <div className="text-[10px] text-muted uppercase font-mono tracking-wider">Sessions</div>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center border border-[var(--glass-border)]">
            <div className="text-lg font-black text-secondary-color">{athlete.totalReps}</div>
            <div className="text-[10px] text-muted uppercase font-mono tracking-wider">Total Reps</div>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center border border-[var(--glass-border)]">
            <div className="text-lg font-black text-white">
              {athlete.totalSessions > 0 ? `${athlete.averageAccuracy}%` : '—'}
            </div>
            <div className="text-[10px] text-muted uppercase font-mono tracking-wider">Avg Accuracy</div>
          </div>
        </div>

        {/* Sessions List */}
        {athlete.sessions.length === 0 ? (
          <div className="text-center py-6 text-muted text-xs bg-surface rounded-xl border border-[var(--glass-border)]">
            No training sessions recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                Recent Sessions ({athlete.sessions.length})
              </span>
            </div>
            {visibleSessions.map((s) => (
              <AthleteSessionRow
                key={s.id}
                session={s}
                scoutEmail={scoutEmail}
                notes={s.id != null ? notesBySession[s.id] ?? [] : []}
                onAddNote={onAddNote}
              />
            ))}
          </div>
        )}
      </div>

      {athlete.sessions.length > 2 && (
        <div className="mt-4 pt-3 border-t border-[var(--glass-border)]">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full text-center text-xs font-semibold text-muted hover:text-primary transition-colors py-1"
          >
            {expanded ? '▲ Collapse Sessions' : `▼ View ${athlete.sessions.length - 2} More Session(s)`}
          </button>
        </div>
      )}
    </div>
  );
}

export function ScoutDashboard() {
  const { user, logout } = useAuth();
  const { participants, notesBySession, loading, addNote } = useScoutData();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'sessions' | 'accuracy'>('recent');

  const totalsAcrossRoster = useMemo(() => {
    return participants.reduce(
      (acc, p) => {
        acc.sessions += p.totalSessions;
        acc.reps += p.totalReps;
        acc.totalAccuracySum += p.averageAccuracy * (p.totalSessions > 0 ? 1 : 0);
        if (p.totalSessions > 0) acc.activeAthletes += 1;
        return acc;
      },
      { sessions: 0, reps: 0, totalAccuracySum: 0, activeAthletes: 0 }
    );
  }, [participants]);

  const rosterAverageAccuracy = totalsAcrossRoster.activeAthletes > 0
    ? Math.round(totalsAcrossRoster.totalAccuracySum / totalsAcrossRoster.activeAthletes)
    : 0;

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = participants;
    if (q) {
      result = participants.filter(
        (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'sessions') return b.totalSessions - a.totalSessions;
      if (sortBy === 'accuracy') return b.averageAccuracy - a.averageAccuracy;
      // Default: recent
      const timeA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
      const timeB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      return timeB - timeA;
    });
  }, [participants, query, sortBy]);

  return (
    <div className="min-h-dvh w-full bg-[var(--color-background)] text-white px-6 md:px-10 py-8 md:py-12 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--glass-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-primary uppercase">
              SCOUT & RECRUITING PORTAL
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome, {user?.name ?? 'Scout Director'}
          </h1>
          <p className="text-muted text-sm mt-1">
            Real-time biomechanical intelligence & verified athlete repetition logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-surface border border-[var(--glass-border)] text-xs font-mono text-muted">
            Scout: <span className="text-white font-semibold">{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-2xl glass-card text-xs font-semibold text-danger hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Roster KPI Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-6 flex flex-col justify-between">
          <span className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">Total Athletes</span>
          <div className="text-3xl sm:text-4xl font-black text-primary mt-2">{participants.length}</div>
          <span className="text-[11px] text-muted mt-1">Registered roster</span>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <span className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">Sessions Logged</span>
          <div className="text-3xl sm:text-4xl font-black text-secondary-color mt-2">{totalsAcrossRoster.sessions}</div>
          <span className="text-[11px] text-muted mt-1">Completed workouts</span>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <span className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">Verified Reps</span>
          <div className="text-3xl sm:text-4xl font-black mt-2" style={{ color: 'var(--color-warning)' }}>
            {totalsAcrossRoster.reps}
          </div>
          <span className="text-[11px] text-muted mt-1">Camera validated</span>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <span className="text-xs font-mono font-semibold text-muted uppercase tracking-wider">Roster Accuracy</span>
          <div className="text-3xl sm:text-4xl font-black text-white mt-2">
            {rosterAverageAccuracy > 0 ? `${rosterAverageAccuracy}%` : '—'}
          </div>
          <span className="text-[11px] text-muted mt-1">Biomechanical benchmark</span>
        </div>
      </div>

      {/* Search & Sort Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search athletes by name or email..."
            className="w-full bg-surface border border-[var(--glass-border)] rounded-2xl px-5 py-3 text-sm outline-none focus:border-[var(--color-primary)] transition-colors text-white placeholder-muted"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white text-xs font-mono"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted uppercase">Sort By:</span>
          {(
            [
              { id: 'recent', label: 'Recent' },
              { id: 'sessions', label: 'Sessions' },
              { id: 'accuracy', label: 'Accuracy' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                sortBy === s.id
                  ? 'bg-[var(--color-primary)] text-black shadow-sm'
                  : 'bg-surface text-muted hover:text-white border border-[var(--glass-border)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Athlete Cards Responsive 2-Column Grid */}
      {loading ? (
        <div className="glass-card text-center py-20 text-muted text-sm">
          <span className="inline-block animate-spin mr-2">⚙️</span>
          Loading roster analytics…
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="glass-card text-center py-20 text-muted text-sm">
          No athletes match your current search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSorted.map((athlete) => (
            <AthleteCard
              key={athlete.email}
              athlete={athlete}
              scoutEmail={user!.email}
              notesBySession={notesBySession}
              onAddNote={(sessionId, note) => addNote(sessionId, user!.email, user!.name, note)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

