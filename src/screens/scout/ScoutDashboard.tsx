import { useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useScoutData, type ParticipantSummary } from '../../hooks/useScoutData';
import { getExerciseById } from '../../data/exerciseCatalog';
import type { SessionResult } from '../../models/sessionResult';
import { updateAthleteStatus } from '../../auth/localAuthStore';
import type { RecruitmentStatus } from '../../auth/user';
import { ScoutFilters, type FilterState } from '../../components/scout/ScoutFilters';
import { AthletePerformanceModal } from '../../components/scout/AthletePerformanceModal';

type ScoutTab = 'roster' | 'recruited' | 'shortlisted' | 'watchlist' | 'rejected';

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
        <li
          key={i}
          className="text-xs text-secondary-color flex items-center gap-2 bg-secondary/5 px-3 py-1.5 rounded-lg border border-secondary/10"
        >
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
                  <div
                    key={i}
                    className="glass-card p-3 rounded-xl bg-[var(--color-background)] border border-[var(--glass-border)]"
                  >
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
  scoutName,
  notesBySession,
  onAddNote,
  onOpenPerformanceModal,
  onStatusChange,
}: {
  athlete: ParticipantSummary;
  scoutEmail: string;
  scoutName: string;
  notesBySession: Record<number, { note: string; createdAt: string; scoutName: string }[]>;
  onAddNote: (sessionId: number, note: string) => void;
  onOpenPerformanceModal: (athlete: ParticipantSummary) => void;
  onStatusChange: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleSessions = expanded ? athlete.sessions : athlete.sessions.slice(0, 2);

  const status = athlete.recruitmentStatus ?? 'Pending';
  const statusColor =
    status === 'Recruited'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      : status === 'Trial Invited'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      : status === 'Shortlisted'
      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
      : status === 'Under Review'
      ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
      : status === 'Rejected'
      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      : 'bg-surface text-muted border-[var(--glass-border)]';

  const handleRecruitAction = (newStatus: RecruitmentStatus) => {
    updateAthleteStatus(athlete.email, newStatus, scoutName, scoutEmail);
    onStatusChange();
  };

  // This scout's personal decision for this athlete
  const myDecision = athlete.myDecision;
  const myDecisionLabel = myDecision?.decision ?? 'Not Reviewed';

  // All scout decisions for multi-scout display
  const allDecisions = athlete.scoutDecisions ?? [];

  return (
    <div className="glass-card p-6 flex flex-col justify-between hover:border-[var(--color-primary)]/40 transition-all duration-200">
      <div>
        {/* Athlete Header */}
        <div className="flex items-start justify-between mb-4">
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
              <div className="flex items-center gap-2">
                <p className="font-bold text-base text-white">{athlete.name}</p>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-[var(--glass-border)] text-muted">
                  {athlete.athleteId ?? 'ATH-1001'}
                </span>
              </div>
              <p className="text-muted text-xs font-mono">{athlete.email}</p>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                {athlete.sport ?? 'Football'} · {athlete.position ?? 'Athlete'} · {athlete.state ?? 'State Level'}
              </p>
            </div>
          </div>

          <span className={`text-[11px] font-mono px-3 py-1 rounded-full border font-bold ${statusColor}`}>
            {status}
          </span>
        </div>

        {/* Per-scout decision indicator */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="text-[10px] font-mono text-muted">Your Decision:</span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
            myDecisionLabel === 'Recruited' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : myDecisionLabel === 'Shortlisted' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
            : myDecisionLabel === 'Trial Invited' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            : myDecisionLabel === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            : 'bg-surface text-muted border-[var(--glass-border)]'
          }`}>
            {myDecisionLabel === 'Not Reviewed' ? '⏳ Not Reviewed' : myDecisionLabel}
          </span>
          {allDecisions.length > 0 && (
            <span className="text-[10px] font-mono text-muted">
              · {allDecisions.length} scout{allDecisions.length !== 1 ? 's' : ''} reviewed
            </span>
          )}
        </div>

        {/* Athlete Stats & Performance Modal Trigger */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <div className="bg-surface rounded-xl p-2.5 text-center border border-[var(--glass-border)]">
            <div className="text-base font-black text-primary">{athlete.scoutScore ?? 88}</div>
            <div className="text-[9px] text-muted uppercase font-mono">Scout Score</div>
          </div>
          <div className="bg-surface rounded-xl p-2.5 text-center border border-[var(--glass-border)]">
            <div className="text-base font-black text-secondary-color">{athlete.totalSessions}</div>
            <div className="text-[9px] text-muted uppercase font-mono">Sessions</div>
          </div>
          <div className="bg-surface rounded-xl p-2.5 text-center border border-[var(--glass-border)]">
            <div className="text-base font-black text-white">
              {athlete.totalSessions > 0 ? `${athlete.averageAccuracy}%` : '—'}
            </div>
            <div className="text-[9px] text-muted uppercase font-mono">Avg Accuracy</div>
          </div>
          <button
            onClick={() => onOpenPerformanceModal(athlete)}
            className="bg-primary/10 hover:bg-primary/20 rounded-xl p-2.5 text-center border border-primary/30 transition-colors flex flex-col items-center justify-center"
          >
            <span className="text-xs">📊</span>
            <span className="text-[9px] font-bold text-primary uppercase font-mono">Analytics</span>
          </button>
        </div>

        {/* Sessions List */}
        {athlete.sessions.length === 0 ? (
          <div className="text-center py-4 text-muted text-xs bg-surface rounded-xl border border-[var(--glass-border)]">
            No training sessions recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                Recent Sessions ({athlete.sessions.length})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted">{relativeTime(athlete.lastActive)}</span>
                {athlete.sessions.length > 2 && (
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="text-[10px] text-primary hover:underline font-mono"
                  >
                    {expanded ? 'Show Less' : `+${athlete.sessions.length - 2} more`}
                  </button>
                )}
              </div>
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

      {/* Scout Status Actions (Recruit, Shortlist, Watchlist, Reject) */}
      <div className="mt-5 pt-4 border-t border-[var(--glass-border)] space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase text-muted tracking-wider block">
          📌 Scout Decision Control
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleRecruitAction('Recruited')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
              myDecisionLabel === 'Recruited'
                ? 'bg-emerald-500 text-black border-emerald-500 shadow-sm'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}
          >
            ✅ Recruit
          </button>

          <button
            onClick={() => handleRecruitAction('Shortlisted')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
              myDecisionLabel === 'Shortlisted'
                ? 'bg-cyan-500 text-black border-cyan-500 shadow-sm'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
            }`}
          >
            ⭐ Shortlist
          </button>

          <button
            onClick={() => handleRecruitAction('Trial Invited')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
              myDecisionLabel === 'Trial Invited'
                ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}
          >
            👀 Watchlist
          </button>

          <button
            onClick={() => handleRecruitAction('Rejected')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
              myDecisionLabel === 'Rejected'
                ? 'bg-rose-500 text-black border-rose-500 shadow-sm'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}
          >
            ❌ Reject
          </button>
        </div>

        {/* Other scouts' decisions */}
        {allDecisions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--glass-border)]">
            <span className="text-[10px] font-mono font-bold uppercase text-muted tracking-wider block mb-2">
              🧭 All Scout Decisions
            </span>
            <div className="flex flex-wrap gap-2">
              {allDecisions.map((d) => (
                <div
                  key={d.scoutEmail}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                    d.decision === 'Recruited' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : d.decision === 'Shortlisted' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    : d.decision === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-surface text-muted border-[var(--glass-border)]'
                  }`}
                >
                  <span className="font-bold">{d.scoutName}</span>
                  <span>→</span>
                  <span>{d.decision}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ScoutDashboard() {
  const { user, logout } = useAuth();
  const { participants, notesBySession, loading, addNote, refresh } = useScoutData(user?.email);
  const [activeTab, setActiveTab] = useState<ScoutTab>('roster');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedAthleteForModal, setSelectedAthleteForModal] = useState<ParticipantSummary | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    minScoutScore: null,
    gender: '',
    minAge: null,
    maxAge: null,
    sport: '',
    position: '',
    experienceLevel: '',
    dominantHand: '',
    dominantLeg: '',
    state: '',
    district: '',
    school: '',
    minFormAccuracy: null,
    minConsistency: null,
    minStrength: null,
    minSpeed: null,
  });

  const [sortBy, setSortBy] = useState<'recent' | 'sessions' | 'accuracy' | 'score'>('recent');

  // Metrics summary: Active Roster is global unrecruited/unrejected pool; other metrics are scoped to THIS scout
  const recruitmentMetrics = useMemo(() => {
    let activeRosterCount = 0;
    let myShortlisted = 0;
    let myRecruited = 0;
    let myWatchlist = 0;
    let myRejected = 0;

    participants.forEach((p) => {
      const hasRecruitedByAny = p.scoutDecisions?.some((d) => d.decision === 'Recruited') ?? false;
      const hasRejectedByAny = p.scoutDecisions?.some((d) => d.decision === 'Rejected') ?? false;

      // Active Roster: NOT marked as Recruited or Rejected by ANY scout
      if (!hasRecruitedByAny && !hasRejectedByAny) {
        activeRosterCount++;
      }

      // Personal scoped metrics for logged-in scout
      const myDec = p.myDecision?.decision;
      if (myDec === 'Recruited') {
        myRecruited++;
      } else if (myDec === 'Shortlisted') {
        myShortlisted++;
      } else if (myDec === 'Watchlist' || myDec === 'Trial Invited' || myDec === 'Under Review') {
        myWatchlist++;
      } else if (myDec === 'Rejected') {
        myRejected++;
      }
    });

    return {
      activeRoster: activeRosterCount,
      recruited: myRecruited,
      shortlisted: myShortlisted,
      watchlist: myWatchlist,
      rejected: myRejected,
    };
  }, [participants]);

  // Tab Filtering:
  // 1. 'roster' (Global Pool) => athletes NOT recruited or rejected by ANY scout
  // 2. 'recruited', 'shortlisted', 'watchlist', 'rejected' => ONLY athletes personally assigned by logged-in scout
  const athletesInCurrentTab = useMemo(() => {
    return participants.filter((p) => {
      const hasRecruitedByAny = p.scoutDecisions?.some((d) => d.decision === 'Recruited') ?? false;
      const hasRejectedByAny = p.scoutDecisions?.some((d) => d.decision === 'Rejected') ?? false;
      const myDec = p.myDecision?.decision;

      if (activeTab === 'roster') {
        // Global Pool: show all athletes not recruited or rejected by any scout
        return !hasRecruitedByAny && !hasRejectedByAny;
      }
      if (activeTab === 'recruited') {
        // Strictly scoped to current scout
        return myDec === 'Recruited';
      }
      if (activeTab === 'shortlisted') {
        // Strictly scoped to current scout
        return myDec === 'Shortlisted';
      }
      if (activeTab === 'watchlist') {
        // Strictly scoped to current scout
        return myDec === 'Watchlist' || myDec === 'Trial Invited' || myDec === 'Under Review';
      }
      if (activeTab === 'rejected') {
        // Strictly scoped to current scout
        return myDec === 'Rejected';
      }
      return true;
    });
  }, [participants, activeTab]);

  // Search, Filter & Sort on current tab's athletes
  const filteredAndSorted = useMemo(() => {
    let result = athletesInCurrentTab;

    const q = filters.searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.athleteId && p.athleteId.toLowerCase().includes(q)) ||
          (p.sport && p.sport.toLowerCase().includes(q)) ||
          (p.position && p.position.toLowerCase().includes(q))
      );
    }

    if (filters.minScoutScore !== null) {
      result = result.filter((p) => (p.scoutScore ?? 80) >= filters.minScoutScore!);
    }

    if (filters.gender) {
      result = result.filter((p) => p.gender === filters.gender);
    }

    if (filters.sport) {
      result = result.filter((p) => p.sport === filters.sport);
    }

    if (filters.experienceLevel) {
      result = result.filter((p) => p.experienceLevel === filters.experienceLevel);
    }

    if (filters.state) {
      result = result.filter((p) => p.state && p.state.toLowerCase().includes(filters.state.toLowerCase()));
    }

    if (filters.district) {
      result = result.filter(
        (p) =>
          (p.district && p.district.toLowerCase().includes(filters.district.toLowerCase())) ||
          (p.academy && p.academy.toLowerCase().includes(filters.district.toLowerCase()))
      );
    }

    if (filters.minFormAccuracy !== null) {
      result = result.filter((p) => (p.formAccuracy ?? p.averageAccuracy ?? 0) >= filters.minFormAccuracy!);
    }

    if (filters.minConsistency !== null) {
      result = result.filter((p) => (p.consistencyScore ?? 0) >= filters.minConsistency!);
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'sessions') return b.totalSessions - a.totalSessions;
      if (sortBy === 'accuracy') return b.averageAccuracy - a.averageAccuracy;
      if (sortBy === 'score') return (b.scoutScore ?? 80) - (a.scoutScore ?? 80);
      const timeA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
      const timeB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      return timeB - timeA;
    });
  }, [athletesInCurrentTab, filters, sortBy]);

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      minScoutScore: null,
      gender: '',
      minAge: null,
      maxAge: null,
      sport: '',
      position: '',
      experienceLevel: '',
      dominantHand: '',
      dominantLeg: '',
      state: '',
      district: '',
      school: '',
      minFormAccuracy: null,
      minConsistency: null,
      minStrength: null,
      minSpeed: null,
    });
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'roster':
        return '🏃 Active Candidate Pool';
      case 'recruited':
        return '🟢 Official Recruited Athletes';
      case 'shortlisted':
        return '⭐ Priority Shortlisted Prospects';
      case 'watchlist':
        return '🟡 Watchlist & Trial Candidates';
      case 'rejected':
        return '🔴 Rejected / Archived Profiles';
    }
  };

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
            Welcome, {user?.name ?? 'Coach Priya'}
          </h1>
          <p className="text-muted text-sm mt-1">
            Real-time biomechanical intelligence, categorized talent management & recruitment actions.
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

      {/* KPI Cards: Clickable quick-jump summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold text-muted uppercase tracking-wider">
            📈 Recruitment Pipeline Overview
          </h3>
          <span className="text-xs text-primary font-mono font-bold">Real-Time Sync</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div
            onClick={() => setActiveTab('roster')}
            className={`glass-card p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] ${
              activeTab === 'roster' ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]' : ''
            }`}
          >
            <span className="text-[10px] font-mono font-semibold text-muted uppercase">Active Roster</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {recruitmentMetrics.activeRoster}
            </div>
            <span className="text-[10px] text-muted mt-1">Candidate Pool</span>
          </div>

          <div
            onClick={() => setActiveTab('recruited')}
            className={`glass-card p-4 flex flex-col justify-between border-emerald-500/30 cursor-pointer transition-all hover:scale-[1.02] ${
              activeTab === 'recruited' ? 'border-emerald-400 ring-1 ring-emerald-400' : ''
            }`}
          >
            <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase">Recruited 🟢</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{recruitmentMetrics.recruited}</div>
            <span className="text-[10px] text-muted mt-1">Signed Talent</span>
          </div>

          <div
            onClick={() => setActiveTab('shortlisted')}
            className={`glass-card p-4 flex flex-col justify-between border-cyan-500/30 cursor-pointer transition-all hover:scale-[1.02] ${
              activeTab === 'shortlisted' ? 'border-cyan-400 ring-1 ring-cyan-400' : ''
            }`}
          >
            <span className="text-[10px] font-mono font-semibold text-cyan-400 uppercase">Shortlisted ⭐</span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">{recruitmentMetrics.shortlisted}</div>
            <span className="text-[10px] text-muted mt-1">Top Prospects</span>
          </div>

          <div
            onClick={() => setActiveTab('watchlist')}
            className={`glass-card p-4 flex flex-col justify-between border-amber-500/30 cursor-pointer transition-all hover:scale-[1.02] ${
              activeTab === 'watchlist' ? 'border-amber-400 ring-1 ring-amber-400' : ''
            }`}
          >
            <span className="text-[10px] font-mono font-semibold text-amber-400 uppercase">Watchlist / Trials 🟡</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
              {recruitmentMetrics.watchlist}
            </div>
            <span className="text-[10px] text-muted mt-1">Under Evaluation</span>
          </div>

          <div
            onClick={() => setActiveTab('rejected')}
            className={`glass-card p-4 flex flex-col justify-between border-rose-500/30 cursor-pointer transition-all hover:scale-[1.02] ${
              activeTab === 'rejected' ? 'border-rose-400 ring-1 ring-rose-400' : ''
            }`}
          >
            <span className="text-[10px] font-mono font-semibold text-rose-400 uppercase">Rejected 🔴</span>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">{recruitmentMetrics.rejected}</div>
            <span className="text-[10px] text-muted mt-1">Archived Profiles</span>
          </div>
        </div>
      </div>

      {/* Categorized Tab Bar (Active Roster, Recruited, Shortlisted, Watchlist, Rejected) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--glass-border)] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'roster'
                ? 'bg-primary text-black shadow-sm'
                : 'glass-card text-muted hover:text-white'
            }`}
          >
            🏃 Active Roster ({recruitmentMetrics.activeRoster})
          </button>

          <button
            onClick={() => setActiveTab('recruited')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'recruited'
                ? 'bg-emerald-500 text-black shadow-sm font-black'
                : 'glass-card text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            🟢 Recruited ({recruitmentMetrics.recruited})
          </button>

          <button
            onClick={() => setActiveTab('shortlisted')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'shortlisted'
                ? 'bg-cyan-500 text-black shadow-sm font-black'
                : 'glass-card text-cyan-400 hover:bg-cyan-500/10'
            }`}
          >
            ⭐ Shortlisted ({recruitmentMetrics.shortlisted})
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'watchlist'
                ? 'bg-amber-500 text-black shadow-sm font-black'
                : 'glass-card text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            🟡 Watchlist ({recruitmentMetrics.watchlist})
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'rejected'
                ? 'bg-rose-500 text-black shadow-sm font-black'
                : 'glass-card text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            🔴 Rejected ({recruitmentMetrics.rejected})
          </button>
        </div>

        {/* View Mode & Sorting Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* View Toggle (Cards vs Table) */}
          <div className="flex items-center bg-surface p-1 rounded-xl border border-[var(--glass-border)]">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'cards' ? 'bg-white text-black' : 'text-muted hover:text-white'
              }`}
            >
              Cards 📇
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                viewMode === 'table' ? 'bg-white text-black' : 'text-muted hover:text-white'
              }`}
            >
              Table 📋
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-muted uppercase">Sort:</span>
            {(
              [
                { id: 'recent', label: 'Recent' },
                { id: 'score', label: 'Score' },
                { id: 'accuracy', label: 'Accuracy' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  sortBy === s.id
                    ? 'bg-primary text-black font-bold'
                    : 'bg-surface text-muted hover:text-white border border-[var(--glass-border)]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Category Filters */}
      <ScoutFilters filters={filters} onChange={setFilters} onReset={resetFilters} />

      {/* Content Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>{getTabTitle()}</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-[var(--glass-border)] text-muted">
            {filteredAndSorted.length} Athletes
          </span>
        </h3>
      </div>

      {/* Loading & Empty States */}
      {loading ? (
        <div className="glass-card text-center py-20 text-muted text-sm">
          <span className="inline-block animate-spin mr-2">⚙️</span>
          Loading scouting telemetry…
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="glass-card text-center py-20 text-muted text-sm space-y-2">
          <p className="text-base font-bold text-white">No athletes in this category match your criteria.</p>
          <p className="text-xs text-muted">
            Try adjusting search terms or status filters.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARD VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSorted.map((athlete) => (
            <AthleteCard
              key={athlete.email}
              athlete={athlete}
              scoutEmail={user!.email}
              scoutName={user?.name ?? 'Coach Priya'}
              notesBySession={notesBySession}
              onAddNote={(sessionId, note) => addNote(sessionId, user!.email, user!.name, note)}
              onOpenPerformanceModal={setSelectedAthleteForModal}
              onStatusChange={refresh}
            />
          ))}
        </div>
      ) : (
        /* SPREADSHEET TABLE VIEW */
        <div className="glass-card p-6 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[var(--glass-border)] text-muted uppercase">
                <th className="py-3 px-3">Athlete Name</th>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Sport</th>
                <th className="py-3 px-3">Position</th>
                <th className="py-3 px-3">Scout Score</th>
                <th className="py-3 px-3">Sessions</th>
                <th className="py-3 px-3">Avg Accuracy</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {filteredAndSorted.map((a) => (
                <tr key={a.email} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-white font-sans flex items-center gap-2">
                    <span>{a.name}</span>
                    <button
                      onClick={() => setSelectedAthleteForModal(a)}
                      className="text-primary hover:underline text-[10px]"
                    >
                      📊
                    </button>
                  </td>
                  <td className="py-3.5 px-3 text-muted">{a.athleteId ?? 'ATH-1001'}</td>
                  <td className="py-3.5 px-3 text-primary">{a.sport ?? 'Football'}</td>
                  <td className="py-3.5 px-3 text-slate-300">{a.position ?? 'Midfielder'}</td>
                  <td className="py-3.5 px-3 font-bold text-amber-400">{a.scoutScore ?? 88}</td>
                  <td className="py-3.5 px-3 text-white">{a.totalSessions}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-400">{a.averageAccuracy}%</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        a.recruitmentStatus === 'Recruited'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : a.recruitmentStatus === 'Shortlisted'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : a.recruitmentStatus === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : a.recruitmentStatus === 'Trial Invited' || a.recruitmentStatus === 'Watchlist'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-surface text-muted border border-[var(--glass-border)]'
                      }`}
                    >
                      {a.recruitmentStatus ?? 'Pending'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          updateAthleteStatus(a.email, 'Recruited', user?.name ?? 'Coach Priya', user?.email ?? 'scout@onform.app');
                          refresh();
                        }}
                        title="Recruit"
                        className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-bold"
                      >
                        Recruit
                      </button>
                      <button
                        onClick={() => {
                          updateAthleteStatus(a.email, 'Shortlisted', user?.name ?? 'Coach Priya', user?.email ?? 'scout@onform.app');
                          refresh();
                        }}
                        title="Shortlist"
                        className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-[10px] font-bold"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => {
                          updateAthleteStatus(a.email, 'Rejected', user?.name ?? 'Coach Priya', user?.email ?? 'scout@onform.app');
                          refresh();
                        }}
                        title="Reject"
                        className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-[10px] font-bold"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Radar Chart & Performance Detail Modal */}
      {selectedAthleteForModal && (
        <AthletePerformanceModal
          athlete={selectedAthleteForModal}
          onClose={() => setSelectedAthleteForModal(null)}
        />
      )}
    </div>
  );
}
