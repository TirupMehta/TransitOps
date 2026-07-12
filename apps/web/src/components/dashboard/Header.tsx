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
    <header className="h-16 border-b border-[#eedebd]/60 bg-[#faf5e9] flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-[#87786f] text-xs font-extrabold tracking-wider uppercase">TransitOps</span>
        <span className="text-[#eedebd] text-lg font-light">/</span>
        <h2 className="text-sm font-extrabold text-[#2e2520] uppercase tracking-widest font-sans">
          {getBreadcrumbTitle(activeTab)}
        </h2>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="bg-[#faf5e9] shadow-[inset_1.5px_1.5px_3px_#e0d4bc,inset_-1.5px_-1.5px_3px_#ffffff] text-[#b84a14] px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-white/10">
          {user.role}
        </span>
      </div>
    </header>
  );
};
