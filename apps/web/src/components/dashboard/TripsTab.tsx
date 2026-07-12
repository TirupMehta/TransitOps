import React, { useState } from 'react';
import type { Trip, TripStatus, Vehicle, Driver } from '../../types';
import { Badge } from '../ui/Badge';
import { Search, Filter } from 'lucide-react';

interface TripsTabProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
}

export const TripsTab: React.FC<TripsTabProps> = ({ trips, vehicles, drivers }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getBadgeVariant = (status: TripStatus) => {
    switch (status) {
      case 'Draft': return 'neutral';
      case 'Dispatched': return 'info';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
    }
  };

  const filtered = trips.map(t => ({
    ...t,
    vehicle: vehicles.find(v => v.id === t.vehicleId),
    driver: drivers.find(d => d.id === t.driverId)
  })).filter((t) => {
    const matchesSearch = (t.source.toLowerCase().includes(search.toLowerCase()) ||
                          t.destination.toLowerCase().includes(search.toLowerCase()) ||
                          (t.driver?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (t.vehicle?.registrationNumber || '').toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search trips (Route, Driver, Vehicle)..."
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
              <option value="Draft">Draft</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trips list */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Route Info</th>
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Driver</th>
              <th className="px-6 py-4">Cargo & Distance</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                  No trips logged.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="block font-bold text-slate-900">{t.source}</span>
                    <span className="block text-xs text-slate-400 font-semibold mt-0.5">to {t.destination}</span>
                  </td>
                  <td className="px-6 py-4">
                    {t.vehicle ? (
                      <div>
                        <span className="block text-slate-800 font-semibold">{t.vehicle.registrationNumber}</span>
                        <span className="block text-xs text-slate-400 font-semibold mt-0.5">{t.vehicle.model}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-semibold">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {t.driver ? t.driver.name : <span className="text-slate-400 font-normal">Not assigned</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="block text-slate-800 font-bold">{t.cargoWeight} kg</span>
                    <span className="block text-xs text-slate-400 font-semibold mt-0.5">{t.distance} km</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getBadgeVariant(t.status)}>{t.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
