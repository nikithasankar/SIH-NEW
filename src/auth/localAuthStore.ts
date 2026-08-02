import type { OnFormUser, PublicUser, UserRole } from './user';

const USERS_KEY = 'onform_users_v1';
const SESSION_KEY = 'onform_session_v1';

const DEFAULT_DEMO_USERS: OnFormUser[] = [
  {
    name: 'Arjun Mehta',
    email: 'athlete@onform.app',
    password: 'demo1234',
    role: 'participant',
    createdAt: '2026-01-01T00:00:00.000Z',
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

    // Ensure all default demo users exist in the stored list
    let updated = false;
    for (const demoUser of DEFAULT_DEMO_USERS) {
      if (!users.some((u) => u.email.toLowerCase() === demoUser.email.toLowerCase())) {
        users.push(demoUser);
        updated = true;
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
  const user: OnFormUser = { ...input, createdAt: new Date().toISOString() };
  users.push(user);
  writeUsers(users);
  return user;
}

export function listParticipants(): PublicUser[] {
  return readUsers()
    .filter((u) => u.role === 'participant')
    .map((u) => ({ email: u.email, name: u.name, role: u.role }));
}

export function getSession(): PublicUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as PublicUser) : null;
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
