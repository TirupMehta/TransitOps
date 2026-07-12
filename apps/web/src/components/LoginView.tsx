import React from 'react';
import { LoginCard } from './auth/LoginCard';
import type { User } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a120b] via-[#251a11] to-[#140e08] p-4 md:p-6">
      <LoginCard onLoginSuccess={onLoginSuccess} />
    </div>
  );
};
