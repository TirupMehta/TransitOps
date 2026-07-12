import React from 'react';
import type { User } from '../../types';

interface HeaderProps {
  activeTab: string;
  user: User;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, user }) => {
  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Overview Dashboard';
      case 'vehicles': return 'Vehicle Registry';
      case 'drivers': return 'Driver Management';
      case 'trips': return 'Trip Management';
      case 'maintenance': return 'Maintenance Shop';
      case 'expenses': return 'Fuel & Expenses';
      case 'reports': return 'Reports & Analytics';
      default: return tab;
    }
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-sm font-semibold tracking-wide">TransitOps</span>
        <span className="text-slate-300 text-lg">/</span>
        <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">
          {getBreadcrumbTitle(activeTab)}
        </h2>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {user.role} Portal
        </span>
      </div>
    </header>
  );
};
