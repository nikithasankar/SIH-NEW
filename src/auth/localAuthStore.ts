import type { OnFormUser, PublicUser, UserRole, RecruitmentStatus, ScoutDecision } from './user';

const USERS_KEY = 'onform_users_v1';
const SESSION_KEY = 'onform_session_v1';

const DEFAULT_DEMO_USERS: OnFormUser[] = [
  {
    name: 'Arjun Mehta',
    email: 'athlete@onform.app',
    password: 'demo1234',
    role: 'participant',
    createdAt: '2026-01-01T00:00:00.000Z',
    athleteId: 'ATH-1001',
    age: 21,
    gender: 'Male',
    height: 182,
    weight: 76,
    bmi: 22.9,
    sport: 'Football',
    position: 'Midfielder',
    experienceLevel: 'State',
    dominantHand: 'Right',
    dominantLeg: 'Right',
    school: 'St. Xavier High School',
    college: 'Delhi University Sports Complex',
    academy: 'National Football Academy',
    district: 'Central Delhi',
    state: 'Delhi',
    country: 'India',
    scoutScore: 88,
    strengthScore: 85,
    enduranceScore: 92,
    speedScore: 86,
    agilityScore: 89,
    balanceScore: 84,
    flexibilityScore: 78,
    reactionTime: 0.22,
    jumpHeight: 64,
    sprintTime: 11.2,
    formAccuracy: 91,
    consistencyScore: 94,
    recruitmentStatus: 'Shortlisted',
    contactDetails: '+91 98765 43210 | arjun@onform.app',
  },
  {
    name: 'Priya Sharma',
    email: 'priya@onform.app',
    password: 'demo1234',
    role: 'participant',
    createdAt: '2026-01-02T00:00:00.000Z',
    athleteId: 'ATH-1002',
    age: 19,
    gender: 'Female',
    height: 172,
    weight: 62,
    bmi: 21.0,
    sport: 'Athletics',
    position: 'Sprinter (100m/200m)',
    experienceLevel: 'National',
    dominantHand: 'Right',
    dominantLeg: 'Right',
    school: 'Modern Public School',
    college: 'LPU Sports Wing',
    academy: 'Olympic Sprint Center',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    scoutScore: 94,
    strengthScore: 88,
    enduranceScore: 90,
    speedScore: 97,
    agilityScore: 95,
    balanceScore: 90,
    flexibilityScore: 86,
    reactionTime: 0.18,
    jumpHeight: 70,
    sprintTime: 10.8,
    formAccuracy: 96,
    consistencyScore: 97,
    recruitmentStatus: 'Recruited',
    recruitDate: '2026-07-28',
    recruitedBy: 'Coach Priya',
    contactDetails: '+91 99887 76655 | priya@onform.app',
  },
  {
    name: 'Rohan Verma',
    email: 'rohan@onform.app',
    password: 'demo1234',
    role: 'participant',
    createdAt: '2026-01-03T00:00:00.000Z',
    athleteId: 'ATH-1003',
    age: 22,
    gender: 'Male',
    height: 188,
    weight: 84,
    bmi: 23.8,
    sport: 'Basketball',
    position: 'Point Guard',
    experienceLevel: 'State',
    dominantHand: 'Right',
    dominantLeg: 'Left',
    school: 'Greenwood High',
    college: 'St. Josephs College',
    academy: 'Hoop Dreams Academy',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    country: 'India',
    scoutScore: 83,
    strengthScore: 82,
    enduranceScore: 84,
    speedScore: 87,
    agilityScore: 85,
    balanceScore: 80,
    flexibilityScore: 75,
    reactionTime: 0.24,
    jumpHeight: 68,
    sprintTime: 11.6,
    formAccuracy: 84,
    consistencyScore: 86,
    recruitmentStatus: 'Trial Invited',
    contactDetails: '+91 97654 32109 | rohan@onform.app',
  },
  {
    name: 'Ananya Patel',
    email: 'ananya@onform.app',
    password: 'demo1234',
    role: 'participant',
    createdAt: '2026-01-04T00:00:00.000Z',
    athleteId: 'ATH-1004',
    age: 20,
    gender: 'Female',
    height: 168,
    weight: 58,
    bmi: 20.5,
    sport: 'Badminton',
    position: 'Singles Player',
    experienceLevel: 'National',
    dominantHand: 'Left',
    dominantLeg: 'Right',
    school: 'DPS Ahmedabad',
    college: 'Gujarat University Sports Club',
    academy: 'Pullela Badminton Academy',
    district: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    scoutScore: 91,
    strengthScore: 84,
    enduranceScore: 93,
    speedScore: 92,
    agilityScore: 96,
    balanceScore: 94,
    flexibilityScore: 90,
    reactionTime: 0.19,
    jumpHeight: 58,
    sprintTime: 11.4,
    formAccuracy: 93,
    consistencyScore: 95,
    recruitmentStatus: 'Under Review',
    contactDetails: '+91 91234 56789 | ananya@onform.app',
  },
  {
    name: 'Coach Priya',
    email: 'scout@onform.app',
    password: 'demo1234',
    role: 'scout',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

function readUsers(): OnFormUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    let users: OnFormUser[] = raw ? (JSON.parse(raw) as OnFormUser[]) : [];

    // Ensure default demo users exist with full profile attributes
    let updated = false;
    for (const demoUser of DEFAULT_DEMO_USERS) {
      const idx = users.findIndex((u) => u.email.toLowerCase() === demoUser.email.toLowerCase());
      if (idx === -1) {
        users.push(demoUser);
        updated = true;
      } else {
        // Merge missing attributes
        let merged = false;
        for (const [key, val] of Object.entries(demoUser)) {
          if (users[idx][key as keyof OnFormUser] === undefined) {
            (users[idx] as any)[key] = val;
            merged = true;
          }
        }
        if (merged) updated = true;
      }
    }
    if (updated) {
      writeUsers(users);
    }
    return users;
  } catch {
    return [...DEFAULT_DEMO_USERS];
  }
}

