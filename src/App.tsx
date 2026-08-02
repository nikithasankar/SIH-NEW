import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SessionProvider } from './context/SessionContext';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

import { LandingPage } from './screens/LandingPage';
import { LoginScreen } from './screens/LoginScreen';
import { ParticipantLayout } from './screens/ParticipantLayout';
import { HomeDashboard } from './screens/HomeDashboard';
import { ExercisePicker } from './screens/ExercisePicker';
import { AssessmentScreen } from './screens/AssessmentScreen';
import { PassportScreen } from './screens/PassportScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ScoutDashboard } from './screens/scout/ScoutDashboard';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <SessionProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginScreen />} />

              {/* Participant (protected, role-checked) */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute role="participant">
                    <ParticipantLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomeDashboard />} />
                <Route path="exercises" element={<ExercisePicker />} />
                <Route path="assess/:exerciseId" element={<AssessmentScreen />} />
                <Route path="passport/:sessionId" element={<PassportScreen />} />
                <Route path="history" element={<HistoryScreen />} />
                <Route path="progress" element={<ProgressScreen />} />
                <Route path="profile" element={<ProfileScreen />} />
              </Route>

              {/* Direct assessment route alias */}
              <Route
                path="/assessment/:exerciseId"
                element={
                  <ProtectedRoute role="participant">
                    <AssessmentScreen />
                  </ProtectedRoute>
                }
              />

              {/* Scout (protected, role-checked) */}
              <Route
                path="/scout"
                element={
                  <ProtectedRoute role="scout">
                    <ScoutDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </SessionProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
