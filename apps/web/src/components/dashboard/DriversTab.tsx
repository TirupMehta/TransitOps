import React, { useState } from 'react';
import type { Driver, DriverStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Search, Filter, AlertTriangle, Plus, Edit, Trash, AlertCircle, Lock } from 'lucide-react';
import { storage } from '../../utils/api';

interface DriversTabProps {
  drivers: Driver[];
  userRole?: string;
  onUpdate: () => void;
}

export const DriversTab: React.FC<DriversTabProps> = ({ drivers, userRole, onUpdate }) => {
  const canWrite = userRole?.toLowerCase().includes('manager') || userRole?.toLowerCase().includes('safety');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [name, setName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [category, setCategory] = useState('LMV');
  const [expiry, setExpiry] = useState('');
  const [contact, setContact] = useState('');
  const [tripCompl, setTripCompl] = useState(90);
  const [safetyScore, setSafetyScore] = useState(85);
  const [status, setStatus] = useState<DriverStatus>('Available');
  const [validationError, setValidationError] = useState<string | null>(null);

  const getBadgeVariant = (s: DriverStatus) => {
    switch (s) {
      case 'Available': return 'success';
      case 'On Trip': return 'info';
      case 'Off Duty': return 'neutral';
      case 'Suspended': return 'danger';
    }
  };

  const isLicenseExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const handleOpenAdd = () => {
    setEditDriver(null);
    setName('');
    setLicenseNo('');
    setCategory('LMV');
    setExpiry('');
    setContact('');
    setTripCompl(90);
    setSafetyScore(85);
    setStatus('Available');
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: Driver) => {
    setEditDriver(d);
    setName(d.name);
    setLicenseNo(d.licenseNumber);
    setCategory(d.licenseCategory);
    setExpiry(d.licenseExpiryDate);
    setContact(d.contactNumber);
    setTripCompl(d.tripCompletionRate);
    setSafetyScore(d.safetyScore);
    setStatus(d.status);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim() || !licenseNo.trim() || !expiry || !contact.trim()) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    const currentDrivers = storage.getDrivers();

    if (editDriver) {
      // Edit
      const updated = currentDrivers.map((d) =>
        d.id === editDriver.id
          ? {
              ...d,
              name: name.trim(),
              licenseNumber: licenseNo.trim().toUpperCase(),
              licenseCategory: category,
              licenseExpiryDate: expiry,
              contactNumber: contact.trim(),
              tripCompletionRate: Number(tripCompl),
              safetyScore: Number(safetyScore),
              status,
            }
          : d
      );
      storage.setDrivers(updated);
    } else {
      // Add
      const newD: Driver = {
        id: Math.max(...currentDrivers.map((d) => d.id), 0) + 1,
        name: name.trim(),
        licenseNumber: licenseNo.trim().toUpperCase(),
        licenseCategory: category,
        licenseExpiryDate: expiry,
        contactNumber: contact.trim(),
        tripCompletionRate: Number(tripCompl),
        safetyScore: Number(safetyScore),
        status,
      };
      storage.setDrivers([...currentDrivers, newD]);
    }

    setIsModalOpen(false);
    onUpdate();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this driver profile?')) {
      const currentDrivers = storage.getDrivers();
      const updated = currentDrivers.filter((d) => d.id !== id);
      storage.setDrivers(updated);
      onUpdate();
    }
  };

  const handleToggleStatus = (driverId: number, nextStatus: DriverStatus) => {
    const currentDrivers = storage.getDrivers();
    const updated = currentDrivers.map((d) =>
      d.id === driverId ? { ...d, status: nextStatus } : d
    );
    storage.setDrivers(updated);
    onUpdate();
  };

  const filtered = drivers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                          d.licenseNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? d.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Actions Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-2xl neumorph-outset">
        <div className="relative rounded-xl neumorph-inset group border border-theme w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/70" />
          <input
            type="text"
            placeholder="Search drivers..."
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
                <option value="" className="bg-card-theme text-primary">Status: All</option>
                <option value="Available" className="bg-card-theme text-primary">Available</option>
                <option value="On Trip" className="bg-card-theme text-primary">On Trip</option>
                <option value="Off Duty" className="bg-card-theme text-primary">Off Duty</option>
                <option value="Suspended" className="bg-card-theme text-primary">Suspended</option>
              </select>
            </div>
          </div>

          {canWrite ? (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold transition-all neumorph-btn-orange cursor-pointer shadow-md hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" /> Add Driver
            </button>
          ) : (
            <span className="text-xs font-semibold text-secondary/60 bg-card-theme/50 px-3.5 py-2 rounded-xl border border-theme flex items-center gap-1.5 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-orange" /> Read-Only View
            </span>
          )}
        </div>
      </div>

      {/* Drivers List Table */}
      <div className="rounded-2xl overflow-hidden neumorph-outset">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-transparent border-b border-theme text-secondary text-xs font-extrabold tracking-wider">
              <th className="px-6 py-4">Driver</th>
              <th className="px-6 py-4">License No.</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Expiry</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Trip Compl.</th>
              <th className="px-6 py-4">Safety</th>
              <th className="px-6 py-4">Status</th>
              {canWrite && <th className="px-6 py-4 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="text-sm font-semibold text-primary">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-secondary font-bold bg-transparent">
                  No drivers found.
                </td>
              </tr>
            ) : (
              filtered.map((d) => {
                const expired = isLicenseExpired(d.licenseExpiryDate);
                const isSelected = selectedDriverId === d.id;
                
                return (
                  <React.Fragment key={d.id}>
                    <tr
                      className={`border-b border-theme/30 hover-row transition-colors cursor-pointer ${isSelected ? 'bg-orange/5' : ''}`}
                      onClick={() => setSelectedDriverId(isSelected ? null : d.id)}
                    >
                      <td className="px-6 py-4 font-extrabold text-primary">{d.name}</td>
                      <td className="px-6 py-4 font-extrabold text-orange tabular-nums">{d.licenseNumber}</td>
                      <td className="px-6 py-4 text-primary font-bold">{d.licenseCategory}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 font-bold tabular-nums ${expired ? 'text-rose-500 font-extrabold' : 'text-secondary'}`}>
                          {expired && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                          {d.licenseExpiryDate} {expired ? 'EXPIRED' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-secondary font-bold tabular-nums">{d.contactNumber}</td>
                      <td className="px-6 py-4 text-primary font-extrabold tabular-nums">{d.tripCompletionRate}%</td>
                      <td className="px-6 py-4">
                        <span className={`font-extrabold px-2 py-0.5 rounded text-xs tabular-nums ${d.safetyScore >= 90 ? 'text-emerald-700 bg-emerald-50/15' : d.safetyScore >= 80 ? 'text-blue-700 bg-blue-50/15' : 'text-amber-700 bg-amber-50/15'}`}>
                          {d.safetyScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getBadgeVariant(d.status)}>{d.status}</Badge>
                      </td>
                      {canWrite && (
                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleOpenEdit(d)}
                              title="Edit Profile"
                              className="p-1.5 rounded-lg text-secondary hover:text-orange hover:bg-app-theme border border-transparent cursor-pointer transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(d.id)}
                              title="Delete Profile"
                              className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-500/5 border border-transparent cursor-pointer transition-all"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>

                    {/* Inline Status Toggle Option Row (Screen 3 toggle status button feature) */}
                    {isSelected && canWrite && (
                      <tr className="bg-card-theme/35">
                        <td colSpan={9} className="px-6 py-3 border-t border-dashed border-theme">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-secondary/80">Toggle Driver Status:</span>
                            <div className="flex gap-2">
                              {(['Available', 'On Trip', 'Off Duty', 'Suspended'] as DriverStatus[]).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleToggleStatus(d.id, st)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                                    d.status === st
                                      ? st === 'Available' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' :
                                        st === 'On Trip' ? 'bg-blue-500 text-white border-blue-500 shadow-sm' :
                                        st === 'Off Duty' ? 'bg-[#625146] text-white border-[#625146] shadow-sm' :
                                        'bg-red-500 text-white border-red-500 shadow-sm'
                                      : 'bg-transparent text-secondary border-theme hover:text-orange hover:border-orange'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Rules Notice Footer (Exactly from Screen 3) */}
      <div className="p-4 rounded-2xl border border-theme bg-card-theme text-xs font-bold text-secondary">
        Rule: Expired license or Suspended status - blocked from trip assignment
      </div>

      {/* Add / Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass-backdrop p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 bg-app-theme neumorph-outset relative border border-theme animate-scale-up">
            <h3 className="text-base font-extrabold text-primary tracking-wider mb-6">
              {editDriver ? 'Edit Driver Profile' : 'Add New Driver'}
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
                  Driver Name
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marcus Miller"
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  License Number
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <input
                    type="text"
                    required
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    placeholder="DL-987654"
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    License Category
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="LMV" className="bg-card-theme text-primary">LMV (Light Vehicle)</option>
                      <option value="HMV" className="bg-card-theme text-primary">HMV (Heavy Vehicle)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    Expiry Date
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <input
                      type="date"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Contact Number
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="98765xxxxx"
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    Trip Completion (%)
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={tripCompl}
                      onChange={(e) => setTripCompl(Number(e.target.value))}
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    Safety Score (%)
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={safetyScore}
                      onChange={(e) => setSafetyScore(Number(e.target.value))}
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Initial Status
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DriverStatus)}
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="Available" className="bg-card-theme text-primary">Available</option>
                    <option value="On Trip" className="bg-card-theme text-primary">On Trip</option>
                    <option value="Off Duty" className="bg-card-theme text-primary">Off Duty</option>
                    <option value="Suspended" className="bg-card-theme text-primary">Suspended</option>
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
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