function writeUsers(users: OnFormUser[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore quota errors
  }
}

export function findUser(email: string): OnFormUser | undefined {
  const normalized = email.trim().toLowerCase();
  const users = readUsers();
  return users.find((u) => u.email.toLowerCase() === normalized);
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profileData?: Partial<AthleteProfile>;
}): OnFormUser {
  const users = readUsers();
  const extra = input.profileData || {};

  const user: OnFormUser = {
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    createdAt: new Date().toISOString(),
    athleteId: `ATH-${Math.floor(1000 + Math.random() * 9000)}`,
    scoutScore: extra.scoutScore ?? 82,
    formAccuracy: extra.formAccuracy ?? 85,
    consistencyScore: extra.consistencyScore ?? 88,
    strengthScore: extra.strengthScore ?? 80,
    enduranceScore: extra.enduranceScore ?? 82,
    speedScore: extra.speedScore ?? 85,
    agilityScore: extra.agilityScore ?? 84,
    balanceScore: extra.balanceScore ?? 80,
    flexibilityScore: extra.flexibilityScore ?? 78,
    jumpHeight: extra.jumpHeight ?? 60,
    sprintTime: extra.sprintTime ?? 11.5,
    recruitmentStatus: 'Pending',
    contactDetails: input.email,
    ...extra,
  };
  users.push(user);
  writeUsers(users);
  return user;
}

export function listParticipants(): PublicUser[] {
  return readUsers()
    .filter((u) => u.role === 'participant')
    .map((u) => {
      const { password, ...publicUser } = u;
      return publicUser;
    });
}

/**
 * Priority order for deriving the athlete's overall visible status from
 * the collection of independent scout decisions. Lower index = higher priority.
 */
const STATUS_PRIORITY: RecruitmentStatus[] = [
  'Recruited',
  'Shortlisted',
  'Trial Invited',
  'Under Review',
];

/**
 * Derive a single athlete-visible status from the set of all scout decisions.
 *
 * Rules:
 *  1. If ANY scout gave a positive decision (Recruited/Shortlisted/Trial Invited/Under Review),
 *     use the highest-priority positive decision.
 *  2. If ALL registered scouts rejected → 'Rejected'.
 *  3. If SOME scouts rejected (or reviewed) but at least one scout hasn't decided (or positive decision not given),
 *     the status remains 'Watchlist' so the athlete stays on the talent radar.
 *  4. If no decisions at all → 'Pending'.
 *
 * Returns { status, bestScoutName, bestScoutEmail } so the athlete knows who selected them.
 */
