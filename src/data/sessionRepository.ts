// Session repository — CRUD operations over Dexie.
import { db } from './db';
import type { SessionResult, ScoutNote } from '../models/sessionResult';

export async function saveSession(session: SessionResult): Promise<number> {
  return db.sessions.add(session);
}

export async function getAllSessions(): Promise<SessionResult[]> {
  return db.sessions.orderBy('timestamp').reverse().toArray();
}

/** All sessions recorded by a specific participant (used by both the
 * athlete's own history screens and the scout monitoring dashboard). */
export async function getSessionsByUser(userEmail: string): Promise<SessionResult[]> {
  return db.sessions.where('userEmail').equals(userEmail).reverse().sortBy('timestamp');
}

export async function getSessionsByExercise(exerciseId: string): Promise<SessionResult[]> {
  return db.sessions.where('exerciseId').equals(exerciseId).reverse().sortBy('timestamp');
}

export async function deleteSession(id: number): Promise<void> {
  await db.scoutNotes.where('sessionId').equals(id).delete();
  return db.sessions.delete(id);
}

// ── Scout notes ────────────────────────────────────────────────────────

export async function addScoutNote(note: ScoutNote): Promise<number> {
  return db.scoutNotes.add(note);
}

export async function getNotesForSession(sessionId: number): Promise<ScoutNote[]> {
  return db.scoutNotes.where('sessionId').equals(sessionId).sortBy('createdAt');
}

export async function getAllScoutNotes(): Promise<ScoutNote[]> {
  return db.scoutNotes.toArray();
}
