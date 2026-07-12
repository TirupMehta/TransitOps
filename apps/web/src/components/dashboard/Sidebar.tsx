import React from 'react';
import type { User } from '../../types';
import { logout } from '../../utils/api';
import { routes } from '../../routes';
import { Truck, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user }) => {
  const navItems = routes;

  return (
    <aside className="w-64 bg-slate-900 text-slate-350 flex flex-col justify-between shrink-0 h-full">
      <div>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 bg-slate-950/40">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white tracking-wide block">TransitOps</span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Operations Hub</span>
          </div>
        </div>

        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/20 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user.initials}
          </div>
          <div className="overflow-hidden">
            <span className="block text-sm font-bold text-white truncate leading-tight">{user.fullName || user.email}</span>
            <span className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase leading-none mt-1">{user.role || 'User'}</span>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/35 hover:text-rose-455 rounded-xl text-sm font-semibold transition-all text-slate-400 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