export function deriveAthleteStatus(decisions: ScoutDecision[]): {
  status: RecruitmentStatus;
  bestScoutName: string | null;
  bestScoutEmail: string | null;
} {
  if (!decisions || decisions.length === 0) {
    return { status: 'Pending', bestScoutName: null, bestScoutEmail: null };
  }

  // Count registered active scouts in the platform
  const allUsers = readUsers();
  const totalScouts = Math.max(1, allUsers.filter((u) => u.role === 'scout').length);

  // Find the highest-priority positive decision
  let bestDecision: ScoutDecision | null = null;
  let bestPriority = STATUS_PRIORITY.length; // worst

  let rejectCount = 0;

  for (const d of decisions) {
    if (d.decision === 'Rejected') {
      rejectCount++;
      continue;
    }

    const idx = STATUS_PRIORITY.indexOf(d.decision);
    if (idx !== -1 && idx < bestPriority) {
      bestPriority = idx;
      bestDecision = d;
    }
  }

  // Positive decision takes highest precedence
  if (bestDecision) {
    return {
      status: bestDecision.decision,
      bestScoutName: bestDecision.scoutName,
      bestScoutEmail: bestDecision.scoutEmail,
    };
  }

  // If ALL registered scouts have rejected, only then mark as Rejected
  if (rejectCount >= totalScouts) {
    return { status: 'Rejected', bestScoutName: null, bestScoutEmail: null };
  }

  // If at least one scout rejected or reviewed, but other scouts haven't evaluated yet -> Watchlist
  if (rejectCount > 0 || decisions.length > 0) {
    return { status: 'Watchlist', bestScoutName: null, bestScoutEmail: null };
  }

  return { status: 'Pending', bestScoutName: null, bestScoutEmail: null };
}

/**
 * Record (or update) a single scout's decision for an athlete.
 * The athlete's overall visible `recruitmentStatus` is then re-derived
 * from the full set of scout decisions.
 */
export function updateAthleteStatus(
  email: string,
  status: RecruitmentStatus,
  scoutName: string = 'Coach Priya',
  scoutEmail: string = 'scout@onform.app'
): OnFormUser | undefined {
  const users = readUsers();
  const normalized = email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email.toLowerCase() === normalized);
  if (index === -1) return undefined;

  const athlete = users[index];

  // Initialize scoutDecisions array if missing
  if (!athlete.scoutDecisions) {
    athlete.scoutDecisions = [];
  }

  // Find existing decision by this scout, or create new
  const existingIdx = athlete.scoutDecisions.findIndex(
    (d) => d.scoutEmail.toLowerCase() === scoutEmail.toLowerCase()
  );

  const decision: ScoutDecision = {
    scoutEmail,
    scoutName,
    decision: status,
    decidedAt: new Date().toISOString(),
  };

  if (existingIdx !== -1) {
    athlete.scoutDecisions[existingIdx] = decision;
  } else {
    athlete.scoutDecisions.push(decision);
  }

  // Re-derive the overall status from all scout decisions
  const derived = deriveAthleteStatus(athlete.scoutDecisions);
  athlete.recruitmentStatus = derived.status;
  athlete.recruitDate = new Date().toISOString().split('T')[0];
  athlete.recruitedBy = derived.bestScoutName;

  writeUsers(users);

  // If current logged-in session matches this athlete, update session too
  const currentSession = getSession();
  if (currentSession && currentSession.email.toLowerCase() === normalized) {
    setSession({
      ...currentSession,
      recruitmentStatus: derived.status,
      recruitDate: athlete.recruitDate,
      recruitedBy: derived.bestScoutName,
      scoutDecisions: athlete.scoutDecisions,
    });
  }

  try {
    window.dispatchEvent(
      new CustomEvent('athlete_status_updated', {
        detail: {
          email: normalized,
          status: derived.status,
          scoutName,
          scoutEmail,
          recruitDate: athlete.recruitDate,
          decisions: athlete.scoutDecisions,
        },
      })
    );
  } catch {
    // ignore in non-browser context
  }

  return athlete;
}

/**
 * Get a specific scout's decision for a specific athlete.
 * Returns undefined if the scout hasn't decided yet.
 */
export function getScoutDecisionForAthlete(
  athleteEmail: string,
  scoutEmail: string
): ScoutDecision | undefined {
  const user = findUser(athleteEmail);
  if (!user?.scoutDecisions) return undefined;
  return user.scoutDecisions.find(
    (d) => d.scoutEmail.toLowerCase() === scoutEmail.toLowerCase()
  );
}

/**
 * Get all scout decisions for a given athlete.
 */
export function listScoutDecisions(athleteEmail: string): ScoutDecision[] {
  const user = findUser(athleteEmail);
  return user?.scoutDecisions ?? [];
}

export function getSession(): PublicUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as PublicUser;
    // Always refresh session profile data from storage
    const latest = findUser(session.email);
    if (latest) {
      const { password, ...pub } = latest;
      return pub;
    }
    return session;
  } catch {
    return null;
  }
}

export function setSession(user: PublicUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

