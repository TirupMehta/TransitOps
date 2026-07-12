import React from 'react';
import type { User } from '../../types';
import { logout } from '../../utils/api';
import { routes } from '../../routes';
import { Truck, LogOut, ShieldAlert } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: User;
}

export const isTabAllowed = (tabId: string, role?: string): boolean => {
  if (!role) return true;
  const r = role.toLowerCase();
  
  // Fleet Manager can access everything
  if (r.includes('manager')) {
    return true;
  }
  
  // Dispatcher scope: Dashboard, Fleet, Drivers (view), Trips (edit), Settings
  if (r.includes('dispatcher')) {
    return ['dashboard', 'fleet', 'drivers', 'trips', 'settings'].includes(tabId);
  }
  
  // Safety Officer scope: Dashboard, Drivers (edit), Trips (view), Settings
  if (r.includes('safety')) {
    return ['dashboard', 'fleet', 'drivers', 'trips', 'settings'].includes(tabId);
  }
  
  // Financial Analyst scope: Dashboard, Fleet (view), Fuel & Expenses (edit), Analytics (edit), Settings
  if (r.includes('finance') || r.includes('analyst')) {
    return ['dashboard', 'fleet', 'expenses', 'analytics', 'settings'].includes(tabId);
  }
  
  return true;
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user }) => {
  // Filter navigation items by role
  const navItems = routes.filter(item => isTabAllowed(item.id, user.role));

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-64 bg-card-theme text-secondary flex flex-col justify-between shrink-0 h-full border-r border-theme shadow-[4px_0_12px_rgba(0,0,0,0.05)]">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-theme bg-card-theme">
          <div className="bg-[#b84a14] p-2 rounded-xl text-white shadow-md shadow-[#b84a14]/15">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-primary tracking-wide block font-sans">TransitOps</span>
            <span className="text-[9px] text-[#87786f] font-extrabold tracking-wider uppercase">Operations Hub</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'neumorph-btn-orange shadow-md'
                    : 'text-secondary hover:text-orange hover:bg-app-theme border border-transparent'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-secondary group-hover:text-orange'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout footer */}
      <div className="p-4 border-t border-theme bg-card-theme space-y-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl text-orange neumorph-inset flex items-center justify-center font-extrabold text-sm shrink-0">
            {user.initials}
          </div>
          <div className="overflow-hidden">
            <span className="block text-sm font-extrabold text-primary truncate leading-tight">{user.fullName || user.email}</span>
            <span className="block text-[9px] text-[#87786f] font-extrabold tracking-wider uppercase leading-none mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-orange shrink-0" />
              {user.role || 'User'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-500/5 border border-transparent hover:border-[#eccbc1]/20 hover:text-red-500 rounded-xl text-xs font-extrabold transition-all text-secondary cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
