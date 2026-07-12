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
      <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-2xl neumorph-outset">
        <div className="relative rounded-xl neumorph-inset group border border-slate-200/5 w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/70" />
          <input
            type="text"
            placeholder="Search drivers (Name, DL)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none text-primary font-bold"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-secondary" />
            <div className="rounded-xl neumorph-inset px-2 py-0.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-primary font-extrabold focus:outline-none py-1.5 px-2 cursor-pointer"
              >
                <option value="" className="bg-card-theme text-primary">All Statuses</option>
                <option value="Available" className="bg-card-theme text-primary">Available</option>
                <option value="On Trip" className="bg-card-theme text-primary">On Trip</option>
                <option value="Off Duty" className="bg-card-theme text-primary">Off Duty</option>
                <option value="Suspended" className="bg-card-theme text-primary">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers List Table */}
      <div className="rounded-2xl overflow-hidden neumorph-outset">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-transparent border-b border-theme text-secondary text-xs font-extrabold tracking-wider">
              <th className="px-6 py-4">Driver Name</th>
              <th className="px-6 py-4">License Category / Expiry</th>
              <th className="px-6 py-4">Contact Number</th>
              <th className="px-6 py-4">Safety Score</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme text-sm font-semibold text-primary">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-secondary font-bold bg-transparent">
                  No drivers found matching filters.
                </td>
              </tr>
            ) : (
              filtered.map((d) => {
                const isExpired = new Date(d.licenseExpiryDate) < new Date();
                return (
                  <tr key={d.id} className="hover-row transition-colors">
                    <td className="px-6 py-4 font-extrabold text-primary">{d.name}</td>
                    <td className="px-6 py-4">
                      <span className="block text-orange font-extrabold">{d.licenseNumber} ({d.licenseCategory})</span>
                      <span className={`inline-flex items-center gap-1 text-xs mt-1 font-bold ${isExpired ? 'text-red-500' : 'text-secondary'}`}>
                        {isExpired && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                        Exp: {d.licenseExpiryDate} {isExpired ? '(Expired)' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary font-bold">{d.contactNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`font-extrabold px-2 py-0.5 rounded text-xs ${d.safetyScore >= 90 ? 'text-emerald-700 bg-emerald-50/15' : d.safetyScore >= 80 ? 'text-blue-700 bg-blue-50/15' : 'text-amber-700 bg-amber-50/15'}`}>
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
