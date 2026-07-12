import React, { useState } from 'react';
import type { User } from '../../types';
import { logout } from '../../utils/api';
import { Sun, Moon, Search, LogOut, ChevronDown } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  user: User;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, theme, onToggleTheme }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-16 border-b border-theme bg-card-theme flex items-center justify-between px-8 shrink-0 relative">
      {/* Left side: Global Search Bar */}
      <div className="flex items-center gap-8 flex-1">
        <div className="relative rounded-xl neumorph-inset group border border-theme w-64 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary/60" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-1.5 bg-transparent text-xs focus:outline-none text-primary font-semibold"
          />
        </div>
      </div>
      
      {/* Right side: Interactive Dropdown Menu */}
      <div className="relative shrink-0 z-30">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-theme bg-card-theme hover:bg-inset-theme cursor-pointer select-none transition-all duration-150"
        >
          <div className="w-7 h-7 rounded-lg text-primary bg-inset-theme flex items-center justify-center font-extrabold text-xs shrink-0 border border-theme/20">
            {user.initials}
          </div>
          <span className="text-xs font-bold text-primary hidden sm:inline select-none">
            {user.fullName || user.email.split('@')[0]}
          </span>
          <ChevronDown 
            className="w-3.5 h-3.5 text-secondary/60 transition-transform duration-200" 
            style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }} 
          />
        </button>

        {isDropdownOpen && (
          <>
            {/* Overlay click catcher */}
            <div 
              className="fixed inset-0 z-35" 
              onClick={() => setIsDropdownOpen(false)} 
            />
            <div className="absolute right-0 mt-2 w-56 rounded-2xl neumorph-outset bg-card-theme border border-theme shadow-lg p-2 z-40 space-y-1 animate-fade-in text-left">
              {/* User Identity Info Header */}
              <div className="px-3 py-2 space-y-1">
                <span className="block text-xs font-extrabold text-primary truncate leading-tight">
                  {user.fullName || user.email}
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-secondary font-bold truncate tracking-wider uppercase">
                    {user.role}
                  </span>
                  <span className="text-[9px] text-secondary/40 font-mono tracking-widest uppercase">
                    RBAC
                  </span>
                </div>
              </div>
              
              <div className="border-t border-theme/40 my-1" />

              {/* Toggle Theme Menu Action */}
              <button
                onClick={() => {
                  onToggleTheme();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-bold text-secondary hover:text-primary hover:bg-app-theme rounded-xl cursor-pointer transition-all"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-orange" /> : <Moon className="w-4 h-4 text-orange" />}
                  <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                </span>
                <span className="text-[9px] bg-inset-theme border border-theme text-secondary/60 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {theme}
                </span>
              </button>

              {/* Sign Out Menu Action */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 rounded-xl cursor-pointer transition-all"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
