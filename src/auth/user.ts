export type UserRole = 'participant' | 'scout';

export interface OnFormUser {
  email: string;
  name: string;
  role: UserRole;
  /** Plaintext only for this client-only demo store — see README for the
   * production-readiness note about replacing this with a real backend. */
  password: string;
  createdAt: string;
}

export interface PublicUser {
  email: string;
  name: string;
  role: UserRole;
}

export function toPublicUser(u: OnFormUser): PublicUser {
  return { email: u.email, name: u.name, role: u.role };
}
