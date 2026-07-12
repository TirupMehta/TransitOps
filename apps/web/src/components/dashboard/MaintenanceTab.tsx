import React, { useState } from 'react';
import type { MaintenanceLog, Vehicle } from '../../types';
import { Badge } from '../ui/Badge';
import { Search } from 'lucide-react';

interface MaintenanceTabProps {
  maintenance: MaintenanceLog[];
  vehicles: Vehicle[];
}

export const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  maintenance,
  vehicles,
}) => {
  const [search, setSearch] = useState('');

  const filtered = maintenance.filter((m) => {
    const v = vehicles.find((veh) => veh.id === m.vehicleId);
    const textSearch = (v?.registrationNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                       (v?.model || '').toLowerCase().includes(search.toLowerCase()) ||
                       m.description.toLowerCase().includes(search.toLowerCase());
    return textSearch;
  });

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex justify-between items-center gap-4 p-4 rounded-2xl neumorph-outset border border-white/50">
        <div className="relative rounded-xl neumorph-inset group border border-slate-200/25 w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#87786f]/70" />
          <input
            type="text"
            placeholder="Search maintenance logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none text-[#2e2520] font-bold"
          />
        </div>
      </div>

      {/* Maintenance table */}
      <div className="rounded-2xl overflow-hidden neumorph-outset border border-white/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#faf5e9] border-b border-[#eedebd]/60 text-[#87786f] text-xs font-extrabold uppercase tracking-wider">
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Issue Description</th>
              <th className="px-6 py-4">Cost</th>
              <th className="px-6 py-4">Date Sent</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eedebd]/40 text-sm font-semibold text-[#2e2520]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[#87786f] font-bold bg-[#faf5e9]/50">
                  No maintenance records logged.
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const v = vehicles.find((veh) => veh.id === m.vehicleId);
                return (
                  <tr key={m.id} className="hover:bg-[#eedebd]/20 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-[#2e2520]">
                      <span className="block text-[#b84a14]">{v?.registrationNumber}</span>
                      <span className="block text-xs text-[#87786f] font-semibold mt-0.5">{v?.model}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-750">{m.description}</td>
                    <td className="px-6 py-4 font-extrabold text-[#b84a14]">${m.cost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-[#87786f] font-bold">{m.date}</td>
                    <td className="px-6 py-4">
                      <Badge variant={m.status === 'Active' ? 'warning' : 'success'}>
                        {m.status === 'Active' ? 'In Shop' : 'Closed'}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
