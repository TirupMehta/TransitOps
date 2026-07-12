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
      <div className="flex justify-between items-center gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search maintenance logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800 font-semibold"
          />
        </div>
      </div>

      {/* Maintenance table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Issue Description</th>
              <th className="px-6 py-4">Cost</th>
              <th className="px-6 py-4">Date Sent</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                  No maintenance records logged.
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const v = vehicles.find((veh) => veh.id === m.vehicleId);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <span>{v?.registrationNumber}</span>
                      <span className="block text-xs text-slate-400 font-semibold mt-0.5">{v?.model}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-750">{m.description}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">${m.cost.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{m.date}</td>
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
