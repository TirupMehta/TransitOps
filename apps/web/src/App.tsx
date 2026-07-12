import { useState, useEffect } from 'react';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { getStoredUser, getStoredToken } from './utils/api';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

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

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
      setToken(getStoredToken());
    };

    window.addEventListener('auth-changed', handleAuthChange);
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  const handleLoginSuccess = (loggedInUser: User, sessionToken: string) => {
    setUser(loggedInUser);
    setToken(sessionToken);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <>
      {user && token ? (
        <DashboardView user={user} theme={theme} onToggleTheme={toggleTheme} />
      ) : (
        <div className="relative">
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl neumorph-btn-vanilla text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          <LoginView onLoginSuccess={handleLoginSuccess} />
        </div>
      )}
    </>
  );
}

export default App;
