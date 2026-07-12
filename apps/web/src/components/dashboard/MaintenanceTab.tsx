import React, { useState } from 'react';
import type { MaintenanceLog, Vehicle } from '../../types';
import { Badge } from '../ui/Badge';
import { Search, Wrench, AlertCircle, ArrowRightLeft, CheckCircle2, Lock } from 'lucide-react';
import { storage } from '../../utils/api';

interface MaintenanceTabProps {
  maintenance: MaintenanceLog[];
  vehicles: Vehicle[];
  userRole?: string;
  onUpdate: () => void;
}

export const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  maintenance,
  vehicles,
  userRole,
  onUpdate,
}) => {
  const canWrite = userRole?.toLowerCase().includes('manager');
  const [search, setSearch] = useState('');
  
  // Log Service Record Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [serviceType, setServiceType] = useState('Oil Change');
  const [cost, setCost] = useState(2500);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Active' | 'Completed'>('Active');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedVehicleId || !serviceType.trim() || !date) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    const currentLogs = storage.getMaintenance();
    const currentVehicles = storage.getVehicles();
    const currentExpenses = storage.getExpenses();

    const logId = Math.max(...currentLogs.map(l => l.id), 0) + 1;
    const newLog: MaintenanceLog = {
      id: logId,
      vehicleId: selectedVehicleId,
      description: serviceType.trim(),
      cost: Number(cost),
      date,
      status,
    };

    // Auto switch vehicle status to "In Shop" if active (In Shop)
    const updatedVehicles = currentVehicles.map(v => {
      if (v.id === selectedVehicleId) {
        if (status === 'Active') {
          return { ...v, status: 'In Shop' as const };
        } else if (v.status === 'In Shop') {
          // If logged as already completed, restore to Available if it was in shop
          return { ...v, status: 'Available' as const };
        }
      }
      return v;
    });

    // Also add to expenses automatically
    const expenseId = Math.max(...currentExpenses.map(ex => ex.id), 0) + 1;
    const newExpense = {
      id: expenseId,
      vehicleId: selectedVehicleId,
      type: 'Maintenance' as const,
      amount: Number(cost),
      date,
      description: `Service Logged: ${serviceType.trim()} (Ref: Maintenace #${logId})`,
    };

    storage.setMaintenance([...currentLogs, newLog]);
    storage.setVehicles(updatedVehicles);
    storage.setExpenses([...currentExpenses, newExpense]);

    // Reset Form
    setSelectedVehicleId(null);
    setServiceType('Oil Change');
    setCost(2500);
    setStatus('Active');

    onUpdate();
  };

  const handleCompleteMaintenance = (log: MaintenanceLog) => {
    const currentLogs = storage.getMaintenance();
    const currentVehicles = storage.getVehicles();

    // 1. Update log status to Completed
    const updatedLogs = currentLogs.map(l => 
      l.id === log.id ? { ...l, status: 'Completed' as const } : l
    );

    // 2. Restore vehicle status to Available (unless retired)
    const updatedVehicles = currentVehicles.map(v => {
      if (v.id === log.vehicleId && v.status === 'In Shop') {
        return { ...v, status: 'Available' as const };
      }
      return v;
    });

    storage.setMaintenance(updatedLogs);
    storage.setVehicles(updatedVehicles);
    onUpdate();
  };

  const filteredLogs = maintenance.map(m => ({
    ...m,
    vehicle: vehicles.find(v => v.id === m.vehicleId)
  })).filter(m => {
    const matchesSearch = (m.vehicle?.registrationNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                          (m.vehicle?.model || '').toLowerCase().includes(search.toLowerCase()) ||
                          m.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search toolbar */}
      <div className="flex justify-between items-center gap-4 p-4 rounded-2xl neumorph-outset">
        <div className="relative rounded-xl neumorph-inset group border border-theme w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/70" />
          <input
            type="text"
            placeholder="Search maintenance logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none text-primary font-bold"
          />
        </div>
        <div className="text-xs font-extrabold text-orange tracking-wider flex items-center gap-1.5">
          {!canWrite && (
            <span className="text-xs font-semibold text-secondary/60 bg-card-theme/50 px-3 py-1.5 rounded-xl border border-theme flex items-center gap-1.5 shadow-xs mr-2">
              <Lock className="w-3.5 h-3.5 text-orange" /> Read-Only View
            </span>
          )}
          <Wrench className="w-5 h-5" /> Maintenance Workshop Logs
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Log Service Record Form */}
        {canWrite && (
          <div className="rounded-3xl p-6 neumorph-outset relative">
          <h3 className="font-extrabold text-primary text-sm tracking-wider mb-6">Log Service Record</h3>

          {validationError && (
            <div className="mb-4 flex items-center gap-2 bg-red-500/10 border-2 border-dashed border-red-500/20 text-red-500 px-3 py-2 rounded-xl text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSaveRecord} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                Vehicle
              </label>
              <div className="rounded-xl neumorph-inset px-3 py-2">
                <select
                  value={selectedVehicleId || ''}
                  onChange={(e) => setSelectedVehicleId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-card-theme text-primary">Select Vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id} className="bg-card-theme text-primary">
                      {v.registrationNumber} ({v.model} - Status: {v.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                Service Type
              </label>
              <div className="rounded-xl neumorph-inset px-3 py-2">
                <input
                  type="text"
                  required
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="e.g. Oil Change"
                  className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Cost (Rs.)
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <input
                    type="number"
                    required
                    min={0}
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
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
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                Status
              </label>
              <div className="rounded-xl neumorph-inset px-3 py-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Completed')}
                  className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Active" className="bg-card-theme text-primary">Active (In Shop)</option>
                  <option value="Completed" className="bg-card-theme text-primary">Completed</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer neumorph-btn-orange text-xs shadow-md mt-6"
            >
              Save Record
            </button>
          </form>

          {/* Visual Diagram Transition (Exactly from Screen 5) */}
          <div className="mt-8 p-4 rounded-2xl border border-theme bg-card-theme/30 text-xs font-bold text-secondary text-center space-y-2">
            <span className="text-xs font-semibold tracking-wider block text-primary/80">Workflow State Transition</span>
            <div className="flex items-center justify-center gap-3 py-2">
              <span className="text-emerald-500 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10">Available</span>
              <ArrowRightLeft className="w-4 h-4 text-orange" />
              <span className="text-amber-500 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/10">In Shop</span>
            </div>
            <span className="text-xs text-secondary/70 leading-normal block">
              Note: In Shop vehicles are removed from the dispatch pool.
            </span>
          </div>
        </div>
      )}

        {/* Right Panel: Service Log Table */}
        <div className={`${canWrite ? 'lg:col-span-2' : 'lg:col-span-3'} rounded-3xl p-6 neumorph-outset`}>
          <h3 className="font-extrabold text-primary text-sm tracking-wider mb-6">Service Log</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-transparent border-b border-theme text-secondary text-xs font-semibold tracking-wider">
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Cost</th>
                  <th className="pb-3">Status</th>
                  {canWrite && <th className="pb-3 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-primary">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-secondary font-bold bg-transparent">
                      No service logs recorded.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-theme/30 hover-row transition-colors">
                      <td className="py-3 font-extrabold text-primary">
                        <span className="block text-orange tabular-nums">{log.vehicle?.registrationNumber || 'Unknown'}</span>
                        <span className="block text-xs text-secondary/80 font-medium mt-0.5">{log.vehicle?.model}</span>
                      </td>
                      <td className="py-3 font-extrabold text-primary">{log.description}</td>
                      <td className="py-3 font-extrabold text-orange tabular-nums">Rs. {log.cost.toLocaleString()}</td>
                      <td className="py-3">
                        <Badge variant={log.status === 'Active' ? 'warning' : 'success'}>
                          {log.status === 'Active' ? 'In Shop' : 'Completed'}
                        </Badge>
                      </td>
                      {canWrite && (
                        <td className="py-3 text-center">
                          {log.status === 'Active' ? (
                            <button
                              onClick={() => handleCompleteMaintenance(log)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600 transition-colors shadow-xs"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Complete
                            </button>
                          ) : (
                            <span className="text-secondary/50 font-bold text-xs tracking-wider">Closed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
