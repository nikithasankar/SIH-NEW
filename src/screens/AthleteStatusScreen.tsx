import React, { useEffect, useState, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../auth/AuthContext';
import { findUser, getSession, listScoutDecisions } from '../auth/localAuthStore';
import { getSessionsByUser, getNotesForSession } from '../data/sessionRepository';
import type { RecruitmentStatus, ScoutDecision } from '../auth/user';
import type { ScoutNote } from '../models/sessionResult';

export const AthleteStatusScreen: React.FC = () => {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<RecruitmentStatus>('Pending');
  const [recruitmentDetails, setRecruitmentDetails] = useState<{
    date?: string | null;
    by?: string | null;
    scoutScore?: number;
  }>({});
  const [scoutDecisions, setScoutDecisions] = useState<ScoutDecision[]>([]);
  const [athleteNotes, setAthleteNotes] = useState<ScoutNote[]>([]);
  const lastStatusRef = useRef<string>('');

  // Sync athlete status live from storage and user records
  const syncStatus = useCallback(async () => {
    if (!user?.email) return;

    // 1. Get latest user data from storage
    const latestUser = findUser(user.email) || getSession();
    if (latestUser) {
      const st = latestUser.recruitmentStatus || 'Pending';
      setCurrentStatus(st);
      setRecruitmentDetails({
        date: latestUser.recruitDate,
        by: latestUser.recruitedBy || 'Coach Priya',
        scoutScore: latestUser.scoutScore || 88,
      });

      // Load all independent scout decisions
      const decisions = latestUser.scoutDecisions || listScoutDecisions(user.email);
      setScoutDecisions(decisions);

      // Trigger celebratory confetti when transitioning to Recruited
      if (st === 'Recruited' && lastStatusRef.current !== 'Recruited') {
        try {
          confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#10B981', '#D6FF3F', '#00E5FF', '#FF007A', '#FFFFFF'],
          });
        } catch {
          // ignore
        }
      }
      lastStatusRef.current = st;
    }

    // 2. Fetch any coaching notes left on this athlete's workout sessions
    try {
      const sessions = await getSessionsByUser(user.email);
      const allNotes: ScoutNote[] = [];
      for (const s of sessions) {
        if (s.id != null) {
          const notes = await getNotesForSession(s.id);
          allNotes.push(...notes);
        }
      }
      allNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAthleteNotes(allNotes);
    } catch (err) {
      console.error('Failed to sync athlete scout notes', err);
    }
  }, [user?.email]);

  useEffect(() => {
    syncStatus();

    // Listen for cross-tab storage events and local status update events
    const handleStorage = () => syncStatus();
    const handleStatusUpdate = () => syncStatus();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('athlete_status_updated', handleStatusUpdate);

    // 1.5s interval to ensure instant live synchronization across tabs
    const interval = setInterval(syncStatus, 1500);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('athlete_status_updated', handleStatusUpdate);
      clearInterval(interval);
    };
  }, [syncStatus]);

  const triggerBlastConfetti = () => {
    confetti({
      particleCount: 180,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#10B981', '#D6FF3F', '#00E5FF', '#FF007A', '#FFFFFF'],
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--glass-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
              ATHLETE RECRUITMENT STATUS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Scouting & Recruitment Portal
          </h1>
          <p className="text-muted text-sm mt-0.5">
            Real-time status updates synced live with National Scouting Directors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl glass-card text-xs font-mono text-slate-300">
            Athlete ID: <span className="text-primary font-bold">{user?.athleteId ?? 'ATH-1001'}</span>
          </div>
        </div>
      </div>

      {/* Main Status Display Card */}
      <div className="glass-card p-6 sm:p-8 relative overflow-hidden border-2 border-primary/30 flex flex-col gap-6 bg-[#111116]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider">
            📊 OFFICIAL RECRUITMENT STATUS
          </span>
          <span className="text-xs font-mono text-muted">
            Last Updated: {recruitmentDetails.date ? new Date(recruitmentDetails.date).toLocaleDateString() : 'Active'}
          </span>
        </div>

        {/* 🟢 RECRUITED */}
        {currentStatus === 'Recruited' && (
          <div className="bg-emerald-500/10 border-2 border-emerald-500 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-3xl">🟢</span>
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-400">
                  OFFICIALLY RECRUITED! 🎉
                </h2>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-xl">
                Congratulations <strong className="text-white">{user?.name ?? 'Athlete'}</strong>! You have been officially signed to the National Talent Roster by{' '}
                <strong className="text-white">{recruitmentDetails.by ?? 'Coach Priya'}</strong>.
              </p>
              <div className="text-xs font-mono text-emerald-300 pt-1">
                Scout Rating: {recruitmentDetails.scoutScore ?? 88}/100 · Signed Date: {recruitmentDetails.date ?? 'Recent'}
              </div>
            </div>

            <button
              onClick={triggerBlastConfetti}
              className="px-6 py-3.5 rounded-2xl font-black text-sm text-black bg-emerald-400 hover:bg-emerald-300 transition-transform active:scale-95 shrink-0 shadow-lg"
            >
              🎉 Celebrate!
            </button>
          </div>
        )}

        {/* 🔵 SHORTLISTED */}
        {currentStatus === 'Shortlisted' && (
          <div className="bg-cyan-500/10 border-2 border-cyan-500 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-3xl">⭐</span>
                <h2 className="text-2xl sm:text-3xl font-black text-cyan-400">
                  Priority Shortlist Candidate
                </h2>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-xl">
                Your verified movement quality and biomechanical consistency have placed you on the National Scouting Shortlist. Maintain your regular training volume to stay at the top of the board.
              </p>
              <div className="text-xs font-mono text-cyan-300 pt-1">
                Scout Rating: {recruitmentDetails.scoutScore ?? 88}/100 · Top Tier Prospect
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs font-mono shrink-0">
              Shortlisted ⭐
            </span>
          </div>
        )}

        {/* 🟡 TRIAL INVITED */}
        {currentStatus === 'Trial Invited' && (
          <div className="bg-amber-500/10 border-2 border-amber-500 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-3xl">🟡</span>
                <h2 className="text-2xl sm:text-3xl font-black text-amber-400">
                  Physical Trial Invitation Issued
                </h2>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-xl">
                Scouts have extended an invitation for an on-site physical evaluation trial. Details have been registered to your contact profile (<strong className="text-white">{user?.email}</strong>).
              </p>
              <div className="text-xs font-mono text-amber-300 pt-1">
                Status: Trial Candidate · Action Required
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs font-mono shrink-0">
              Trial Invited 📋
            </span>
          </div>
        )}

        {/* 🟠 UNDER REVIEW */}
        {currentStatus === 'Under Review' && (
          <div className="bg-orange-500/10 border-2 border-orange-500 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-3xl">🟠</span>
                <h2 className="text-2xl sm:text-3xl font-black text-orange-400">
                  Profile Under Active Review
                </h2>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-xl">
                Scouting directors are actively reviewing your telemetry logs, kinetic chain balance, and form accuracy curves. An updated decision will be posted shortly.
              </p>
              <div className="text-xs font-mono text-orange-300 pt-1">
                Status: In Review by Coaching Panel
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-orange-400 text-black font-bold text-xs font-mono shrink-0">
              Under Review 🔍
            </span>
          </div>
        )}

        {/* 🟡 WATCHLIST */}
        {currentStatus === 'Watchlist' && (
          <div className="bg-amber-500/10 border-2 border-amber-500 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-3xl">🟡</span>
                <h2 className="text-2xl sm:text-3xl font-black text-amber-400">
                  On Scout Watchlist & Talent Radar
                </h2>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-xl">
                You are currently placed on the <strong className="text-white">Active Scout Watchlist</strong>. Other scouting directors are reviewing your telemetry logs and biomechanical consistency to provide recruitment assistance.
              </p>
              <div className="text-xs font-mono text-amber-300 pt-1">
                Status: Candidate Watchlist · Multiple Scouts Evaluating
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs font-mono shrink-0">
              Watchlist Candidate 🟡
            </span>
          </div>
        )}

        {/* 🔴 REJECTED (Only when ALL scouts reject) */}
        {currentStatus === 'Rejected' && (
          <div className="bg-rose-500/10 border-2 border-rose-500 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-3xl">🔴</span>
                <h2 className="text-2xl sm:text-3xl font-black text-rose-400">
                  Assessment Cycle Concluded
                </h2>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-xl">
                All evaluating scouting directors have concluded their review for this cycle. Continue training with ONFORM AI Coach to improve your form accuracy and re-apply in the next scouting window.
              </p>
              <div className="text-xs font-mono text-rose-300 pt-1">
                Status: Archived by All Reviewing Scouts
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-rose-400 text-black font-bold text-xs font-mono shrink-0">
              Archived
            </span>
          </div>
        )}

        {/* ⚪ PENDING */}
        {currentStatus === 'Pending' && (
          <div className="bg-surface border-2 border-[var(--glass-border)] p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-3xl">⚪</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-300">
                  Awaiting Assessment Telemetry
                </h2>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                Log full exercise assessments with ONFORM AI to generate verified kinematic data for scout evaluation.
              </p>
              <div className="text-xs font-mono text-slate-500 pt-1">
                Status: Candidate Pool Active
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-surface border border-[var(--glass-border)] text-muted font-bold text-xs font-mono shrink-0">
              Pending Telemetry
            </span>
          </div>
        )}
      </div>

      {/* Multi-Scout Decision Breakdown Panel */}
      <div className="glass-card p-6 border border-primary/30 rounded-2xl bg-[#10131b]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <div>
              <h3 className="font-extrabold text-base text-white">Scout Review & Decision Breakdown</h3>
              <p className="text-xs text-muted">Independent evaluations recorded by scouting directors</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20">
            {scoutDecisions.length} {scoutDecisions.length === 1 ? 'Scout Review' : 'Scout Reviews'}
          </span>
        </div>

        {scoutDecisions.length === 0 ? (
          <div className="bg-surface/50 p-4 rounded-xl border border-[var(--glass-border)] text-center">
            <p className="text-xs text-slate-300">
              No individual scout decisions recorded yet.
            </p>
            <p className="text-[11px] text-muted mt-1">
              As national scouts review your profile, their individual evaluations and recruitment decisions will be listed here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {scoutDecisions.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--glass-border)] hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-surface border border-[var(--glass-border)] flex items-center justify-center text-xs font-bold text-primary">
                    {d.scoutName[0] ?? 'S'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{d.scoutName}</span>
                    <span className="text-[10px] font-mono text-muted">{d.scoutEmail}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-mono px-3 py-1 rounded-full border font-bold ${
                      d.decision === 'Recruited'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : d.decision === 'Shortlisted'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : d.decision === 'Trial Invited'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : d.decision === 'Under Review'
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                        : d.decision === 'Rejected'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-surface text-muted border-[var(--glass-border)]'
                    }`}
                  >
                    {d.decision === 'Recruited' ? '✅ Recruited' : d.decision === 'Shortlisted' ? '⭐ Shortlisted' : d.decision === 'Rejected' ? '❌ Rejected' : d.decision}
                  </span>
                  <span className="text-[10px] font-mono text-muted hidden sm:inline-block">
                    {new Date(d.decidedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scout Coaching Messages & Communication Feed */}
      <div className="glass-card p-6 border border-cyan-500/30 rounded-2xl bg-[#10141d]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <div>
              <h3 className="font-extrabold text-base text-white">Scout Coaching & Evaluation Feed</h3>
              <p className="text-xs text-muted">Direct feedback and recommendations from scouting directors</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {athleteNotes.length} {athleteNotes.length === 1 ? 'Message' : 'Messages'}
          </span>
        </div>

        {athleteNotes.length === 0 ? (
          <div className="bg-surface/50 p-4 rounded-xl border border-[var(--glass-border)] text-center">
            <p className="text-xs text-slate-300">
              No scout coaching messages recorded yet.
            </p>
            <p className="text-[11px] text-muted mt-1">
              When scouts review your workouts or adjust recruitment status, their coaching logs and notes will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {athleteNotes.map((n, i) => (
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
    </div>
  );
};
