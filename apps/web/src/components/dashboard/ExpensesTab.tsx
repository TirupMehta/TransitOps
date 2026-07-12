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
      <div className="flex justify-between items-center gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses (Vehicle Reg, details)..."
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
              <option value="">All Categories</option>
              <option value="Fuel">Fuel</option>
              <option value="Toll">Toll</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses list */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                  No expense records logged.
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const v = vehicles.find((veh) => veh.id === e.vehicleId);
                return (
                  <tr key={e.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{v?.registrationNumber || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getBadgeVariant(e.type)}>{e.type}</Badge>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-800">${e.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{e.date}</td>
                    <td className="px-6 py-4 text-slate-500 font-semibold">{e.description}</td>
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
