import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../auth/AuthContext';
import { getSession } from '../auth/localAuthStore';
import type { RecruitmentStatus } from '../auth/user';

export const AthleteStatusScreen: React.FC = () => {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<RecruitmentStatus>('Pending');
  const [recruitmentDetails, setRecruitmentDetails] = useState<{
    date?: string | null;
    by?: string | null;
    scoutScore?: number;
  }>({});

  // Sync status live from storage
  useEffect(() => {
    const session = getSession();
    if (session) {
      const st = session.recruitmentStatus || 'Pending';
      setCurrentStatus(st);
      setRecruitmentDetails({
        date: session.recruitDate,
        by: session.recruitingScout || session.recruitedBy,
        scoutScore: session.scoutScore || 88,
      });

      // Blast celebratory confetti if RECRUITED!
      if (st === 'Recruited') {
        try {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#10B981', '#D6FF3F', '#00E5FF', '#FF007A', '#FFFFFF'],
          });
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const triggerBlastConfetti = () => {
    confetti({
      particleCount: 180,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#10B981', '#D6FF3F', '#00E5FF', '#FF007A', '#FFFFFF'],
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto pb-10">
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
            Real-time status updates synced with National Scouting Directors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl glass-card text-xs font-mono text-slate-300">
            Athlete ID: <span className="text-primary font-bold">{user?.athleteId ?? 'ATH-1001'}</span>
          </div>
        </div>
      </div>

      {/* Main Status Display Card */}
      <div className="glass-card p-6 sm:p-8 relative overflow-hidden border-2 border-primary/30 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider">
            📊 OFFICIAL RECRUITMENT STATUS
          </span>
          <span className="text-xs font-mono text-muted">
            Last Updated: {recruitmentDetails.date ? new Date(recruitmentDetails.date).toLocaleDateString() : 'Today'}
          </span>
        </div>

        {/* 🟢 RECRUITED (BLAST) */}
        {currentStatus === 'Recruited' && (
          <div className="bg-emerald-500/10 border-2 border-emerald-500 p-6 sm:p-8 rounded-3xl animate-pulse flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-3xl">🟢</span>
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-400">
                  RECRUITED! 🎉
                </h2>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-xl">
                CONGRATULATIONS {user?.name ?? 'Athlete'}! You have been officially recruited by{' '}
                <strong className="text-white">{recruitmentDetails.by ?? 'Coach Priya'}</strong> for the National Talent Roster!
              </p>
              <div className="text-xs font-mono text-emerald-300 pt-1">
                Verified Scout Score: {recruitmentDetails.scoutScore ?? 88}/100 · Priority Draft Status
              </div>
            </div>

            <button
              onClick={triggerBlastConfetti}
              className="px-6 py-3.5 rounded-2xl font-black text-sm text-black bg-emerald-400 hover:bg-emerald-300 transition-transform active:scale-95 shrink-0 shadow-lg"
            >
              🎉 Blast Celebration!
            </button>
          </div>
        )}

        {/* 🟡 TRIAL INVITED */}
        {currentStatus === 'Trial Invited' && (
          <div className="bg-amber-500/10 border-2 border-amber-500 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-3xl">🟡</span>
                <h2 className="text-2xl sm:text-3xl font-black text-amber-400">
                  Trial Invited! 🏆
                </h2>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-xl">
                Great job! Scouts have extended an invitation for an in-person physical trial evaluation. Check your registered contact details ({user?.email}) for venue details.
              </p>
            </div>
            <span className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs font-mono">
              Action Required
            </span>
          </div>
        )}

        {/* 🔵 SHORTLISTED */}
        {currentStatus === 'Shortlisted' && (
          <div className="bg-cyan-500/10 border-2 border-cyan-500 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-3xl">🔵</span>
                <h2 className="text-2xl sm:text-3xl font-black text-cyan-400">
                  omg yayay.... You're Shortlisted! ⭐
                </h2>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-xl">
                Your high form accuracy and rep performance have placed you on the National Scout Shortlist! Keep logging workouts to maintain your rank.
              </p>
            </div>
            <span className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs font-mono">
              Top 5% Roster
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
                  shhh...Under Review 🔍
                </h2>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-xl">
                Scout directors are reviewing your telemetry logs and biomechanical stability charts. Final decision expected shortly.
              </p>
            </div>
            <span className="px-4 py-2 rounded-xl bg-orange-400 text-black font-bold text-xs font-mono">
              Evaluating
            </span>
          </div>
        )}

        {/* 🔴 REJECTED */}
        {currentStatus === 'Rejected' && (
          <div className="bg-rose-500/10 border-2 border-rose-500 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-3xl">🔴</span>
                <h2 className="text-2xl sm:text-3xl font-black text-rose-400">
                  better luck next time 💔
                </h2>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed max-w-xl">
                You were not selected in this recruitment cycle. Keep working on your form accuracy and re-apply in the next seasonal scouting window!
              </p>
            </div>
            <span className="px-4 py-2 rounded-xl bg-rose-400 text-black font-bold text-xs font-mono">
              Train Harder
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
                  Pending..... ⏳
                </h2>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                Complete more workout protocols with ONFORM AI Coach to generate verified sensor telemetry for scouting directors.
              </p>
            </div>
            <span className="px-4 py-2 rounded-xl bg-surface border border-[var(--glass-border)] text-muted font-bold text-xs font-mono">
              Awaiting Workouts
            </span>
          </div>
        )}
      </div>

      {/* Demo Tester Controls for Status Preview */}
      <div className="glass-card p-5 border border-[var(--glass-border)] space-y-3">
        <span className="text-xs font-mono font-bold text-muted uppercase block">
          🧪 DEMO PREVIEW SWITCHER (Test all 6 status states)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {(
            [
              { id: 'Recruited', label: '🟢 Recruited' },
              { id: 'Trial Invited', label: '🟡 Trial Invited' },
              { id: 'Shortlisted', label: '🔵 Shortlisted' },
              { id: 'Under Review', label: '🟠 Under Review' },
              { id: 'Rejected', label: '🔴 Rejected' },
              { id: 'Pending', label: '⚪ Pending' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentStatus(s.id);
                if (s.id === 'Recruited') triggerBlastConfetti();
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                currentStatus === s.id
                  ? 'bg-primary text-black border-primary'
                  : 'bg-surface text-muted hover:text-white border-[var(--glass-border)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
