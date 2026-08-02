// Dexie database schema.
// v2 adds `userEmail` (indexed) to sessions — needed so the scout
// dashboard can query "all sessions for athlete X" — and a new
// `scoutNotes` table for scout feedback/suggestions on a session.
import Dexie from 'dexie';
import type { SessionResult, ScoutNote } from '../models/sessionResult';

class OnFormDB extends Dexie {
  sessions!: Dexie.Table<SessionResult, number>;
  scoutNotes!: Dexie.Table<ScoutNote, number>;

  constructor() {
    super('OnFormDB');

    this.version(1).stores({
      sessions: '++id, exerciseId, timestamp',
    });

    this.version(2).stores({
      sessions: '++id, exerciseId, timestamp, userEmail',
      scoutNotes: '++id, sessionId, scoutEmail, createdAt',
    });
  }
}

export const db = new OnFormDB();
