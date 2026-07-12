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
      <div className="flex justify-between items-center gap-4 p-4 rounded-2xl neumorph-outset border border-white/50">
        <div className="relative rounded-xl neumorph-inset group border border-slate-200/25 w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#87786f]/70" />
          <input
            type="text"
            placeholder="Search expenses (Vehicle Reg, details)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none text-[#2e2520] font-bold"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#87786f]" />
            <div className="rounded-xl bg-[#faf5e9] shadow-[inset_1.5px_1.5px_3px_#e0d4bc,inset_-1.5px_-1.5px_3px_#ffffff] border border-white/10 px-2 py-0.5">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs text-[#2e2520] font-extrabold focus:outline-none py-1.5 px-2 cursor-pointer"
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
      </div>

      {/* Expenses list */}
      <div className="rounded-2xl overflow-hidden neumorph-outset border border-white/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#faf5e9] border-b border-[#eedebd]/60 text-[#87786f] text-xs font-extrabold uppercase tracking-wider">
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eedebd]/40 text-sm font-semibold text-[#2e2520]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[#87786f] font-bold bg-[#faf5e9]/50">
                  No expense records logged.
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const v = vehicles.find((veh) => veh.id === e.vehicleId);
                return (
                  <tr key={e.id} className="hover:bg-[#eedebd]/20 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-[#2e2520]">{v?.registrationNumber || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getBadgeVariant(e.type)}>{e.type}</Badge>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[#b84a14]">${e.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-[#87786f] font-bold">{e.date}</td>
                    <td className="px-6 py-4 text-[#87786f] font-semibold">{e.description}</td>
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
