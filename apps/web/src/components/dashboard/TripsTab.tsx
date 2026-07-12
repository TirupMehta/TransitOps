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
      <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-2xl neumorph-outset">
        <div className="relative rounded-xl neumorph-inset group border border-slate-200/5 w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/70" />
          <input
            type="text"
            placeholder="Search trips (Route, Driver, Vehicle)..."
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
                <option value="Draft" className="bg-card-theme text-primary">Draft</option>
                <option value="Dispatched" className="bg-card-theme text-primary">Dispatched</option>
                <option value="Completed" className="bg-card-theme text-primary">Completed</option>
                <option value="Cancelled" className="bg-card-theme text-primary">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Trips list */}
      <div className="rounded-2xl overflow-hidden neumorph-outset">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-transparent border-b border-theme text-secondary text-xs font-extrabold uppercase tracking-wider">
              <th className="px-6 py-4">Route Info</th>
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Driver</th>
              <th className="px-6 py-4">Cargo & Distance</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme text-sm font-semibold text-primary">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-secondary font-bold bg-transparent">
                  No trips logged.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-theme-bg-app hover:opacity-90 transition-colors">
                  <td className="px-6 py-4">
                    <span className="block font-extrabold text-primary">{t.source}</span>
                    <span className="block text-xs text-secondary font-bold mt-0.5">to {t.destination}</span>
                  </td>
                  <td className="px-6 py-4">
                    {t.vehicle ? (
                      <div>
                        <span className="block text-orange font-extrabold">{t.vehicle.registrationNumber}</span>
                        <span className="block text-xs text-secondary font-semibold mt-0.5">{t.vehicle.model}</span>
                      </div>
                    ) : (
                      <span className="text-secondary font-semibold">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-primary font-extrabold">
                    {t.driver ? t.driver.name : <span className="text-secondary font-normal">Not assigned</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="block text-primary font-extrabold">{t.cargoWeight} kg</span>
                    <span className="block text-xs text-secondary font-bold mt-0.5">{t.distance} km</span>
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
