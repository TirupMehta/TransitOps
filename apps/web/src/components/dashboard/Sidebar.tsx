import React from 'react';
import type { User } from '../../types';
import { logout } from '../../utils/api';
import { routes } from '../../routes';
import { Truck, LogOut, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: User;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const isTabAllowed = (tabId: string, role?: string): boolean => {
  if (!role) return true;
  const r = role.toLowerCase();
  
  // Fleet Manager can access everything
  if (r.includes('manager')) {
    return true;
  }
  
  // Driver / Dispatcher scope: Dashboard, Fleet, Drivers (view), Trips (edit), Settings
  if (r.includes('dispatcher') || r.includes('driver')) {
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

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  isCollapsed,
  setIsCollapsed,
}) => {
  // Filter navigation items by role
  const navItems = routes.filter(item => isTabAllowed(item.id, user.role));

  // Group routes into logical sections
  const sections = [
    {
      title: 'Operations',
      items: navItems.filter(item => ['dashboard', 'trips'].includes(item.id))
    },
    {
      title: 'Assets & Crew',
      items: navItems.filter(item => ['fleet', 'drivers'].includes(item.id))
    },
    {
      title: 'Finance & Logistics',
      items: navItems.filter(item => ['maintenance', 'expenses'].includes(item.id))
    },
    {
      title: 'System',
      items: navItems.filter(item => ['analytics', 'settings'].includes(item.id))
    }
  ].filter(sec => sec.items.length > 0);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside
      className={`bg-card-theme text-secondary flex flex-col justify-between shrink-0 h-full border-r border-theme shadow-[4px_0_12px_rgba(0,0,0,0.05)] transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div
          className={`flex items-center justify-between py-5 border-b border-theme bg-card-theme ${
            isCollapsed ? 'px-4 flex-col gap-4' : 'px-6'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-[#b84a14] p-2 rounded-xl text-white shadow-md shadow-[#b84a14]/15">
              <Truck className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-extrabold text-primary tracking-wide block font-sans">TransitOps</span>
                <span className="text-xs text-[#87786f] font-bold tracking-wider">Operations Hub</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg neumorph-btn-vanilla text-secondary cursor-pointer hover:text-orange flex items-center justify-center shadow-sm"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation list grouped in sections */}
        <nav className={`p-4 space-y-4 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {sections.map((section, idx) => (
            <div key={section.title} className="w-full space-y-1.5">
              {/* Section Header */}
              {!isCollapsed ? (
                <div className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest px-4 pt-2 pb-1">
                  {section.title}
                </div>
              ) : idx > 0 ? (
                <div className="w-8 border-t border-theme/40 my-2 self-center mx-auto" />
              ) : null}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative group w-full flex items-center rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5 text-left'
                    } ${
                      isActive
                        ? 'neumorph-btn-orange shadow-md'
                        : 'text-secondary hover:text-orange hover:bg-app-theme border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-secondary group-hover:text-orange'}`} />
                    {!isCollapsed && <span>{item.label}</span>}

                    {/* Collapsed Tooltip on Hover */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-card-theme text-primary text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-50 border border-theme">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* User profile & Logout footer */}
      <div className="p-4 border-t border-theme bg-card-theme space-y-3">
        <div className={`flex items-center gap-3 py-1 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
          <div className="w-9 h-9 rounded-xl text-orange neumorph-inset flex items-center justify-center font-extrabold text-sm shrink-0">
            {user.initials}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <span className="block text-sm font-extrabold text-primary truncate leading-tight">{user.fullName || user.email}</span>
              <span className="block text-[11px] text-[#87786f] font-bold tracking-wider leading-none mt-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-orange shrink-0" />
                {user.role || 'User'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-500/5 border border-transparent hover:border-[#eccbc1]/20 hover:text-red-500 rounded-xl text-xs font-extrabold transition-all text-secondary cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
