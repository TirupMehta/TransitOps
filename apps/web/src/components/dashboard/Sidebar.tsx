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
    <aside className="w-64 bg-[#faf5e9] text-[#2e2520] flex flex-col justify-between shrink-0 h-full border-r border-[#eedebd]/60 shadow-[4px_0_12px_rgba(224,212,188,0.15)]">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#eedebd]/50 bg-[#faf5e9]">
          <div className="bg-[#b84a14] p-2 rounded-xl text-white shadow-md shadow-[#b84a14]/15">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-[#2e2520] tracking-wide block font-sans">TransitOps</span>
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
                    : 'text-[#87786f] hover:text-[#b84a14] hover:bg-[#eedebd]/30 border border-transparent'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-[#87786f] group-hover:text-[#b84a14]'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout footer */}
      <div className="p-4 border-t border-[#eedebd]/50 bg-[#faf5e9] space-y-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl text-[#b84a14] bg-[#faf5e9] shadow-[inset_2px_2px_4px_#e0d4bc,inset_-2px_-2px_4px_#ffffff] border border-white/20 flex items-center justify-center font-extrabold text-sm shrink-0">
            {user.initials}
          </div>
          <div className="overflow-hidden">
            <span className="block text-sm font-extrabold text-[#2e2520] truncate leading-tight">{user.fullName || user.email}</span>
            <span className="block text-[9px] text-[#87786f] font-extrabold tracking-wider uppercase leading-none mt-1">{user.role || 'User'}</span>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#f9ebe6] border border-transparent hover:border-[#eccbc1]/60 hover:text-[#8c2510] rounded-xl text-xs font-extrabold transition-all text-[#87786f] cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
