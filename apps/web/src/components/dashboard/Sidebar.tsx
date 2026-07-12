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
      className={`bg-card-theme flex flex-col justify-between shrink-0 h-full border-r border-theme shadow-[4px_0_12px_rgba(0,0,0,0.05)] transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme bg-card-theme h-16 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-black text-white w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-base shrink-0 shadow-sm cursor-pointer hover:opacity-90">
              T
            </div>
            <div className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-32 opacity-100'}`}>
              <span className="font-extrabold text-primary text-xs tracking-wide block font-sans truncate">TransitOps</span>
              <span className="text-[8px] text-secondary font-bold tracking-wider uppercase truncate mt-0.5 block">Operations Hub</span>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-app-theme text-secondary cursor-pointer hover:text-orange shrink-0 flex items-center justify-center"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Starred Section */}
          <div className="space-y-1">
            <span className={`text-[8px] font-extrabold uppercase tracking-widest text-secondary/40 px-3 block mb-1.5 transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'h-0 opacity-0 overflow-hidden mb-0' : 'h-auto opacity-100'}`}>
              Starred
            </span>
            {navItems.slice(0, 3).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={`star-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative group w-full flex items-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-left'
                  } ${
                    isActive
                      ? 'bg-orange text-white shadow-sm'
                      : 'text-secondary hover:text-orange hover:bg-app-theme'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-secondary group-hover:text-orange'}`} />
                  <span className={`transition-all duration-300 whitespace-nowrap truncate ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                    {item.label}
                  </span>

                  {/* Collapsed Tooltip on Hover */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-card-theme text-primary text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-50 border border-theme">
                      {item.label} (Starred)
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Registry & Logs Section */}
          <div className="space-y-1">
            <span className={`text-[8px] font-extrabold uppercase tracking-widest text-secondary/40 px-3 block mb-1.5 transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'h-0 opacity-0 overflow-hidden mb-0' : 'h-auto opacity-100'}`}>
              Registry & Logs
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={`list-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative group w-full flex items-center justify-between rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 text-left'
                  } ${
                    isActive
                      ? 'bg-orange text-white shadow-sm'
                      : 'text-secondary hover:text-orange hover:bg-app-theme'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-secondary group-hover:text-orange'}`} />
                    <span className={`transition-all duration-300 whitespace-nowrap truncate ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                      {item.label}
                    </span>
                  </div>
                  {!isCollapsed && item.id === 'vehicles' && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#c82046]/10 text-[#c82046] text-[8px] font-extrabold shrink-0">
                      Active
                    </span>
                  )}

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
        </div>
      </div>

      {/* User profile & Logout footer */}
      <div className="p-3 border-t border-theme bg-card-theme space-y-3">
        <div className={`flex items-center gap-3 py-1 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
          <div className="w-8.5 h-8.5 rounded-full text-orange neumorph-inset flex items-center justify-center font-extrabold text-[10px] shrink-0 uppercase border border-theme">
            {user.initials}
          </div>
          <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <span className="block text-xs font-extrabold text-primary truncate leading-tight">{user.fullName || user.email}</span>
            <span className="block text-[8px] text-secondary font-extrabold tracking-wider uppercase mt-1 leading-none">{user.role || 'User'}</span>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-500/5 border border-transparent hover:border-[#eccbc1]/20 hover:text-red-500 rounded-xl text-xs font-extrabold transition-all text-secondary cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className={`transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};
