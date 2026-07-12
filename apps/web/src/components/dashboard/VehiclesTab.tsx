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
      <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-2xl neumorph-outset">
        <div className="relative rounded-xl neumorph-inset group border border-slate-200/5 w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/70" />
          <input
            type="text"
            placeholder="Search vehicles (Reg#, Model)..."
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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs text-primary font-extrabold focus:outline-none py-1.5 px-2 cursor-pointer"
              >
                <option value="" className="bg-card-theme text-primary">All Types</option>
                <option value="Van" className="bg-card-theme text-primary">Vans</option>
                <option value="Truck" className="bg-card-theme text-primary">Trucks</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl neumorph-inset px-2 py-0.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-primary font-extrabold focus:outline-none py-1.5 px-2 cursor-pointer"
            >
              <option value="" className="bg-card-theme text-primary">All Statuses</option>
              <option value="Available" className="bg-card-theme text-primary">Available</option>
              <option value="On Trip" className="bg-card-theme text-primary">On Trip</option>
              <option value="In Shop" className="bg-card-theme text-primary">In Shop</option>
              <option value="Retired" className="bg-card-theme text-primary">Retired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Registry Table */}
      <div className="rounded-2xl overflow-hidden neumorph-outset">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-transparent border-b border-theme text-secondary text-xs font-extrabold tracking-wider">
              <th className="px-6 py-4">Reg Number</th>
              <th className="px-6 py-4">Model & Type</th>
              <th className="px-6 py-4">Max Capacity</th>
              <th className="px-6 py-4">Odometer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Operational Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme text-sm font-semibold text-primary">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-secondary font-bold bg-transparent">
                  No vehicles found matching filters.
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id} className="hover-row transition-colors">
                  <td className="px-6 py-4 font-extrabold text-orange">{v.registrationNumber}</td>
                  <td className="px-6 py-4">
                    <span className="block text-primary font-extrabold">{v.model}</span>
                    <span className="block text-xs text-secondary font-semibold mt-0.5">{v.type}</span>
                  </td>
                  <td className="px-6 py-4 text-primary/80">{v.loadCapacity} kg</td>
                  <td className="px-6 py-4 font-bold text-secondary">{v.odometer.toLocaleString()} km</td>
                  <td className="px-6 py-4">
                    <Badge variant={getBadgeVariant(v.status)}>{v.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-orange font-extrabold">${getVehicleExpensesSum(v.id).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
