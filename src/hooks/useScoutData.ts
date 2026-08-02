// Scout data hook — powers the scout monitoring dashboard.
//
// LIMITATION (documented, see AUDIT_FIXES.md): this is a client-only app
// with no backend, so "monitoring" is implemented by reading the same
// browser's Dexie/IndexedDB store and the localStorage account list. In a
// real deployment, athlete accounts and their sessions would live in a
// shared backend database so a scout could monitor athletes from a
// different device entirely — this hook is written so only its internals
// (the repository calls) would need to change to support that; the
// component-facing API stays the same.
import { useCallback, useEffect, useState } from 'react';
import type { SessionResult, ScoutNote } from '../models/sessionResult';
import { listParticipants } from '../auth/localAuthStore';
import type { PublicUser } from '../auth/user';
import {
  getSessionsByUser,
  addScoutNote,
  getNotesForSession,
  getAllScoutNotes,
} from '../data/sessionRepository';

export interface ParticipantSummary extends PublicUser {
  sessions: SessionResult[];
  totalReps: number;
  totalSessions: number;
  averageAccuracy: number;
  lastActive: string | null;
}

export function useScoutData() {
  const [participants, setParticipants] = useState<ParticipantSummary[]>([]);
  const [notesBySession, setNotesBySession] = useState<Record<number, ScoutNote[]>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const users = listParticipants();
      const withSessions = await Promise.all(
        users.map(async (u) => {
          const sessions = await getSessionsByUser(u.email);
          const totalReps = sessions.reduce((sum, s) => sum + s.validReps, 0);
          const totalSessions = sessions.length;
          const averageAccuracy =
            totalSessions > 0
              ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions)
              : 0;
          const lastActive = sessions[0]?.timestamp ?? null;
          return { ...u, sessions, totalReps, totalSessions, averageAccuracy, lastActive };
        })
      );
      // Most recently active athletes first.
      withSessions.sort((a, b) => (b.lastActive ?? '').localeCompare(a.lastActive ?? ''));
      setParticipants(withSessions);

      const allNotes = await getAllScoutNotes();
      const grouped: Record<number, ScoutNote[]> = {};
      for (const note of allNotes) {
        (grouped[note.sessionId] ??= []).push(note);
      }
      setNotesBySession(grouped);
    } catch (err) {
      console.error('Failed to load scout data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addNote = useCallback(
    async (sessionId: number, scoutEmail: string, scoutName: string, note: string) => {
      await addScoutNote({ sessionId, scoutEmail, scoutName, note, createdAt: new Date().toISOString() });
      const notes = await getNotesForSession(sessionId);
      setNotesBySession((prev) => ({ ...prev, [sessionId]: notes }));
    },
    []
  );

  return { participants, notesBySession, loading, refresh, addNote };
}
