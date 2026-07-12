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
      case 'reports': return 'Reports & ROI';
      default: return tab;
    }
  };

  return (
    <header className="h-16 border-b border-[#eedebd]/10 bg-[#251c16] flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-[#87786f] text-xs font-extrabold tracking-wider uppercase">TransitOps</span>
        <span className="text-[#eedebd]/20 text-lg font-light">/</span>
        <h2 className="text-sm font-extrabold text-[#faf5e9] uppercase tracking-widest font-sans">
          {getBreadcrumbTitle(activeTab)}
        </h2>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="neumorph-inset text-[#b84a14] px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-white/5">
          {user.role}
        </span>
      </div>
    </header>
  );
};
