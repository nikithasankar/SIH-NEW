import type { OnFormUser, PublicUser, UserRole, RecruitmentStatus, toPublicUser as convertToPublic } from './user';

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

export function createUser(input: { name: string; email: string; password: string; role: UserRole }): OnFormUser {
  const users = readUsers();
  const user: OnFormUser = {
    ...input,
    createdAt: new Date().toISOString(),
    athleteId: `ATH-${Math.floor(1000 + Math.random() * 9000)}`,
    scoutScore: 75,
    formAccuracy: 80,
    consistencyScore: 80,
    recruitmentStatus: 'Pending',
    contactDetails: input.email,
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

export function updateAthleteStatus(
  email: string,
  status: RecruitmentStatus,
  scoutName: string = 'Coach Priya'
): OnFormUser | undefined {
  const users = readUsers();
  const normalized = email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email.toLowerCase() === normalized);
  if (index !== -1) {
    users[index].recruitmentStatus = status;
    users[index].recruitDate = new Date().toISOString().split('T')[0];
    users[index].recruitingScout = scoutName;
    users[index].recruitedBy = scoutName;
    writeUsers(users);

    // If current logged in session matches this athlete, update session too
    const currentSession = getSession();
    if (currentSession && currentSession.email.toLowerCase() === normalized) {
      setSession({
        ...currentSession,
        recruitmentStatus: status,
        recruitDate: users[index].recruitDate,
        recruitedBy: scoutName,
      });
    }
    return users[index];
  }
  return undefined;
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

