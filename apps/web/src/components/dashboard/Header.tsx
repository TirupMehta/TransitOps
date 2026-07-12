import React from 'react';
import type { User } from '../../types';
import { logout } from '../../utils/api';
import { Sun, Moon, Search, LogOut } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  user: User;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, user, theme, onToggleTheme }) => {
  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Overview Dashboard';
      case 'fleet': return 'Fleet Registry';
      case 'drivers': return 'Driver Profiles';
      case 'trips': return 'Trip Dispatcher';
      case 'maintenance': return 'Maintenance Shop';
      case 'expenses': return 'Fuel & Expenses';
      case 'analytics': return 'Reports & Analytics';
      case 'settings': return 'Settings & RBAC';
      default: return tab;
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-16 border-b border-theme bg-card-theme flex items-center justify-between px-8 shrink-0">
      {/* Left side: Breadcrumb & Search */}
      <div className="flex items-center gap-8 flex-1">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-secondary text-xs font-extrabold tracking-wider">TransitOps</span>
          <span className="text-secondary/20 text-lg font-light">/</span>
          <h2 className="text-sm font-extrabold text-primary tracking-widest font-sans">
            {getBreadcrumbTitle(activeTab)}
          </h2>
        </div>

        {/* Global Search Bar from Mockup */}
        <div className="relative rounded-xl neumorph-inset group border border-slate-200/5 w-64 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary/60" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-1.5 bg-transparent text-xs focus:outline-none text-primary font-semibold"
          />
        </div>
      </div>
      
      {/* Right side: Actions, Profile, and Sign Out */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Theme Switcher */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl neumorph-btn-vanilla flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-orange" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-orange" />
          )}
        </button>

        {/* User Info (Mockup style: Name, Badge) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-primary hidden sm:inline">
            {user.fullName || user.email.split('@')[0]}
          </span>
          <span className="neumorph-inset text-orange px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-widest border border-theme">
            {user.role}
          </span>
        </div>

        {/* Logout Button from Mockup */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 rounded-xl neumorph-btn-vanilla flex items-center justify-center cursor-pointer hover:text-red-500 hover:border-red-500/20 shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
