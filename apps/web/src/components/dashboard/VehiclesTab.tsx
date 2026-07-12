import React, { useState } from 'react';
import type { Vehicle, VehicleStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Search, Filter } from 'lucide-react';

interface VehiclesTabProps {
  vehicles: Vehicle[];
  getVehicleExpensesSum: (id: number) => number;
}

export const VehiclesTab: React.FC<VehiclesTabProps> = ({
  vehicles,
  getVehicleExpensesSum,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getBadgeVariant = (status: VehicleStatus) => {
    switch (status) {
      case 'Available': return 'success';
      case 'On Trip': return 'info';
      case 'In Shop': return 'warning';
      case 'Retired': return 'danger';
    }
  };

  const filtered = vehicles.filter((v) => {
    const matchesSearch = v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
                          v.model.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? v.type === typeFilter : true;
    const matchesStatus = statusFilter ? v.status === statusFilter : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Actions toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vehicles (Reg#, Model)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800 font-semibold"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-slate-200 rounded-xl text-sm px-3.5 py-2 focus:outline-none focus:border-indigo-500 bg-slate-50 text-slate-700 font-bold cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="Van">Vans</option>
              <option value="Truck">Trucks</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl text-sm px-3.5 py-2 focus:outline-none focus:border-indigo-500 bg-slate-50 text-slate-700 font-bold cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Vehicles Registry Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Reg Number</th>
              <th className="px-6 py-4">Model & Type</th>
              <th className="px-6 py-4">Max Capacity</th>
              <th className="px-6 py-4">Odometer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Operational Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                  No vehicles found matching filters.
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{v.registrationNumber}</td>
                  <td className="px-6 py-4">
                    <span className="block text-slate-800 font-semibold">{v.model}</span>
                    <span className="block text-xs text-slate-400 font-semibold mt-0.5">{v.type}</span>
                  </td>
                  <td className="px-6 py-4">{v.loadCapacity} kg</td>
                  <td className="px-6 py-4 font-semibold text-slate-600">{v.odometer.toLocaleString()} km</td>
                  <td className="px-6 py-4">
                    <Badge variant={getBadgeVariant(v.status)}>{v.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-850 font-bold">${getVehicleExpensesSum(v.id).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
