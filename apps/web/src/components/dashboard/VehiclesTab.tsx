import React, { useState } from 'react';
import type { Vehicle, VehicleStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Search, Filter, Plus, Edit, Trash, AlertCircle } from 'lucide-react';
import { storage } from '../../utils/api';

interface VehiclesTabProps {
  vehicles: Vehicle[];
  onUpdate: () => void;
}

export const VehiclesTab: React.FC<VehiclesTabProps> = ({
  vehicles,
  onUpdate,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [regNo, setRegNo] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('Van');
  const [capacity, setCapacity] = useState(500);
  const [odometer, setOdometer] = useState(0);
  const [acqCost, setAcqCost] = useState(0);
  const [status, setStatus] = useState<VehicleStatus>('Available');
  const [validationError, setValidationError] = useState<string | null>(null);

  const getBadgeVariant = (s: VehicleStatus) => {
    switch (s) {
      case 'Available': return 'success';
      case 'On Trip': return 'info';
      case 'In Shop': return 'warning';
      case 'Retired': return 'danger';
    }
  };

  const handleOpenAdd = () => {
    setEditVehicle(null);
    setRegNo('');
    setModel('');
    setType('Van');
    setCapacity(500);
    setOdometer(0);
    setAcqCost(0);
    setStatus('Available');
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditVehicle(v);
    setRegNo(v.registrationNumber);
    setModel(v.model);
    setType(v.type);
    setCapacity(v.loadCapacity);
    setOdometer(v.odometer);
    setAcqCost(v.acquisitionCost);
    setStatus(v.status);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!regNo.trim() || !model.trim()) {
      setValidationError('Please enter all required fields.');
      return;
    }

    // Check for registration number uniqueness
    const exists = vehicles.some(
      (v) => v.registrationNumber.toLowerCase() === regNo.trim().toLowerCase() && v.id !== editVehicle?.id
    );

    if (exists) {
      setValidationError(`Registration Number "${regNo}" must be unique.`);
      return;
    }

    const currentVehicles = storage.getVehicles();

    if (editVehicle) {
      // Edit
      const updated = currentVehicles.map((v) =>
        v.id === editVehicle.id
          ? {
              ...v,
              registrationNumber: regNo.trim().toUpperCase(),
              model: model.trim(),
              type,
              loadCapacity: Number(capacity),
              odometer: Number(odometer),
              acquisitionCost: Number(acqCost),
              status,
            }
          : v
      );
      storage.setVehicles(updated);
    } else {
      // Add
      const newV: Vehicle = {
        id: Math.max(...currentVehicles.map((v) => v.id), 0) + 1,
        registrationNumber: regNo.trim().toUpperCase(),
        model: model.trim(),
        type,
        loadCapacity: Number(capacity),
        odometer: Number(odometer),
        acquisitionCost: Number(acqCost),
        status,
      };
      storage.setVehicles([...currentVehicles, newV]);
    }

    setIsModalOpen(false);
    onUpdate();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle from the registry?')) {
      const currentVehicles = storage.getVehicles();
      const updated = currentVehicles.filter((v) => v.id !== id);
      storage.setVehicles(updated);
      onUpdate();
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
        <div className="relative rounded-xl neumorph-inset group border border-theme w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/70" />
          <input
            type="text"
            placeholder="Search reg. no..."
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
                <option value="" className="bg-card-theme text-primary">Type: All</option>
                <option value="Van" className="bg-card-theme text-primary">Van</option>
                <option value="Truck" className="bg-card-theme text-primary">Truck</option>
                <option value="Mini" className="bg-card-theme text-primary">Mini</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl neumorph-inset px-2 py-0.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-primary font-extrabold focus:outline-none py-1.5 px-2 cursor-pointer"
            >
              <option value="" className="bg-card-theme text-primary">Status: All</option>
              <option value="Available" className="bg-card-theme text-primary">Available</option>
              <option value="On Trip" className="bg-card-theme text-primary">On Trip</option>
              <option value="In Shop" className="bg-card-theme text-primary">In Shop</option>
              <option value="Retired" className="bg-card-theme text-primary">Retired</option>
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold transition-all neumorph-btn-orange cursor-pointer shadow-md hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Vehicles Registry Table */}
      <div className="rounded-2xl overflow-hidden neumorph-outset">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-transparent border-b border-theme text-secondary text-xs font-extrabold tracking-wider">
              <th className="px-6 py-4">Reg. No. (Unique)</th>
              <th className="px-6 py-4">Name/Model</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Capacity</th>
              <th className="px-6 py-4">Odometer</th>
              <th className="px-6 py-4">Acq. Cost</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-semibold text-primary">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-secondary font-bold bg-transparent">
                  No vehicles logged in the registry.
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id} className="border-b border-theme/30 hover-row transition-colors">
                  <td className="px-6 py-4 font-extrabold text-primary">{v.registrationNumber}</td>
                  <td className="px-6 py-4 font-extrabold text-orange">{v.model}</td>
                  <td className="px-6 py-4 text-primary font-bold">{v.type}</td>
                  <td className="px-6 py-4 text-primary">{v.loadCapacity >= 1000 ? `${(v.loadCapacity / 1000).toFixed(1)} Ton` : `${v.loadCapacity} kg`}</td>
                  <td className="px-6 py-4 font-bold text-secondary">{v.odometer.toLocaleString()} km</td>
                  <td className="px-6 py-4 text-primary font-extrabold">Rs. {v.acquisitionCost.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getBadgeVariant(v.status)}>{v.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(v)}
                        title="Edit Vehicle"
                        className="p-1.5 rounded-lg text-secondary hover:text-orange hover:bg-app-theme border border-transparent cursor-pointer transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        title="Delete Vehicle"
                        className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-500/5 border border-transparent cursor-pointer transition-all"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rules Notice Footer (Exactly from Screen 2) */}
      <div className="p-4 rounded-2xl border border-theme bg-card-theme text-xs font-bold text-secondary">
        Rule: Registration No. must be unique. "Retired" or "In Shop" vehicles are hidden from Trip Dispatcher.
      </div>

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass-backdrop p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 bg-app-theme neumorph-outset relative border border-theme animate-scale-up">
            <h3 className="text-base font-extrabold text-primary tracking-wider mb-6">
              {editVehicle ? 'Edit Vehicle Profile' : 'Add New Vehicle'}
            </h3>

            {validationError && (
              <div className="mb-4 flex items-center gap-2 bg-red-500/10 border-2 border-dashed border-red-500/20 text-red-500 px-3 py-2 rounded-xl text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Registration Number
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <input
                    type="text"
                    required
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="GJ01AB1234"
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Vehicle Name/Model
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="VAN-05"
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    Vehicle Type
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="Van" className="bg-card-theme text-primary">Van</option>
                      <option value="Truck" className="bg-card-theme text-primary">Truck</option>
                      <option value="Mini" className="bg-card-theme text-primary">Mini</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    Load Capacity (kg)
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <input
                      type="number"
                      required
                      min={0}
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    Odometer (km)
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <input
                      type="number"
                      required
                      min={0}
                      value={odometer}
                      onChange={(e) => setOdometer(Number(e.target.value))}
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    Acq. Cost (Rs.)
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <input
                      type="number"
                      required
                      min={0}
                      value={acqCost}
                      onChange={(e) => setAcqCost(Number(e.target.value))}
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
                    onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="Available" className="bg-card-theme text-primary">Available</option>
                    <option value="On Trip" className="bg-card-theme text-primary">On Trip</option>
                    <option value="In Shop" className="bg-card-theme text-primary">In Shop</option>
                    <option value="Retired" className="bg-card-theme text-primary">Retired</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold neumorph-btn-vanilla cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold neumorph-btn-orange cursor-pointer"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
