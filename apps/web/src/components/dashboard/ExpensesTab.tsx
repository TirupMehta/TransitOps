import React, { useState } from 'react';
import type { Expense, Vehicle } from '../../types';
import { Search, Fuel, Plus, AlertCircle, Lock as LockIcon } from 'lucide-react';
import { storage } from '../../utils/api';

interface ExpensesTabProps {
  expenses: Expense[];
  vehicles: Vehicle[];
  userRole?: string;
  onUpdate: () => void;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  expenses,
  vehicles,
  userRole,
  onUpdate,
}) => {
  const canWrite = userRole?.toLowerCase().includes('manager') || userRole?.toLowerCase().includes('finance') || userRole?.toLowerCase().includes('analyst');
  const [search, setSearch] = useState('');

  // Fuel Log Modal State
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [fuelVehicleId, setFuelVehicleId] = useState<number | null>(null);
  const [fuelLiters, setFuelLiters] = useState(30);
  const [fuelCost, setFuelCost] = useState(2500);
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);
  const [fuelError, setFuelError] = useState<string | null>(null);

  // Other Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expVehicleId, setExpVehicleId] = useState<number | null>(null);
  const [expType, setExpType] = useState<'Toll' | 'Other'>('Toll');
  const [expAmount, setExpAmount] = useState(150);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDesc, setExpDesc] = useState('Toll plaza payment');
  const [expError, setExpError] = useState<string | null>(null);

  // Group into Fuel logs and Other expenses
  const fuelLogs = expenses.filter(e => e.type === 'Fuel');
  const otherExpenses = expenses.filter(e => e.type !== 'Fuel');

  // Filter based on search query
  const filteredFuelLogs = fuelLogs.map(f => ({
    ...f,
    vehicle: vehicles.find(v => v.id === f.vehicleId)
  })).filter(f => {
    return (f.vehicle?.registrationNumber || '').toLowerCase().includes(search.toLowerCase()) ||
           (f.description || '').toLowerCase().includes(search.toLowerCase());
  });

  const trips = storage.getTrips();

  const filteredOtherExpenses = otherExpenses.map(o => {
    const v = vehicles.find(v => v.id === o.vehicleId);
    const t = trips.find(trip => trip.id === o.tripId);
    return {
      ...o,
      vehicleObj: v,
      tripObj: t
    };
  }).filter(o => {
    return (o.vehicleObj?.registrationNumber || '').toLowerCase().includes(search.toLowerCase()) ||
           (o.description || '').toLowerCase().includes(search.toLowerCase());
  });

  // Calculate dynamic Total Operational Cost: Fuel + Maintenance + Tolls + Other
  const totalFuelCost = fuelLogs.reduce((sum, e) => sum + e.amount, 0);
  const totalMaintCost = storage.getMaintenance().reduce((sum, m) => sum + m.cost, 0);
  const totalTollOther = otherExpenses.filter(e => e.type !== 'Maintenance').reduce((sum, e) => sum + e.amount, 0);
  const totalOperationalCost = totalFuelCost + totalMaintCost + totalTollOther;

  const handleLogFuel = (e: React.FormEvent) => {
    e.preventDefault();
    setFuelError(null);

    if (!fuelVehicleId || !fuelDate) {
      setFuelError('Please fill in all fields.');
      return;
    }

    const currentExpenses = storage.getExpenses();
    const newId = Math.max(...currentExpenses.map(ex => ex.id), 0) + 1;
    
    const newFuel: Expense = {
      id: newId,
      vehicleId: fuelVehicleId,
      type: 'Fuel',
      amount: Number(fuelCost),
      date: fuelDate,
      description: `Filled ${fuelLiters} Liters`,
    };

    storage.setExpenses([...currentExpenses, newFuel]);
    setIsFuelModalOpen(false);
    onUpdate();
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpError(null);

    if (!expVehicleId || !expDate || !expDesc.trim()) {
      setExpError('Please fill in all fields.');
      return;
    }

    const currentExpenses = storage.getExpenses();
    const newId = Math.max(...currentExpenses.map(ex => ex.id), 0) + 1;

    const newExpense: Expense = {
      id: newId,
      vehicleId: expVehicleId,
      type: expType,
      amount: Number(expAmount),
      date: expDate,
      description: expDesc.trim(),
    };

    storage.setExpenses([...currentExpenses, newExpense]);
    setIsExpenseModalOpen(false);
    onUpdate();
  };

  const formatDateString = (rawDate: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      return new Date(rawDate).toLocaleDateString('en-US', options);
    } catch {
      return rawDate;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-2xl neumorph-outset">
        <div className="relative rounded-xl neumorph-inset group border border-theme w-80">
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
          {canWrite ? (
            <>
              <button
                onClick={() => {
                  setFuelVehicleId(null);
                  setFuelLiters(30);
                  setFuelCost(2500);
                  setFuelError(null);
                  setIsFuelModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all neumorph-btn-vanilla cursor-pointer shadow-md"
              >
                <Fuel className="w-4 h-4 text-orange" /> Log Fuel
              </button>
              <button
                onClick={() => {
                  setExpVehicleId(null);
                  setExpAmount(150);
                  setExpDesc('Toll plaza payment');
                  setExpError(null);
                  setIsExpenseModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold transition-all neumorph-btn-orange cursor-pointer shadow-md hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" /> Add Expense
              </button>
            </>
          ) : (
            <span className="text-xs font-semibold text-secondary/60 bg-card-theme/50 px-3.5 py-2 rounded-xl border border-theme flex items-center gap-1.5 shadow-xs">
              <LockIcon className="w-3.5 h-3.5 text-orange" /> Read-Only View
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Table 1: Fuel Logs */}
        <div className="rounded-3xl p-6 neumorph-outset space-y-4">
          <h3 className="font-extrabold text-primary text-sm tracking-wider">Fuel Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-theme text-secondary text-xs font-semibold tracking-wider">
                  <th className="pb-3 pr-4">Vehicle</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Liters</th>
                  <th className="pb-3 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-primary">
                {filteredFuelLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-secondary font-bold bg-transparent">
                      No fuel logs recorded.
                    </td>
                  </tr>
                ) : (
                  filteredFuelLogs.map((log) => (
                    <tr key={log.id} className="border-b border-theme/30 hover-row transition-colors">
                      <td className="py-3 font-extrabold text-primary tabular-nums">{log.vehicle?.registrationNumber || 'Unknown'}</td>
                      <td className="py-3 font-bold text-secondary tabular-nums">{formatDateString(log.date)}</td>
                      <td className="py-3 text-primary tabular-nums">{log.description.replace('Filled ', '')}</td>
                      <td className="py-3 text-right font-extrabold text-orange tabular-nums">Rs. {log.amount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Other Expenses */}
        <div className="rounded-3xl p-6 neumorph-outset space-y-4">
          <h3 className="font-extrabold text-primary text-sm tracking-wider">Other Expenses (Toll / Misc)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-theme text-secondary text-xs font-semibold tracking-wider">
                  <th className="pb-3 pr-4">Trip</th>
                  <th className="pb-3 pr-4">Vehicle</th>
                  <th className="pb-3 pr-4">Toll</th>
                  <th className="pb-3 pr-4">Other</th>
                  <th className="pb-3 pr-4">Maint. (Linked)</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-primary">
                {filteredOtherExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-secondary font-bold bg-transparent">
                      No other expenses logged.
                    </td>
                  </tr>
                ) : (
                  filteredOtherExpenses.map((exp) => {
                    const isToll = exp.type === 'Toll';
                    const isMaint = exp.type === 'Maintenance';
                    const isOther = exp.type === 'Other';
                    return (
                      <tr key={exp.id} className="border-b border-theme/30 hover-row transition-colors">
                        <td className="py-3 font-extrabold text-primary tabular-nums">{exp.tripObj?.tripCode || 'N/A'}</td>
                        <td className="py-3 font-extrabold text-orange tabular-nums">{exp.vehicleObj?.registrationNumber || 'Unknown'}</td>
                        <td className="py-3 text-primary tabular-nums">{isToll ? `Rs. ${exp.amount.toLocaleString()}` : '0'}</td>
                        <td className="py-3 text-primary tabular-nums">{isOther ? `Rs. ${exp.amount.toLocaleString()}` : '0'}</td>
                        <td className="py-3 text-primary tabular-nums">{isMaint ? `Rs. ${exp.amount.toLocaleString()}` : '0'}</td>
                        <td className="py-3 text-right font-extrabold text-orange tabular-nums">Rs. {exp.amount.toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Footer dynamic Operational Cost (Exactly from Screen 6) */}
      <div className="p-5 rounded-3xl neumorph-outset flex flex-wrap justify-between items-center bg-gradient-theme border border-theme shadow-md">
        <span className="text-xs font-extrabold text-secondary tracking-widest">Dynamic Calculations</span>
        <div className="text-sm font-extrabold text-primary flex items-center gap-2">
          <span>TOTAL OPERATIONAL COST (AUTO) = FUEL + MAINTENANCE =</span>
          <span className="text-base text-orange font-black bg-card-theme/40 border border-theme px-3.5 py-1.5 rounded-2xl shadow-inner tabular-nums">
            Rs. {totalOperationalCost.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Log Fuel Modal */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass-backdrop p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 bg-app-theme neumorph-outset relative border border-theme animate-scale-up">
            <h3 className="text-base font-extrabold text-primary tracking-wider mb-6">
              Log Fuel Refill
            </h3>

            {fuelError && (
              <div className="mb-4 flex items-center gap-2 bg-red-500/10 border-2 border-dashed border-red-500/20 text-red-500 px-3 py-2 rounded-xl text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fuelError}</span>
              </div>
            )}

            <form onSubmit={handleLogFuel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Vehicle
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <select
                    value={fuelVehicleId || ''}
                    onChange={(e) => setFuelVehicleId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-card-theme text-primary">Select Vehicle...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id} className="bg-card-theme text-primary">
                        {v.registrationNumber} ({v.model})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    Liters Filled
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <input
                      type="number"
                      required
                      min={0}
                      value={fuelLiters}
                      onChange={(e) => setFuelLiters(Number(e.target.value))}
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    Total Cost (Rs.)
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <input
                      type="number"
                      required
                      min={0}
                      value={fuelCost}
                      onChange={(e) => setFuelCost(Number(e.target.value))}
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Refill Date
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <input
                    type="date"
                    required
                    value={fuelDate}
                    onChange={(e) => setFuelDate(e.target.value)}
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold neumorph-btn-vanilla cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold neumorph-btn-orange cursor-pointer"
                >
                  Log Fuel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Other Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass-backdrop p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 bg-app-theme neumorph-outset relative border border-theme animate-scale-up">
            <h3 className="text-base font-extrabold text-primary tracking-wider mb-6">
              Add Expense Record
            </h3>

            {expError && (
              <div className="mb-4 flex items-center gap-2 bg-red-500/10 border-2 border-dashed border-red-500/20 text-red-500 px-3 py-2 rounded-xl text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{expError}</span>
              </div>
            )}

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Vehicle
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <select
                    value={expVehicleId || ''}
                    onChange={(e) => setExpVehicleId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-card-theme text-primary">Select Vehicle...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id} className="bg-card-theme text-primary">
                        {v.registrationNumber} ({v.model})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    Expense Category
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <select
                      value={expType}
                      onChange={(e) => setExpType(e.target.value as 'Toll' | 'Other')}
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="Toll" className="bg-card-theme text-primary">Toll Fee</option>
                      <option value="Other" className="bg-card-theme text-primary">Other Misc</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    Amount (Rs.)
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <input
                      type="number"
                      required
                      min={0}
                      value={expAmount}
                      onChange={(e) => setExpAmount(Number(e.target.value))}
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Expense Details / Description
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <input
                    type="text"
                    required
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="e.g. Toll plaza charges"
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Date
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold neumorph-btn-vanilla cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold neumorph-btn-orange cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
