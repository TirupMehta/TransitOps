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
      <div className="flex justify-between items-center gap-4 p-4 rounded-2xl neumorph-outset">
        <div className="relative rounded-xl neumorph-inset group border border-slate-200/5 w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/70" />
          <input
            type="text"
            placeholder="Search maintenance logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none text-primary font-bold"
          />
        </div>
      </div>

      {/* Maintenance table */}
      <div className="rounded-2xl overflow-hidden neumorph-outset">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-transparent border-b border-theme text-secondary text-xs font-extrabold tracking-wider">
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Issue Description</th>
              <th className="px-6 py-4">Cost</th>
              <th className="px-6 py-4">Date Sent</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme text-sm font-semibold text-primary">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-secondary font-bold bg-transparent">
                  No maintenance records logged.
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const v = vehicles.find((veh) => veh.id === m.vehicleId);
                return (
                  <tr key={m.id} className="hover-row transition-colors">
                    <td className="px-6 py-4 font-extrabold text-primary">
                      <span className="block text-orange">{v?.registrationNumber}</span>
                      <span className="block text-xs text-secondary font-semibold mt-0.5">{v?.model}</span>
                    </td>
                    <td className="px-6 py-4 text-primary font-semibold">{m.description}</td>
                    <td className="px-6 py-4 font-extrabold text-orange">${m.cost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-secondary font-bold">{m.date}</td>
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
