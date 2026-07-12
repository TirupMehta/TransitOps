import React, { useState } from 'react';
import type { Driver, DriverStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Search, Filter, AlertTriangle } from 'lucide-react';

interface DriversTabProps {
  drivers: Driver[];
}

export const DriversTab: React.FC<DriversTabProps> = ({ drivers }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getBadgeVariant = (status: DriverStatus) => {
    switch (status) {
      case 'Available': return 'success';
      case 'On Trip': return 'info';
      case 'Off Duty': return 'neutral';
      case 'Suspended': return 'danger';
    }
  };

  const filtered = drivers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                          d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? d.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Actions Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search drivers (Name, DL)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800 font-semibold"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-xl text-sm px-3.5 py-2 focus:outline-none focus:border-indigo-500 bg-slate-50 text-slate-700 font-bold cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers List Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Driver Name</th>
              <th className="px-6 py-4">License Category / Expiry</th>
              <th className="px-6 py-4">Contact Number</th>
              <th className="px-6 py-4">Safety Score</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                  No drivers found matching filters.
                </td>
              </tr>
            ) : (
              filtered.map((d) => {
                const isExpired = new Date(d.licenseExpiryDate) < new Date();
                return (
                  <tr key={d.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{d.name}</td>
                    <td className="px-6 py-4">
                      <span className="block text-slate-800 font-semibold">{d.licenseNumber} ({d.licenseCategory})</span>
                      <span className={`inline-flex items-center gap-1 text-xs mt-1 font-bold ${isExpired ? 'text-rose-600' : 'text-slate-400'}`}>
                        {isExpired && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                        Exp: {d.licenseExpiryDate} {isExpired ? '(Expired)' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-650">{d.contactNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold px-2 py-0.5 rounded text-xs ${d.safetyScore >= 90 ? 'text-emerald-700 bg-emerald-50' : d.safetyScore >= 80 ? 'text-blue-700 bg-blue-50' : 'text-amber-700 bg-amber-50'}`}>
                        {d.safetyScore}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getBadgeVariant(d.status)}>{d.status}</Badge>
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
