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

  // Athlete Profile Fields for Sign-Up
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [age, setAge] = useState<string>('19');
  const [height, setHeight] = useState<string>('175');
  const [weight, setWeight] = useState<string>('68');
  const [sport, setSport] = useState<string>('Football');
  const [position, setPosition] = useState<string>('Midfielder');
  const [experienceLevel, setExperienceLevel] = useState<string>('State');
  const [dominantHand, setDominantHand] = useState<'Right' | 'Left' | 'Ambidextrous'>('Right');
  const [dominantLeg, setDominantLeg] = useState<'Right' | 'Left' | 'Both'>('Right');
  const [state, setState] = useState<string>('Delhi');
  const [district, setDistrict] = useState<string>('Central Delhi');
  const [academy, setAcademy] = useState<string>('National Sports Academy');
  const [school, setSchool] = useState<string>('Delhi Public School');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const profileData =
      role === 'participant'
        ? {
            gender,
            age: age ? Number(age) : 19,
            height: height ? Number(height) : 175,
            weight: weight ? Number(weight) : 68,
            bmi:
              height && weight
                ? Number((Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1))
                : 22.2,
            sport,
            position,
            experienceLevel,
            dominantHand,
            dominantLeg,
            state,
            district,
            academy,
            school,
            college: school,
            country: 'India',
          }
        : undefined;

    const result =
      mode === 'login'
        ? login(email, password, role)
        : signup(name, email, password, role, profileData);

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

  const sportsList = [
    'Football',
    'Basketball',
    'Athletics',
    'Badminton',
    'Cricket',
    'Tennis',
    'Swimming',
    'Volleyball',
  ];

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8 bg-[#0d0a07] text-[#e8e4df] font-sans selection:bg-[#ff8a3d] selection:text-black">
      <div className={`w-full ${mode === 'signup' && role === 'participant' ? 'max-w-xl' : 'max-w-[440px]'} flex flex-col items-center gap-6 animate-fade-in-up`}>
        
        {/* Brand Header Logo */}
        <Link to="/" className="inline-block text-center select-none group">
          <span className="font-extrabold text-3xl sm:text-4xl tracking-tight text-white">
            ON<span className="text-[#ff8a3d]">FORM</span>
          </span>
        </Link>

        {/* Role Switcher Pill Container */}
        <div className="w-full bg-[#1c1815] border border-[#2d2621] p-1.5 rounded-full flex items-center shadow-md">
          <button
            type="button"
            onClick={() => {
              setRole('participant');
              setError(null);
            }}
            className={`flex-1 py-3 px-4 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'participant'
                ? 'bg-gradient-to-r from-[#ff7a28] to-[#ffa14a] text-black shadow-lg shadow-[#ff7a28]/20'
                : 'text-[#9c9186] hover:text-white'
            }`}
          >
            <span>🏃</span>
            <span>Athlete</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('scout');
              setError(null);
            }}
            className={`flex-1 py-3 px-4 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              role === 'scout'
                ? 'bg-gradient-to-r from-[#ff7a28] to-[#ffa14a] text-black shadow-lg shadow-[#ff7a28]/20'
                : 'text-[#9c9186] hover:text-white'
            }`}
          >
            <span>🧭</span>
            <span>Scout</span>
          </button>
        </div>

        {/* Main Auth Form Card */}
        <div className="w-full bg-[#1c1713] border border-[#2c241e] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h1 className="text-3xl font-black text-white tracking-tight">
            {mode === 'login' ? 'Welcome back' : `Create ${role === 'participant' ? 'Athlete Profile' : 'Scout Account'}`}
          </h1>
          <p className="text-[#9e9286] text-sm mt-1.5 leading-relaxed">
            {role === 'participant'
              ? mode === 'login'
                ? 'Sign in to track your reps, form, and progress.'
                : 'Register your athlete biometrics and sporting credentials.'
              : 'Sign in to review your athlete roster and sessions.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Full Name field if signing up */}
            {mode === 'signup' && (
              <div>
                <label className="text-[11px] font-mono text-[#a3978c] uppercase tracking-wider block mb-1.5">
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#110e0b] border border-[#2d251f] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-[#5a524a] outline-none transition-colors focus:border-[#ff8a3d]"
                  required
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              {mode === 'signup' && (
                <label className="text-[11px] font-mono text-[#a3978c] uppercase tracking-wider block mb-1.5">
                  Email Address
                </label>
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@onform.app"
                className="w-full bg-[#110e0b] border border-[#2d251f] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-[#5a524a] outline-none transition-colors focus:border-[#ff8a3d]"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              {mode === 'signup' && (
                <label className="text-[11px] font-mono text-[#a3978c] uppercase tracking-wider block mb-1.5">
                  Password
                </label>
              )}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#110e0b] border border-[#2d251f] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-[#5a524a] outline-none transition-colors focus:border-[#ff8a3d]"
                required
              />
            </div>

            {/* EXPANDED ATHLETE DOSSIER SIGNUP FIELDS (Only shown during Athlete Signup) */}
            {mode === 'signup' && role === 'participant' && (
              <div className="space-y-4 pt-4 border-t border-[#2d251f]">
                {/* 1. Basic Biometrics */}
                <div>
                  <span className="text-xs font-mono font-bold text-[#ff8a3d] uppercase tracking-wider block mb-2">
                    👤 Basic Athlete Info & Biometrics
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="text-[10px] text-[#9e9286] block mb-1">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full bg-[#110e0b] border border-[#2d251f] rounded-xl px-2.5 py-2.5 text-xs text-white outline-none focus:border-[#ff8a3d]"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#9e9286] block mb-1">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="19"
                        className="w-full bg-[#110e0b] border border-[#2d251f] rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-[#ff8a3d]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#9e9286] block mb-1">Height (cm)</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="175"
                        className="w-full bg-[#110e0b] border border-[#2d251f] rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-[#ff8a3d]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#9e9286] block mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="68"
                        className="w-full bg-[#110e0b] border border-[#2d251f] rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-[#ff8a3d]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Sports Profile */}
                <div>
                  <span className="text-xs font-mono font-bold text-[#ffb443] uppercase tracking-wider block mb-2">
                    🏅 Sports & Competitive Profile
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] text-[#9e9286] block mb-1">Primary Sport</label>
                      <select
                        value={sport}
                        onChange={(e) => setSport(e.target.value)}
                        className="w-full bg-[#110e0b] border border-[#2d251f] rounded-xl px-2.5 py-2.5 text-xs text-white outline-none focus:border-[#ff8a3d]"
                      >
                        {sportsList.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#9e9286] block mb-1">Position / Role</label>
                      <input
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="e.g. Midfielder"
                        className="w-full bg-[#110e0b] border border-[#2d251f] rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-[#ff8a3d]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#9e9286] block mb-1">Experience Level</label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full bg-[#110e0b] border border-[#2d251f] rounded-xl px-2.5 py-2.5 text-xs text-white outline-none focus:border-[#ff8a3d]"
                      >
                        <option value="Junior">Junior / School</option>
                        <option value="State">State Level</option>
                        <option value="National">National Level</option>
                        <option value="Pro">Professional / Elite</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                    <div>
                      <label className="text-[10px] text-[#9e9286] block mb-1">Dominant Hand</label>
                      <select
                        value={dominantHand}
                        onChange={(e) => setDominantHand(e.target.value as any)}
                        className="w-full bg-[#110e0b] border border-[#2d251f] rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-[#ff8a3d]"
                      >
                        <option value="Right">Right Handed</option>
                        <option value="Left">Left Handed</option>
                        <option value="Ambidextrous">Ambidextrous</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#9e9286] block mb-1">Dominant Leg</label>
                      <select
                        value={dominantLeg}
                        onChange={(e) => setDominantLeg(e.target.value as any)}
                        className="w-full bg-[#110e0b] border border-[#2d251f] rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-[#ff8a3d]"
                      >
                        <option value="Right">Right Foot</option>
                        <option value="Left">Left Foot</option>
                        <option value="Both">Both Feet</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Location & Institution */}
                <div>
                  <span className="text-xs font-mono font-bold text-[#38bdf8] uppercase tracking-wider block mb-2">
                    📍 Location & Training Academy
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-[#9e9286] block mb-1">State / Province</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Delhi, Karnataka"
                        className="w-full bg-[#110e0b] border border-[#2d251f] rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-[#ff8a3d]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#9e9286] block mb-1">District / City</label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Central Delhi"
                        className="w-full bg-[#110e0b] border border-[#2d251f] rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-[#ff8a3d]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
                    <div>
                      <label className="text-[10px] text-[#9e9286] block mb-1">Academy / Club</label>
                      <input
                        type="text"
                        value={academy}
                        onChange={(e) => setAcademy(e.target.value)}
                        placeholder="e.g. National Academy"
                        className="w-full bg-[#110e0b] border border-[#2d251f] rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-[#ff8a3d]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#9e9286] block mb-1">School / College</label>
                      <input
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="e.g. Delhi Public School"
                        className="w-full bg-[#110e0b] border border-[#2d251f] rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-[#ff8a3d]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-[#f87171] text-xs bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Warm Amber Primary Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#ff7a28] to-[#ffa14a] hover:from-[#ff8538] hover:to-[#ffaa5c] text-black font-extrabold text-base py-4 rounded-2xl shadow-lg shadow-[#ff7a28]/25 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              {submitting
                ? 'Please wait…'
                : mode === 'login'
                  ? `Sign in as ${role === 'participant' ? 'athlete' : 'scout'}`
                  : `Sign up as ${role === 'participant' ? 'athlete' : 'scout'}`}
            </button>
          </form>

          {/* Bottom Links */}
          <div className="flex items-center justify-between mt-6 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === 'login' ? 'signup' : 'login'));
                setError(null);
              }}
              className="text-[#9e9286] hover:text-white transition-colors cursor-pointer"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>

            <button
              type="button"
              onClick={() => fillDemo()}
              className="text-[#ff9f43] font-bold hover:underline cursor-pointer"
            >
              Use demo login
            </button>
          </div>
        </div>

        {/* 1-Click Instant Demo Login Panel */}
        <div className="w-full bg-[#1c1713] border border-[#2c241e] rounded-3xl p-5 shadow-xl text-center space-y-3">
          <p className="text-xs text-[#a3978c] font-mono tracking-wide flex items-center justify-center gap-1.5">
            <span className="text-[#ff8a3d]">⚡</span>
            <span>1-click instant demo login</span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => quickDemoLogin('participant')}
              className="bg-[#110e0b] hover:bg-[#201a14] border border-[#2d251f] hover:border-[#ff8a3d]/50 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>🏃</span>
              <span>Athlete demo</span>
            </button>

            <button
              type="button"
              onClick={() => quickDemoLogin('scout')}
              className="bg-[#110e0b] hover:bg-[#201a14] border border-[#2d251f] hover:border-[#ff8a3d]/50 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>🧭</span>
              <span>Scout demo</span>
            </button>
          </div>
        </div>

        {/* Bottom Demo Credentials Footer */}
        <p className="text-center text-xs leading-relaxed text-[#786e64] max-w-sm">
          Demo accounts — Participant: athlete@onform.app · Scout: scout@onform.app (password: demo1234)
        </p>

      </div>
    </div>
  );
}
