// Auth context — client-only demo authentication.
//
// NOTE (documented limitation, see detailed_project_report / AUDIT_FIXES.md):
// This app has no backend, so "accounts" are persisted to localStorage in
// the current browser only. That's sufficient to demo the participant vs.
// scout role-based flow end-to-end (including a scout viewing sessions
// recorded by participant accounts used in the *same* browser), but a real
// deployment needs a proper auth service + shared database so a scout can
// monitor athletes across devices. Swap `auth/localAuthStore.ts` for real
// API calls without touching any consuming component — the context surface
// (login/signup/logout/user) stays the same.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { PublicUser, UserRole } from './user';
import {
  findUser,
  createUser,
  getSession,
  setSession,
  clearSession,
} from './localAuthStore';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  /** Attempt login. Role is checked against the account's actual role so a
   * participant can't accidentally sign in through the scout tab (and
   * vice versa) — this is the "role/email based" login the coach requested. */
  login: (email: string, password: string, role: UserRole) => { ok: true } | { ok: false; error: string };
  signup: (name: string, email: string, password: string, role: UserRole) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getSession());
    setLoading(false);
  }, []);

  const login = useCallback((email: string, password: string, role: UserRole) => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = findUser(normalizedEmail);
    if (!account || account.password !== password) {
      return { ok: false as const, error: 'Incorrect email or password.' };
    }
    if (account.role !== role) {
      return {
        ok: false as const,
        error: `This account is registered as a ${account.role}. Switch tabs to sign in.`,
      };
    }
    const publicUser: PublicUser = { email: account.email, name: account.name, role: account.role };
    setSession(publicUser);
    setUser(publicUser);
    return { ok: true as const };
  }, []);

  const signup = useCallback((name: string, email: string, password: string, role: UserRole) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim() || !normalizedEmail || password.length < 4) {
      return { ok: false as const, error: 'Please fill in all fields (password min. 4 characters).' };
    }
    if (findUser(normalizedEmail)) {
      return { ok: false as const, error: 'An account with this email already exists.' };
    }
    const account = createUser({ name: name.trim(), email: normalizedEmail, password, role });
    const publicUser: PublicUser = { email: account.email, name: account.name, role: account.role };
    setSession(publicUser);
    setUser(publicUser);
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}
