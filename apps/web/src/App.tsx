import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import type { User } from './types';

const AppRoutes = lazy(() => import('./router/routes'));

const LoadingScreen = () => (
  <div className="min-h-screen bg-app-theme flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-orange/30 border-t-orange animate-spin" />
      <span className="text-xs font-bold text-secondary tracking-widest uppercase">Loading...</span>
    </div>
  </div>
);

function App() {
  const { user, token, mutateUser } = useAuth();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  // Apply theme class to <html>
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Re-sync SWR user state when the auth-changed event fires
  // (covers token cleared from Axios 401 interceptor)
  useEffect(() => {
    const handleAuthChange = () => {
      mutateUser(undefined, { revalidate: true });
    };
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, [mutateUser]);

  const handleLoginSuccess = async (loggedInUser: User, _sessionToken: string) => {
    await mutateUser(loggedInUser);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <AppRoutes
          user={user}
          token={token}
          onLoginSuccess={handleLoginSuccess}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
