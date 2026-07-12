import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Driver, DriverStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Search, Filter, AlertTriangle, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { storage } from '../../utils/api';
import { trpcClient } from '../../lib/trpc';
import { toast } from 'sonner';

interface DriversTabProps {
  drivers: Driver[];
  userRole?: string;
  onUpdate: () => void;
}

// ── Zod Schema ───────────────────────────────────────────────────────────────
const driverFormSchema = z.object({
  driverName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  driverEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  driverPassword: z
    .string()
    .optional()
    .or(z.literal('')), // optional during edit, checked dynamically during add
  driverPhone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long'),
  driverLicenseNumber: z
    .string()
    .min(2, 'License number is required')
    .max(50, 'License number is too long'),
  driverLicenseExpiryDate: z
    .string()
    .min(1, 'Expiry date is required'),
  licenseCategory: z.string(),
  tripCompletionRate: z.number().min(0).max(100),
  safetyScore: z.number().min(0).max(100),
  status: z.string(),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

export const DriversTab: React.FC<DriversTabProps> = ({ drivers, userRole, onUpdate }) => {
  const canWrite = userRole?.toLowerCase().includes('manager') || userRole?.toLowerCase().includes('safety');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);

  // Modal & Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ── React Hook Form Setup ──────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      driverName: '',
      driverEmail: '',
      driverPassword: '',
      driverPhone: '',
      driverLicenseNumber: '',
      driverLicenseExpiryDate: '',
      licenseCategory: 'LMV',
      tripCompletionRate: 90,
      safetyScore: 85,
      status: 'Available',
    },
  });

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
    setValidationError(null);
    reset({
      driverName: '',
      driverEmail: '',
      driverPassword: '',
      driverPhone: '',
      driverLicenseNumber: '',
      driverLicenseExpiryDate: '',
      licenseCategory: 'LMV',
      tripCompletionRate: 90,
      safetyScore: 85,
      status: 'Available',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: Driver) => {
    setEditDriver(d);
    setValidationError(null);
    reset({
      driverName: d.name,
      driverEmail: d.email || `${d.name.toLowerCase().replace(/\s+/g, '')}@transit.com`,
      driverPassword: '',
      driverPhone: d.contactNumber,
      driverLicenseNumber: d.licenseNumber,
      driverLicenseExpiryDate: d.licenseExpiryDate,
      licenseCategory: d.licenseCategory,
      tripCompletionRate: d.tripCompletionRate,
      safetyScore: d.safetyScore,
      status: d.status,
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = async (data: DriverFormValues) => {
    setValidationError(null);

    // If adding a new driver, password is strictly required
    if (!editDriver && (!data.driverPassword || data.driverPassword.length < 6)) {
      setValidationError('Password of at least 6 characters is required for new drivers.');
      return;
    }

    try {
      const client = trpcClient as any;
      if (editDriver) {
        // Edit on backend tRPC
        await client.driver.update.mutate({
          id: editDriver.id,
          driverName: data.driverName,
          driverEmail: data.driverEmail,
          driverPhone: data.driverPhone,
          driverLicenseNumber: data.driverLicenseNumber.toUpperCase(),
          driverLicenseExpiryDate: data.driverLicenseExpiryDate,
          driverPassword: data.driverPassword || undefined,
        });
        toast.success('Driver profile updated!');
      } else {
        // Add to backend tRPC
        await client.driver.create.mutate({
          driverName: data.driverName,
          driverEmail: data.driverEmail,
          driverPhone: data.driverPhone,
          driverLicenseNumber: data.driverLicenseNumber.toUpperCase(),
          driverLicenseExpiryDate: data.driverLicenseExpiryDate,
          driverPassword: data.driverPassword!,
        });
        toast.success('Driver created successfully!');
      }
    } catch (err: any) {
      // Fallback to mock/localStorage database
      const currentDrivers = storage.getDrivers();
      if (editDriver) {
        const updated = currentDrivers.map((d) =>
          d.id === editDriver.id
            ? {
                ...d,
                name: data.driverName,
                licenseNumber: data.driverLicenseNumber.toUpperCase(),
                licenseCategory: data.licenseCategory,
                licenseExpiryDate: data.driverLicenseExpiryDate,
                contactNumber: data.driverPhone,
                tripCompletionRate: Number(data.tripCompletionRate),
                safetyScore: Number(data.safetyScore),
                status: data.status as DriverStatus,
                email: data.driverEmail,
              }
            : d
        );
        storage.setDrivers(updated);
      } else {
        const newD: Driver = {
          id: Math.max(...currentDrivers.map((d) => d.id), 0) + 1,
          name: data.driverName,
          licenseNumber: data.driverLicenseNumber.toUpperCase(),
          licenseCategory: data.licenseCategory,
          licenseExpiryDate: data.driverLicenseExpiryDate,
          contactNumber: data.driverPhone,
          tripCompletionRate: Number(data.tripCompletionRate),
          safetyScore: Number(data.safetyScore),
          status: data.status as DriverStatus,
          email: data.driverEmail,
        };
        storage.setDrivers([...currentDrivers, newD]);
      }
    }

    setIsModalOpen(false);
    onUpdate();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this driver profile?')) {
      try {
        const client = trpcClient as any;
        await client.driver.delete.mutate({ id });
        toast.success('Driver deleted from database');
      } catch {
        const currentDrivers = storage.getDrivers();
        const updated = currentDrivers.filter((d) => d.id !== id);
        storage.setDrivers(updated);
      }
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
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-secondary/60" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs font-bold w-48 md:w-64 rounded-xl neumorph-inset focus:outline-none text-primary"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-secondary">
            <Filter className="w-4 h-4 text-secondary/60" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-bold text-primary"
            >
              <option value="" className="bg-card-theme text-primary">All Statuses</option>
              <option value="Available" className="bg-card-theme text-primary">Available</option>
              <option value="On Trip" className="bg-card-theme text-primary">On Trip</option>
              <option value="Off Duty" className="bg-card-theme text-primary">Off Duty</option>
              <option value="Suspended" className="bg-card-theme text-primary">Suspended</option>
            </select>
          </div>
        </div>

        {canWrite && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer neumorph-btn-orange shadow-md"
          >
            <Plus className="w-4.5 h-4.5" /> Add Driver
          </button>
        )}
      </div>

      {/* Grid of Drivers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((d) => {
          const isExpired = isLicenseExpired(d.licenseExpiryDate);
          const isSuspended = d.status === 'Suspended';
          const hasIssues = isExpired || isSuspended;

          return (
            <div
              key={d.id}
              onClick={() => setSelectedDriverId(selectedDriverId === d.id ? null : d.id)}
              className={`p-5 rounded-3xl border border-theme bg-card-theme transition-all cursor-pointer select-none neumorph-outset hover:border-orange/20 relative group ${
                selectedDriverId === d.id ? 'ring-2 ring-orange/30' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center font-black text-orange text-sm shrink-0 border border-orange/10">
                    {d.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-primary text-xs tracking-wide">{d.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-secondary font-bold">#{d.id}</span>
                      <Badge variant={getBadgeVariant(d.status)}>{d.status}</Badge>
                    </div>
                  </div>
                </div>

                {hasIssues && (
                  <div className="text-red-500 bg-red-500/10 p-1.5 rounded-xl border border-red-500/10 shrink-0" title={isExpired ? 'License Expired' : 'Driver Suspended'}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-theme/40 text-xs font-bold text-secondary">
                <div>
                  <span className="block text-[9px] font-bold text-secondary/60 tracking-wider uppercase mb-1">License No.</span>
                  <span className="text-primary truncate block uppercase">{d.licenseNumber}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-secondary/60 tracking-wider uppercase mb-1">License Expiry</span>
                  <span className={`block truncate ${isExpired ? 'text-red-500 font-extrabold' : 'text-primary'}`}>
                    {d.licenseExpiryDate}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-secondary/60 tracking-wider uppercase mb-1">Safety Score</span>
                  <span className={`block ${d.safetyScore >= 85 ? 'text-emerald-500' : 'text-orange'}`}>{d.safetyScore}%</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-secondary/60 tracking-wider uppercase mb-1">Trips Completed</span>
                  <span className="text-primary">{d.tripCompletionRate}%</span>
                </div>
              </div>

              {/* Details Drawer / Expandable actions */}
              {selectedDriverId === d.id && (
                <div className="mt-6 pt-4 border-t border-theme/40 flex flex-wrap justify-between items-center gap-3 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                  <div className="text-[10px] text-secondary font-semibold">
                    <span className="block">Category: <strong className="text-primary font-bold">{d.licenseCategory}</strong></span>
                    <span className="block mt-0.5">Phone: <strong className="text-primary font-bold">{d.contactNumber}</strong></span>
                  </div>

                  {canWrite && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(d)}
                        className="p-2 rounded-xl border border-theme text-secondary hover:text-orange hover:bg-orange/10 transition-all cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-2 rounded-xl border border-theme text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Delete Driver"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <select
                        value={d.status}
                        onChange={(e) => handleToggleStatus(d.id, e.target.value as DriverStatus)}
                        className="bg-card-theme border border-theme text-[10px] font-bold text-primary px-2 rounded-xl focus:outline-none cursor-pointer"
                      >
                        <option value="Available">Available</option>
                        <option value="On Trip">On Trip</option>
                        <option value="Off Duty">Off Duty</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rules Notice Footer */}
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

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Driver Name</label>
                <div className={`relative rounded-xl neumorph-inset border px-3 py-2.5 ${errors.driverName ? 'border-red-500/60' : 'border-theme'}`}>
                  <Controller
                    name="driverName"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Marcus Miller"
                        className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                      />
                    )}
                  />
                </div>
                {errors.driverName && <p className="mt-1 px-1 text-[9px] font-bold text-red-500">{errors.driverName.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Email Address</label>
                <div className={`relative rounded-xl neumorph-inset border px-3 py-2.5 ${errors.driverEmail ? 'border-red-500/60' : 'border-theme'}`}>
                  <Controller
                    name="driverEmail"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        placeholder="name@transit.com"
                        className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                      />
                    )}
                  />
                </div>
                {errors.driverEmail && <p className="mt-1 px-1 text-[9px] font-bold text-red-500">{errors.driverEmail.message}</p>}
              </div>

              {/* Password (Only required on Add) */}
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Password {!editDriver ? '*' : '(Leave empty to keep current)'}
                </label>
                <div className={`relative rounded-xl neumorph-inset border px-3 py-2.5 ${errors.driverPassword ? 'border-red-500/60' : 'border-theme'}`}>
                  <Controller
                    name="driverPassword"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                      />
                    )}
                  />
                </div>
                {errors.driverPassword && <p className="mt-1 px-1 text-[9px] font-bold text-red-500">{errors.driverPassword.message}</p>}
              </div>

              {/* License Number */}
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">License Number</label>
                <div className={`relative rounded-xl neumorph-inset border px-3 py-2.5 ${errors.driverLicenseNumber ? 'border-red-500/60' : 'border-theme'}`}>
                  <Controller
                    name="driverLicenseNumber"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="DL-987654"
                        className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none uppercase"
                      />
                    )}
                  />
                </div>
                {errors.driverLicenseNumber && <p className="mt-1 px-1 text-[9px] font-bold text-red-500">{errors.driverLicenseNumber.message}</p>}
              </div>

              {/* License Category & Expiry Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">License Category</label>
                  <div className="rounded-xl neumorph-inset border border-theme px-3 py-2">
                    <Controller
                      name="licenseCategory"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="LMV" className="bg-card-theme text-primary">LMV (Light Vehicle)</option>
                          <option value="HMV" className="bg-card-theme text-primary">HMV (Heavy Vehicle)</option>
                        </select>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Expiry Date</label>
                  <div className={`relative rounded-xl neumorph-inset border px-3 py-2 ${errors.driverLicenseExpiryDate ? 'border-red-500/60' : 'border-theme'}`}>
                    <Controller
                      name="driverLicenseExpiryDate"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="date"
                          className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                        />
                      )}
                    />
                  </div>
                  {errors.driverLicenseExpiryDate && <p className="mt-1 px-1 text-[9px] font-bold text-red-500">{errors.driverLicenseExpiryDate.message}</p>}
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Contact Number</label>
                <div className={`relative rounded-xl neumorph-inset border px-3 py-2.5 ${errors.driverPhone ? 'border-red-500/60' : 'border-theme'}`}>
                  <Controller
                    name="driverPhone"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="98765xxxxx"
                        className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                      />
                    )}
                  />
                </div>
                {errors.driverPhone && <p className="mt-1 px-1 text-[9px] font-bold text-red-500">{errors.driverPhone.message}</p>}
              </div>

              {/* Trip Completion & Safety Score Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Trip Completion (%)</label>
                  <div className="rounded-xl neumorph-inset border border-theme px-3 py-2">
                    <Controller
                      name="tripCompletionRate"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min={0}
                          max={100}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                        />
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Safety Score (%)</label>
                  <div className="rounded-xl neumorph-inset border border-theme px-3 py-2">
                    <Controller
                      name="safetyScore"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min={0}
                          max={100}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Initial Status</label>
                <div className="rounded-xl neumorph-inset border border-theme px-3 py-2">
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="Available" className="bg-card-theme text-primary">Available</option>
                        <option value="On Trip" className="bg-card-theme text-primary">On Trip</option>
                        <option value="Off Duty" className="bg-card-theme text-primary">Off Duty</option>
                        <option value="Suspended" className="bg-card-theme text-primary">Suspended</option>
                      </select>
                    )}
                  />
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
