import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { UserRole } from '../auth/user';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [role, setRole] = useState<UserRole>('participant');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result =
      mode === 'login' ? login(email, password, role) : signup(name, email, password, role);

    setSubmitting(false);
    if (!result.ok) {
      setError('error' in result ? result.error : 'Something went wrong. Please try again.');
      return;
    }
    navigate(role === 'scout' ? '/scout' : '/app', { replace: true });
  };

  const fillDemo = (targetRole?: UserRole) => {
    const activeRole = targetRole ?? role;
    if (targetRole) {
      setRole(targetRole);
    }
    if (activeRole === 'participant') {
      setEmail('athlete@onform.app');
      setPassword('demo1234');
    } else {
      setEmail('scout@onform.app');
      setPassword('demo1234');
    }
    setError(null);
    setMode('login');
  };

  const quickDemoLogin = (demoRole: UserRole) => {
    const demoEmail = demoRole === 'participant' ? 'athlete@onform.app' : 'scout@onform.app';
    const demoPass = 'demo1234';
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setMode('login');
    const result = login(demoEmail, demoPass, demoRole);
    if (result.ok) {
      navigate(demoRole === 'scout' ? '/scout' : '/app', { replace: true });
    } else {
      setError('error' in result ? result.error : 'Login failed');
    }
  };

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: 'var(--color-background)' }}
    >
      {/* Ambient ember glow, matching the ONFORM marketing site */}
      <div
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full blur-[120px] opacity-25"
        style={{ background: 'var(--color-primary)' }}
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full blur-[120px] opacity-15"
        style={{ background: 'var(--color-primary-glow)' }}
      />

      <div className="w-full max-w-md relative animate-fade-in-up">
        <Link to="/" className="block text-center mb-8">
          <span className="font-display text-2xl font-black tracking-tight text-white">
            ON<span className="text-ember">FORM</span>
          </span>
        </Link>

        {/* Role tabs */}
        <div className="grid grid-cols-2 gap-1 mb-4 rounded-full border border-[var(--glass-border)] bg-surface p-1">
          {(['participant', 'scout'] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setError(null);
              }}
              className={`rounded-full py-2.5 text-sm font-semibold capitalize transition-colors ${
                role === r ? 'btn-ember' : 'text-muted hover:text-white'
              }`}
            >
              {r === 'participant' ? '🏃 Athlete' : '🧭 Scout'}
            </button>
          ))}
        </div>

        <div className="surface-panel rounded-2xl p-7">
          <h1 className="text-2xl font-black text-white">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-muted text-sm mt-1">
            {role === 'participant'
              ? 'Sign in to track your reps, form, and progress.'
              : 'Sign in to review your athlete roster and sessions.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            {mode === 'signup' && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--color-primary)]"
                required
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@onform.app"
              className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--color-primary)]"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--color-primary)]"
              required
            />

            {error && (
              <p className="text-danger text-xs bg-[rgba(255,75,75,0.1)] border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-ember w-full rounded-xl py-3.5 text-sm font-bold disabled:opacity-60 cursor-pointer"
            >
              {submitting
                ? 'Please wait…'
                : mode === 'login'
                  ? `Sign in as ${role === 'participant' ? 'athlete' : 'scout'}`
                  : `Create ${role === 'participant' ? 'athlete' : 'scout'} account`}
            </button>
          </form>

          <div className="flex items-center justify-between mt-5 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === 'login' ? 'signup' : 'login'));
                setError(null);
              }}
              className="text-muted hover:text-primary transition-colors cursor-pointer"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
            <button
              type="button"
              onClick={() => fillDemo()}
              className="text-secondary-color font-medium hover:underline cursor-pointer"
            >
              Use demo login
            </button>
          </div>
        </div>

        {/* 1-click demo login shortcuts */}
        <div className="surface-panel rounded-2xl p-4 mt-4 text-center">
          <p className="text-xs text-muted font-mono mb-2.5">⚡ 1-click instant demo login</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickDemoLogin('participant')}
              className="py-2 px-3 rounded-xl bg-surface hover:bg-surface-hover border border-[var(--glass-border)] text-xs font-semibold text-white hover:border-[var(--color-primary)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>🏃</span>
              <span>Athlete demo</span>
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('scout')}
              className="py-2 px-3 rounded-xl bg-surface hover:bg-surface-hover border border-[var(--glass-border)] text-xs font-semibold text-white hover:border-[var(--color-primary)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>🧭</span>
              <span>Scout demo</span>
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-muted">
          Demo accounts — Participant: athlete@onform.app · Scout: scout@onform.app (password: demo1234)
        </p>
      </div>
    </div>
  );
}
