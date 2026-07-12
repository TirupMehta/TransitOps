import React from 'react';
import type { User } from '../../types';
import { logout } from '../../utils/api';
import { routes } from '../../routes';
import { Truck, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

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
                <span className="text-[9px] text-[#87786f] font-extrabold tracking-wider">Operations Hub</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg neumorph-btn-vanilla text-secondary cursor-pointer hover:text-orange flex items-center justify-center"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className={`p-4 space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {navItems.map((item) => {
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
              <span className="block text-[9px] text-[#87786f] font-extrabold tracking-wider leading-none mt-1">{user.role || 'User'}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => logout()}
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
