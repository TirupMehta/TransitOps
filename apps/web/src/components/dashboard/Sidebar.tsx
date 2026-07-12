import React from 'react';
import type { User } from '../../types';
import { logout } from '../../utils/api';
import { routes } from '../../routes';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: User;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  isCollapsed,
  setIsCollapsed,
}) => {
  const navItems = routes;

  return (
    <aside
      className={`bg-card-theme flex shrink-0 h-full border-r border-theme transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Left Icon Strip (Narrow Panel) */}
      <div className="w-16 flex flex-col justify-between items-center py-4 border-r border-theme bg-card-theme shrink-0 h-full">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo (Pill like Codename.com 'C') */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-extrabold text-base shadow-sm cursor-pointer hover:opacity-90">
              T
            </div>
            {isCollapsed && (
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-1 rounded-lg hover:bg-app-theme text-secondary cursor-pointer"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Icons list */}
          <nav className="flex flex-col items-center gap-3 w-full px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                    isActive
                      ? 'bg-orange text-white shadow-sm font-extrabold'
                      : 'text-secondary hover:text-orange hover:bg-app-theme'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  
                  {/* Collapsed Tooltip on Hover */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-card-theme text-primary text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-50 border border-theme">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User initials & Settings */}
        <div className="flex flex-col items-center gap-4 w-full">
          <button
            onClick={() => logout()}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-secondary hover:text-rose-500 hover:bg-rose-500/5 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
          
          <div className="w-9 h-9 rounded-full text-orange neumorph-inset flex items-center justify-center font-extrabold text-[10px] shrink-0 cursor-default uppercase">
            {user.initials}
          </div>
        </div>
      </div>

      {/* Right Content Panel (Visible when expanded) */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto min-w-0">
          <div>
            {/* Header: Title */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-theme">
              <div>
                <span className="font-extrabold text-primary text-sm tracking-wide block font-sans">TransitOps</span>
                <span className="text-[9px] text-secondary font-bold tracking-wider uppercase mt-0.5 block">Operations Hub</span>
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-lg hover:bg-app-theme text-secondary cursor-pointer"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Sections */}
            <div className="space-y-6">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-secondary/40 px-2 block mb-2">Starred</span>
                <div className="space-y-1">
                  {navItems.slice(0, 3).map((item) => (
                    <button
                      key={`star-${item.id}`}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === item.id
                          ? 'text-orange bg-app-theme font-extrabold'
                          : 'text-secondary hover:text-orange hover:bg-app-theme/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-secondary/40 px-2 block mb-2">Registry & Logs</span>
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={`list-${item.id}`}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === item.id
                          ? 'text-orange bg-app-theme font-extrabold'
                          : 'text-secondary hover:text-orange hover:bg-app-theme/50'
                      }`}
                    >
                      <span className="truncate mr-2">{item.label}</span>
                      {item.id === 'vehicles' && <span className="px-1.5 py-0.5 rounded-md bg-[#c82046]/10 text-[#c82046] text-[8px] font-extrabold shrink-0">Active</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* User profile footer */}
          <div className="border-t border-theme pt-3 mt-4">
            <div className="flex items-center gap-2 px-1">
              <div className="overflow-hidden">
                <span className="block text-xs font-extrabold text-primary truncate leading-tight">{user.fullName || user.email}</span>
                <span className="block text-[8px] text-secondary font-extrabold tracking-wider uppercase mt-1">{user.role || 'User'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
