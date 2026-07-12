import React, { useState } from 'react';
import type { GeneralSettings } from '../../types';
import { storage } from '../../utils/api';
import { Settings, ShieldCheck, Check, Info } from 'lucide-react';

interface SettingsTabProps {
  onUpdate: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onUpdate }) => {
  const [settings, setSettings] = useState<GeneralSettings>(storage.getSettings());
  const [depotName, setDepotName] = useState(settings.depotName);
  const [currency, setCurrency] = useState(settings.currency);
  const [distanceUnit, setDistanceUnit] = useState(settings.distanceUnit);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: GeneralSettings = {
      depotName: depotName.trim(),
      currency,
      distanceUnit,
    };
    storage.setSettings(updated);
    setSettings(updated);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    onUpdate();
  };

  const matrix = [
    {
      role: 'Fleet Manager',
      fleet: 'Edit',
      drivers: 'Edit',
      trips: 'Edit',
      fuelExp: 'Edit',
      analytics: 'Edit',
    },
    {
      role: 'Driver',
      fleet: 'View',
      drivers: 'View',
      trips: 'Edit',
      fuelExp: '—',
      analytics: '—',
    },
    {
      role: 'Safety Officer',
      fleet: '—',
      drivers: 'Edit',
      trips: 'View',
      fuelExp: '—',
      analytics: '—',
    },
    {
      role: 'Financial Analyst',
      fleet: 'View',
      drivers: '—',
      trips: '—',
      fuelExp: 'Edit',
      analytics: 'Edit',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center gap-4 p-4 rounded-2xl neumorph-outset">
        <div className="text-xs font-extrabold text-orange tracking-wider flex items-center gap-1.5">
          <Settings className="w-5 h-5" /> Settings & System Administration
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: General Settings Form */}
        <div className="rounded-3xl p-6 neumorph-outset relative">
          <h3 className="font-extrabold text-primary text-sm tracking-wider mb-6">General Settings</h3>

          {success && (
            <div className="mb-4 flex items-center gap-2 bg-emerald-500/10 border-2 border-dashed border-emerald-500/20 text-emerald-500 px-3 py-2 rounded-xl text-xs font-bold">
              <Check className="w-4 h-4 shrink-0" />
              <span>Settings saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                Depot Name
              </label>
              <div className="rounded-xl neumorph-inset px-3 py-2.5">
                <input
                  type="text"
                  required
                  value={depotName}
                  onChange={(e) => setDepotName(e.target.value)}
                  className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                Preferred Currency
              </label>
              <div className="rounded-xl neumorph-inset px-3 py-2.5">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                >
                  <option value="INR (Rs)" className="bg-card-theme text-primary">INR (Rs.)</option>
                  <option value="USD ($)" className="bg-card-theme text-primary">USD ($)</option>
                  <option value="EUR (€)" className="bg-card-theme text-primary">EUR (€)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                Distance Unit
              </label>
              <div className="rounded-xl neumorph-inset px-3 py-2.5">
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Kilometers" className="bg-card-theme text-primary">Kilometers (km)</option>
                  <option value="Miles" className="bg-card-theme text-primary">Miles (mi)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer neumorph-btn-orange text-xs shadow-md mt-8"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Right Side: Role-Based Access Control (RBAC) */}
        <div className="lg:col-span-2 rounded-3xl p-6 neumorph-outset">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-primary text-sm tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-orange" /> Role-Based Access Control (RBAC)
            </h3>
            <span className="text-xs font-semibold text-orange bg-orange/10 px-2.5 py-1 rounded-full border border-orange/10">Active Security Mode</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-theme text-secondary text-xs font-semibold tracking-wider">
                  <th className="pb-3 text-left">Role</th>
                  <th className="pb-3 text-center">Fleet</th>
                  <th className="pb-3 text-center">Drivers</th>
                  <th className="pb-3 text-center">Trips</th>
                  <th className="pb-3 text-center">Fuel/Exp.</th>
                  <th className="pb-3 text-center">Analytics</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-primary">
                {matrix.map((row) => (
                  <tr key={row.role} className="border-b border-theme/30 hover-row transition-colors">
                    <td className="py-4 font-extrabold text-primary">{row.role}</td>
                    <td className="py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-xs ${
                        row.fleet === 'Edit' ? 'text-emerald-500 bg-emerald-500/10' :
                        row.fleet === 'View' ? 'text-blue-500 bg-blue-500/10' :
                        'text-secondary/40'
                      }`}>
                        {row.fleet}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-xs ${
                        row.drivers === 'Edit' ? 'text-emerald-500 bg-emerald-500/10' :
                        row.drivers === 'View' ? 'text-blue-500 bg-blue-500/10' :
                        'text-secondary/40'
                      }`}>
                        {row.drivers}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-xs ${
                        row.trips === 'Edit' ? 'text-emerald-500 bg-emerald-500/10' :
                        row.trips === 'View' ? 'text-blue-500 bg-blue-500/10' :
                        'text-secondary/40'
                      }`}>
                        {row.trips}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-xs ${
                        row.fuelExp === 'Edit' ? 'text-emerald-500 bg-emerald-500/10' :
                        row.fuelExp === 'View' ? 'text-blue-500 bg-blue-500/10' :
                        'text-secondary/40'
                      }`}>
                        {row.fuelExp}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-xs ${
                        row.analytics === 'Edit' ? 'text-emerald-500 bg-emerald-500/10' :
                        row.analytics === 'View' ? 'text-blue-500 bg-blue-500/10' :
                        'text-secondary/40'
                      }`}>
                        {row.analytics}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 rounded-2xl border border-theme bg-card-theme/20 text-xs font-semibold text-secondary leading-normal flex items-start gap-2">
            <Info className="w-4.5 h-4.5 text-orange shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-primary block">RBAC Enforcement Notice</span>
              <span className="block mt-0.5">
                The sidebar navigation dynamically restricts and hides sections that the logged-in user does not have permission to access. Scopes shown above are enforced across all workspaces.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
