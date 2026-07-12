import { useState, useEffect } from 'react';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { getStoredUser, getStoredToken } from './utils/api';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());

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

  return (
    <>
      {user && token ? (
        <DashboardView user={user} />
      ) : (
        <LoginView onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;
