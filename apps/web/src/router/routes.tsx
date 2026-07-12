import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { User } from '../types';

const LoginView = lazy(() => import('../components/LoginView').then(m => ({ default: m.LoginView })));
const DashboardView = lazy(() => import('../components/DashboardView').then(m => ({ default: m.DashboardView })));

interface AppRoutesProps {
  user: User | null;
  token: string | null;
  onLoginSuccess: (user: User, sessionToken: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-app-theme flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-orange/30 border-t-orange animate-spin" />
      <span className="text-xs font-bold text-secondary tracking-widest uppercase">Loading...</span>
    </div>
  </div>
);

export const AppRoutes = ({ user, token, onLoginSuccess, theme, onToggleTheme }: AppRoutesProps) => {
  const isAuthenticated = Boolean(user && token);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard/overview" replace />
            : (
              <Suspense fallback={<LoadingScreen />}>
                <div className="relative">
                  <div className="absolute top-4 right-4 z-50">
                    <button
                      onClick={onToggleTheme}
                      className="p-3 rounded-2xl neumorph-btn-vanilla text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                    </button>
                  </div>
                  <LoginView onLoginSuccess={onLoginSuccess} />
                </div>
              </Suspense>
            )
        }
      />
      <Route
        path="/dashboard/*"
        element={
          isAuthenticated
            ? (
              <Suspense fallback={<LoadingScreen />}>
                <DashboardView user={user!} theme={theme} onToggleTheme={onToggleTheme} />
              </Suspense>
            )
            : <Navigate to="/" replace />
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard/overview' : '/'} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
