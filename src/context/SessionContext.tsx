// Session context — provides a single shared, per-athlete session-history
// store (backed by Dexie/IndexedDB via useSessionHistory) to every screen,
// scoped automatically to whichever participant is currently logged in.
import { createContext, useContext, type ReactNode } from 'react';
import { useSessionHistory, type UseSessionHistoryResult } from '../hooks/useSessionHistory';
import { useAuth } from '../auth/AuthContext';

const SessionContext = createContext<UseSessionHistoryResult | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const value = useSessionHistory(user?.email ?? null);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext(): UseSessionHistoryResult {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSessionContext must be used within a <SessionProvider>');
  }
  return ctx;
}
