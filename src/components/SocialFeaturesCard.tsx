import React, { useState } from 'react';
import type { SessionResult } from '../models/sessionResult';

interface Props {
  session: SessionResult;
  exerciseName: string;
  athleteName?: string;
}

export const SocialFeaturesCard: React.FC<Props> = ({ session, exerciseName, athleteName = 'Arjun Mehta' }) => {
  const [copied, setCopied] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Generate funny AI nickname based on exercise and performance
  const getFunnyNickname = () => {
    const reps = session.validReps;
    const acc = session.accuracy;

    if (exerciseName.toLowerCase().includes('pushup') || exerciseName.toLowerCase().includes('press')) {
      if (acc > 90) return 'Iron Arms 🦾';
      if (reps > 15) return 'Chest Pumper 💥';
      return 'Turbo Triceps ⚡';
    }
    if (exerciseName.toLowerCase().includes('squat') || exerciseName.toLowerCase().includes('lunge')) {
      if (reps > 15) return 'Rocket Legs 🚀';
      if (acc > 85) return 'Quads of Steel 🦵';
      return 'Thunder Thighs ⚡';
    }
    if (exerciseName.toLowerCase().includes('plank') || exerciseName.toLowerCase().includes('situp')) {
      return 'Washboard Warrior 🧱';
    }
    return 'Hyper Kinetic ⚡';
  };

  const nickname = getFunnyNickname();

  const handleShare = () => {
    const shareText = `🔥 I just completed ${session.validReps} reps of ${exerciseName} with ${session.accuracy}% accuracy on ONFORM AI! My AI Nickname: "${nickname}". Challenge me!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 my-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
          <span>😂</span> Social & Gamification Features
        </h3>
        <span className="text-xs text-muted font-mono">Connect & Compete</span>
      </div>

      {/* Grid of Social Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Badge & Funny AI Nickname */}
        <div className="glass-card p-5 border border-amber-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">UNLOCKED BADGE</span>
            <span className="text-2xl">🥇</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">👑</span>
              <h4 className="text-lg font-black text-white">"King of {exerciseName}"</h4>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Achieved top tier accuracy in your local district training group.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--glass-border)] flex items-center justify-between">
            <span className="text-xs text-muted font-mono">Funny AI Nickname:</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              "{nickname}"
            </span>
          </div>
        </div>

        {/* 2. Athlete of the Week */}
        <div className="glass-card p-5 border border-[var(--color-primary)]/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">COMMUNITY RANK</span>
            <span className="text-2xl">👑</span>
          </div>

          <div>
            <h4 className="text-lg font-black text-white">Athlete of the Week</h4>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Nominated for highest form consistency rating ({session.accuracy}%) in National Scout Leaderboard.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--glass-border)] flex items-center justify-between text-xs">
            <span className="text-muted font-mono">Weekly Position:</span>
            <span className="font-bold text-primary font-mono">#1 In District</span>
          </div>
        </div>

        {/* 3. Challenge & Share Controls */}
        <div className="glass-card p-5 flex flex-col justify-between border border-[var(--glass-border)]">
          <div>
            <h4 className="text-lg font-black text-white">Challenge & Share</h4>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Send your session score to teammates or challenge your rival to match your form accuracy.
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <button
              onClick={() => setShowChallengeModal(true)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-surface hover:bg-surface-hover text-white border border-[var(--glass-border)] flex items-center justify-center gap-2 transition-colors"
            >
              <span>🤝</span> Challenge a Friend
            </button>

            <button
              onClick={handleShare}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-black flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
              style={{ background: 'var(--color-primary)' }}
            >
              <span>📤</span> {copied ? 'Copied Card Link! ✓' : 'Share Digital Athlete Card'}
            </button>

            <button
              onClick={() => setShowCompareModal(true)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-secondary-color hover:text-white transition-colors text-center"
            >
              📈 Compare with Friends →
            </button>
          </div>
        </div>
      </div>

      {/* Challenge Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card max-w-md w-full p-6 space-y-4 border border-[var(--color-primary)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🤝</span> Challenge a Friend
              </h3>
              <button onClick={() => setShowChallengeModal(false)} className="text-muted hover:text-white">✕</button>
            </div>
            <p className="text-xs text-muted">
              Generate a custom workout challenge link with your score of <strong className="text-white">{session.validReps} reps ({session.accuracy}% form accuracy)</strong>.
            </p>
            <div className="bg-surface p-3 rounded-xl border border-[var(--glass-border)] font-mono text-xs text-primary text-center break-all">
              https://onform.app/challenge?from={encodeURIComponent(athleteName)}&exercise={session.exerciseId}&target={session.validReps}
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(`https://onform.app/challenge?from=${encodeURIComponent(athleteName)}&exercise=${session.exerciseId}&target=${session.validReps}`);
                setShowChallengeModal(false);
              }}
              className="w-full py-3 rounded-xl text-xs font-bold text-black"
              style={{ background: 'var(--color-primary)' }}
            >
              Copy Challenge Link 🔗
            </button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card max-w-lg w-full p-6 space-y-4 border border-[var(--glass-border)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📈</span> Compare with Friends
              </h3>
              <button onClick={() => setShowCompareModal(false)} className="text-muted hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-surface p-4 rounded-xl border border-primary/40">
                <span className="text-xs text-primary font-mono font-bold uppercase block">YOU ({athleteName.split(' ')[0]})</span>
                <div className="text-2xl font-black text-white mt-1">{session.validReps} Reps</div>
                <span className="text-xs text-muted block mt-1">{session.accuracy}% Accuracy</span>
              </div>

              <div className="bg-surface p-4 rounded-xl border border-[var(--glass-border)]">
                <span className="text-xs text-secondary-color font-mono font-bold uppercase block">FRIEND (Priya S.)</span>
                <div className="text-2xl font-black text-white mt-1">{Math.max(1, session.validReps - 2)} Reps</div>
                <span className="text-xs text-muted block mt-1">94% Accuracy</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center text-xs text-primary font-medium">
              ⚡ You are currently leading by +2 reps! Keep pushin'!
            </div>

            <button
              onClick={() => setShowCompareModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold glass-card text-white hover:opacity-80"
            >
              Close Comparison
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
