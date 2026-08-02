import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import pushUpImg from '../assets/act-push-up.jpg';
import squatImg from '../assets/act-squat.jpg';
import plankImg from '../assets/act-plank.jpg';

interface FeatureCardProps {
  title: string;
  body: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, body }) => (
  <article className="surface-panel group flex h-full flex-col rounded-2xl p-7 transition-transform duration-300 hover:-translate-y-1">
    <span className="h-1.5 w-10 rounded-full bg-[var(--color-primary)] transition-all duration-300 group-hover:w-16" />
    <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
    <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
  </article>
);

const FEATURES: FeatureCardProps[] = [
  {
    title: 'AI Pose Tracking',
    body: 'On-device MediaPipe reads 33 skeletal landmarks per frame — no video ever leaves your browser.',
  },
  {
    title: 'Cheat Detection',
    body: 'Partial reps and shortcuts are flagged instantly. Only full range-of-motion counts.',
  },
  {
    title: 'Voice Coaching',
    body: 'The ONFORM AI Coach speaks exercise-specific cues so you can focus on form, not the screen.',
  },
  {
    title: 'Fitness Passport',
    body: 'Every session generates a QR-verified passport that scouts and coaches can scan and trust.',
  },
  {
    title: 'Scout Dashboard',
    body: 'Coaches get a live roster view of every athlete — sessions, accuracy trends, and feedback.',
  },
  {
    title: 'Progress & Streaks',
    body: 'Weekly charts and streak tracking keep athletes accountable between sessions.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Pick an exercise',
    body: 'Push-ups, squats, planks and more — each with its own tracking rules.',
    image: pushUpImg,
  },
  {
    n: '02',
    title: 'Let the camera watch',
    body: 'The model reads 33 joints per frame, entirely inside your browser.',
    image: squatImg,
  },
  {
    n: '03',
    title: 'Get your passport',
    body: 'Finish your set and receive a QR-coded card scouts can verify instantly.',
    image: plankImg,
  },
];

const STATS = [
  { value: '8', label: 'Tracked exercises' },
  { value: '33', label: 'Landmarks / frame' },
  { value: '100%', label: 'On-device privacy' },
  { value: '0', label: 'Cheated reps counted' },
];

