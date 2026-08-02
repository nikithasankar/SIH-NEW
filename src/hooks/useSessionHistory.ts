// Session history hook — loads/saves sessions scoped to the current
// participant (identified by `userEmail`) so each athlete only ever sees
// their own workout history, and a scout can request another athlete's
// history via the same repository functions.
import { useCallback, useEffect, useState } from 'react';
import type { SessionResult } from '../models/sessionResult';
import {
  getAllSessions,
  getSessionsByUser,
  saveSession as saveSessionToDb,
  deleteSession as deleteSessionFromDb,
} from '../data/sessionRepository';
import { calculateStreak } from '../logic/streakCalculator';

export interface UseSessionHistoryResult {
  sessions: SessionResult[];
  loading: boolean;
  /** Persist a new session (tagged with the current user), refresh the
   * in-memory list, and return its new id. */
  saveSession: (session: Omit<SessionResult, 'userEmail'>) => Promise<number>;
  removeSession: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
  totalReps: number;
  totalSessions: number;
  averageAccuracy: number;
  streak: number;
}

export function useSessionHistory(userEmail: string | null): UseSessionHistoryResult {
  const [sessions, setSessions] = useState<SessionResult[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const all = userEmail ? await getSessionsByUser(userEmail) : await getAllSessions();
      setSessions(all);
    } catch (err) {
      console.error('Failed to load session history', err);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveSession = useCallback(
    async (session: Omit<SessionResult, 'userEmail'>) => {
      const id = await saveSessionToDb({ ...session, userEmail: userEmail ?? undefined });
      await refresh();
      return id;
    },
    [refresh, userEmail]
  );

  const removeSession = useCallback(
    async (id: number) => {
      await deleteSessionFromDb(id);
      await refresh();
    },
    [refresh]
  );

  const totalReps = sessions.reduce((sum, s) => sum + s.validReps, 0);
  const totalSessions = sessions.length;
  const averageAccuracy =
    totalSessions > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions)
      : 0;
  const streak = calculateStreak(sessions);

  return {
    sessions,
    loading,
    saveSession,
    removeSession,
    refresh,
    totalReps,
    totalSessions,
    averageAccuracy,
    streak,
  };
}
