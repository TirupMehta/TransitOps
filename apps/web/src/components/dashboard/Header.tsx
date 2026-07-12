import React from 'react';
import type { User } from '../../types';
import { Sun, Moon } from 'lucide-react';

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
      case 'vehicles': return 'Vehicle Registry';
      case 'drivers': return 'Driver Management';
      case 'trips': return 'Trip Management';
      case 'maintenance': return 'Maintenance Shop';
      case 'expenses': return 'Fuel & Expenses';
      case 'reports': return 'Reports & ROI';
      default: return tab;
    }
  };

  return (
    <header className="h-16 border-b border-theme bg-card-theme flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-secondary text-xs font-extrabold tracking-wider uppercase">TransitOps</span>
        <span className="text-secondary/20 text-lg font-light">/</span>
        <h2 className="text-sm font-extrabold text-primary uppercase tracking-widest font-sans">
          {getBreadcrumbTitle(activeTab)}
        </h2>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl neumorph-btn-vanilla flex items-center justify-center cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-orange" />
          ) : (
            <Moon className="w-4 h-4 text-orange" />
          )}
        </button>

        {/* User Role Tag */}
        <span className="neumorph-inset text-orange px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-theme">
          {user.role}
        </span>
      </div>
    </header>
  );
};
