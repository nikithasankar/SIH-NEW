import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { UserRole } from './user';

interface ProtectedRouteProps {
  role: UserRole;
  children: ReactNode;
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-2 border-t-[var(--color-primary)] border-white/10 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === 'scout' ? '/scout' : '/app'} replace />;
  }

  return <>{children}</>;
}