const EXERCISE_SHOWCASE = [
  { name: 'Standard Push-Ups', icon: '💪', category: 'Chest & Arms', spec: '90° Elbow Flexion', tag: 'Beginner' },
  { name: 'Deep Squats', icon: '🏋️', category: 'Lower Body', spec: 'Hip Below Knee', tag: 'Beginner' },
  { name: 'Overhead Press', icon: '🏋️‍♂️', category: 'Shoulders', spec: '160° Full Lockout', tag: 'Intermediate' },
  { name: 'Forearm Plank', icon: '🧘', category: 'Core Stability', spec: 'Pelvic Alignment', tag: 'Intermediate' },
  { name: 'Alternating Lunges', icon: '🦵', category: 'Lower Body', spec: '90° Knee Drop', tag: 'Beginner' },
  { name: 'Bicep Curls', icon: '💪', category: 'Arms', spec: 'Full Peak Squeeze', tag: 'Beginner' },
  { name: 'Core Sit-Ups', icon: '🤸', category: 'Core', spec: 'Full Contraction', tag: 'Beginner' },
  { name: 'Cardio High Knees', icon: '🏃', category: 'Cardio', spec: 'Hip-Level Drive', tag: 'Intermediate' },
];

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#exercises', label: 'Exercises' },
  { href: '#scouts', label: 'Scout console' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[var(--color-background)] text-white selection:bg-[var(--color-primary)] selection:text-black overflow-x-hidden">
      {/* NAVIGATION */}
      <header
        className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
          scrolled || isMobileMenuOpen ? 'border-b border-[var(--glass-border)] bg-[var(--color-background)]/85 backdrop-blur-xl' : ''
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 relative">
          <Link
            to="/"
            className="font-display text-lg font-black tracking-tight z-10"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            ON<span className="text-ember">FORM</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="rounded-full border border-[var(--glass-border)] bg-surface px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-surface-hover hover:border-[var(--color-primary)]/40"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-ember shrink-0 rounded-full px-5 py-2 text-sm font-bold"
            >
              Get started
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className={`md:hidden hamburger-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden mobile-menu">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <div className="border-t border-[var(--glass-border)] my-2 pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-left font-semibold text-white"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full mt-2 text-center btn-ember rounded-full px-5 py-3 text-sm font-bold"
                >
                  Get started
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden pt-16">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/hero-background.mp4.mp4" type="video/mp4" />
          <source src="/hero-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)]/85 via-[var(--color-background)]/60 to-[var(--color-background)]" />
        
        <div className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:py-32">
          <div className="max-w-2xl animate-fade-in-up mt-8 sm:mt-0">
            <p className="eyebrow">On-device fitness assessment</p>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] sm:text-6xl lg:text-7xl">
              Train hard.
              <br />
              <span className="text-ember">Prove it.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted sm:text-lg">
              ONFORM turns any camera into a certified assessment station. Real
              rep counting, instant cheat detection, and a passport scouts
              actually trust.
            </p>
            <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/login')}
                className="btn-ember rounded-full px-7 py-3.5 text-sm font-bold w-full sm:w-auto"
              >
                Start an assessment
              </button>
              <a
                href="#features"
                className="rounded-full border border-[var(--glass-border)] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-surface text-center w-full sm:w-auto"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Live metrics strip */}
          <div className="mt-20 sm:mt-24 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            <div className="glass-card p-5 text-center flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-primary">33 pts</div>
              <div className="text-[10px] sm:text-xs text-muted font-medium mt-1 uppercase tracking-wider">Skeletal landmarks</div>
            </div>
            <div className="glass-card p-5 text-center flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-secondary-color">On-device</div>
              <div className="text-[10px] sm:text-xs text-muted font-medium mt-1 uppercase tracking-wider">Local GPU inference</div>
            </div>
            <div className="glass-card p-5 text-center flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-[10px] sm:text-xs text-muted font-medium mt-1 uppercase tracking-wider">Client-side privacy</div>
            </div>
            <div className="glass-card p-5 text-center flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-primary">QR Pass</div>
              <div className="text-[10px] sm:text-xs text-muted font-medium mt-1 uppercase tracking-wider">Verified scouting card</div>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-x-0 bottom-8 hidden justify-center sm:flex">
          <span className="animate-pulse-glow font-mono text-[0.65rem] uppercase tracking-[0.3em] text-primary">
            Scroll
          </span>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 px-6 py-28 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="eyebrow">Features</p>
            <h2 className="mt-4 text-3xl font-black sm:text-5xl">
              Built for athletes. Verified by scouts.
            </h2>
            <p className="mt-4 text-muted">
              Every feature is designed to remove guesswork from fitness assessment.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="scroll-mt-24 border-y border-[var(--glass-border)] bg-surface/40 px-6 py-28 sm:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-4 text-3xl font-black sm:text-5xl">
              Three steps. Zero excuses.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <article key={s.n} className="surface-panel overflow-hidden rounded-2xl flex flex-col h-full">
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="h-48 w-full object-cover opacity-90"
                />
                <div className="p-7 flex-grow">
                  <span className="font-display text-4xl font-black text-primary" style={{ opacity: 0.4 }}>{s.n}</span>
                  <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="surface-panel rounded-2xl px-4 py-8 sm:px-6 text-center flex flex-col justify-center">
              <p className="font-display text-3xl font-black text-ember sm:text-4xl md:text-5xl">{s.value}</p>
              <p className="mt-3 font-mono text-[10px] sm:text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* EXERCISE CATALOG PREVIEW */}
      <section id="exercises" className="scroll-mt-24 px-6 py-28 sm:py-32 border-t border-[var(--glass-border)]">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
            <div>
              <p className="eyebrow">Calibrated biomechanics</p>
              <h2 className="mt-4 text-3xl font-black sm:text-5xl">Exercise library</h2>
            </div>
            <p className="text-muted text-sm sm:text-base max-w-md">
              Every movement has custom joint-angle thresholds and real-time form-break triggers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXERCISE_SHOWCASE.map((ex, idx) => (
              <div
                key={ex.name}
                onClick={() => navigate('/login')}
                className={`glass-card p-6 cursor-pointer hover:border-[var(--color-primary)] hover:translate-y-[-2px] transition-all group flex flex-col justify-between h-56 ${idx >= 4 ? 'hidden sm:flex' : 'flex'}`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{ex.icon}</span>
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-surface border border-[var(--glass-border)] text-muted uppercase">
                      {ex.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors pr-2">
                    {ex.name}
                  </h3>
                  <p className="text-xs text-muted mt-1">{ex.category}</p>
                </div>
                <div className="pt-4 border-t border-[var(--glass-border)] flex items-center justify-between mt-auto">
                  <span className="text-[11px] sm:text-xs font-mono text-secondary-color font-medium line-clamp-1 pr-2">{ex.spec}</span>
                  <span className="h-7 w-7 shrink-0 rounded-full bg-surface group-hover:bg-primary group-hover:text-black transition-colors flex items-center justify-center text-xs font-bold">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <button
              onClick={() => navigate('/login')}
              className="text-primary text-sm font-semibold hover:underline"
            >
              View all 8 exercises →
            </button>
          </div>
        </div>
      </section>

      {/* SCOUT CONSOLE PREVIEW */}
      <section id="scouts" className="scroll-mt-24 px-6 py-28 sm:py-32 border-t border-[var(--glass-border)]">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div>
              <p className="eyebrow">Talent scouting &amp; coaching console</p>
              <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Monitor athlete rosters with unbiased data
              </h2>
            </div>
            <p className="text-muted text-sm sm:text-base lg:text-lg leading-relaxed">
              Scouts and performance directors can review verified sessions, spot form
              anomalies, leave targeted coaching notes, and track progress across seasons.
            </p>
            <ul className="space-y-4 pt-2">
              {[
                'Centralized athlete roster with live session updates',
                'Side-by-side accuracy and form-break metrics',
                'Coaching feedback attached to workout sessions',
                'QR passport scanning for instant verification',
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="text-primary font-bold shrink-0">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm border border-[var(--glass-border)] bg-surface hover:bg-surface-hover hover:border-[var(--color-primary)] transition-all text-white text-center inline-block"
              >
                Explore scout console →
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 glass-card p-5 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[var(--glass-border)]">
              <div>
                <p className="text-[10px] uppercase font-mono font-bold text-primary tracking-widest">Live scout feed</p>
                <h3 className="text-lg sm:text-xl font-bold mt-1">National athlete roster</h3>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] sm:text-xs font-mono font-semibold border border-emerald-500/20 shrink-0">
                ● Live sync
              </span>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {[
                { name: 'Alex Johnson', exercise: 'Push-Up', reps: 24, acc: 96, time: '2m ago' },
                { name: 'Sarah Chen', exercise: 'Squat', reps: 30, acc: 100, time: '14m ago' },
                { name: 'Marcus Rivera', exercise: 'Plank', reps: '60s', acc: 88, time: '1h ago' },
              ].map((row) => (
                <div
                  key={row.name}
                  className="bg-surface rounded-2xl p-4 border border-[var(--glass-border)] flex flex-row items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-primary text-black font-bold text-xs flex items-center justify-center">
                      {row.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{row.name}</p>
                      <p className="text-muted text-xs truncate">{row.exercise} · {row.time}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-primary font-bold text-sm block">{row.reps} reps</span>
                    <span className="text-[10px] sm:text-xs text-secondary-color">{row.acc}% acc</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 sm:pb-32 pt-12">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[var(--color-primary)]/30 px-6 py-12 sm:px-16 sm:py-20 text-center text-black bg-[image:var(--gradient-ember)]">
          <h2 className="text-3xl font-black sm:text-5xl">Ready to defy gravity?</h2>
          <p className="mx-auto mt-6 max-w-xl text-sm font-medium opacity-90 sm:text-base">
            Jump into a guided assessment in under a minute — no equipment, just your camera.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-10 w-full sm:w-auto inline-flex justify-center rounded-full bg-[var(--color-background)] px-8 py-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Get started free
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--glass-border)] bg-[var(--color-background)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <p className="font-display text-xl font-black tracking-tight">
              ON<span className="text-ember">FORM</span>
            </p>
            <p className="mt-4 max-w-xs text-sm text-muted leading-relaxed">
              AI form assessment that runs entirely in your browser. Your video never leaves the device.
            </p>
          </div>
          <div>
            <p className="eyebrow">Product</p>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              <li><a className="hover:text-white transition-colors" href="#features">Features</a></li>
              <li><a className="hover:text-white transition-colors" href="#how-it-works">How it works</a></li>
              <li><Link className="hover:text-white transition-colors" to="/login">Athlete app</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">For coaches</p>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              <li><Link className="hover:text-white transition-colors" to="/login">Scout console</Link></li>
              <li><a className="hover:text-white transition-colors" href="#stats">Verification</a></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Account</p>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              <li><Link className="hover:text-white transition-colors" to="/login">Sign in</Link></li>
              <li><Link className="hover:text-white transition-colors" to="/login">Create account</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--glass-border)] px-6 py-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} ONFORM · All tracking runs on-device — your video never leaves your browser.
        </div>
      </footer>
    </div>
  );
};
