import React, { useState } from 'react';
import type { Expense, Vehicle } from '../../types';
import { Badge } from '../ui/Badge';
import { Search, Filter } from 'lucide-react';

interface ExpensesTabProps {
  expenses: Expense[];
  vehicles: Vehicle[];
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  expenses,
  vehicles,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const getBadgeVariant = (type: Expense['type']) => {
    switch (type) {
      case 'Fuel': return 'info';
      case 'Maintenance': return 'warning';
      case 'Toll': return 'neutral';
      case 'Other': return 'danger';
    }
  };

  const filtered = expenses.filter((e) => {
    const v = vehicles.find((veh) => veh.id === e.vehicleId);
    const matchesSearch = (v?.registrationNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                          e.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? e.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center gap-4 p-4 rounded-2xl neumorph-outset">
        <div className="relative rounded-xl neumorph-inset group border border-slate-200/5 w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/70" />
          <input
            type="text"
            placeholder="Search expenses (Vehicle Reg, details)..."
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
                <option value="" className="bg-card-theme text-primary">All Categories</option>
                <option value="Fuel" className="bg-card-theme text-primary">Fuel</option>
                <option value="Toll" className="bg-card-theme text-primary">Toll</option>
                <option value="Maintenance" className="bg-card-theme text-primary">Maintenance</option>
                <option value="Other" className="bg-card-theme text-primary">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses list */}
      <div className="rounded-2xl overflow-hidden neumorph-outset">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-transparent border-b border-theme text-secondary text-xs font-extrabold tracking-wider">
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme text-sm font-semibold text-primary">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-secondary font-bold bg-transparent">
                  No expense records logged.
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const v = vehicles.find((veh) => veh.id === e.vehicleId);
                return (
                  <tr key={e.id} className="hover-row transition-colors">
                    <td className="px-6 py-4 font-extrabold text-primary">{v?.registrationNumber || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getBadgeVariant(e.type)}>{e.type}</Badge>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-orange">${e.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-secondary font-bold">{e.date}</td>
                    <td className="px-6 py-4 text-secondary font-semibold">{e.description}</td>
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
