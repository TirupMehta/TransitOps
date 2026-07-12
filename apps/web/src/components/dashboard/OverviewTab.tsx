import React, { useState } from 'react';
import type { Vehicle, Driver, Trip, MaintenanceLog, DashboardKpis } from '../../types';
import { StatCard } from '../ui/StatCard';
import { Filter, Truck, CheckCircle, Wrench, TrendingUp, ArrowRight } from 'lucide-react';

interface OverviewTabProps {
  kpis: DashboardKpis;
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  maintenance: MaintenanceLog[];
  setActiveTab: (tab: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  kpis,
  trips,
  vehicles,
  drivers,
  maintenance,
  setActiveTab,
}) => {
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Find active trips and vehicles in shop
  const activeDispatchedTrips = trips.filter((t) => t.status === 'Dispatched');
  const activeMaintenance = maintenance.filter((m) => m.status === 'Active');

  return (
    <div className="space-y-8">
      {/* Dashboard Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/75 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-slate-200 rounded-xl text-sm px-3 py-1.5 focus:outline-none focus:border-indigo-500 bg-slate-50 text-slate-700 font-bold cursor-pointer"
            >
              <option value="">All Vehicle Types</option>
              <option value="Van">Vans</option>
              <option value="Truck">Trucks</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-xl text-sm px-3 py-1.5 focus:outline-none focus:border-indigo-500 bg-slate-50 text-slate-700 font-bold cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
            </select>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="border border-slate-200 rounded-xl text-sm px-3 py-1.5 focus:outline-none focus:border-indigo-500 bg-slate-50 text-slate-700 font-bold cursor-pointer"
            >
              <option value="">All Regions</option>
              <option value="East">East Coast</option>
              <option value="West">West Coast</option>
              <option value="Central">Central Hub</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Active Vehicles"
          value={kpis.activeVehicles}
          subtitle="Vehicles currently on road"
          icon={<Truck className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Available Fleet"
          value={kpis.availableVehicles}
          subtitle="Ready to be dispatched"
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="In Maintenance"
          value={kpis.vehiclesInMaintenance}
          subtitle="Currently in workshop"
          icon={<Wrench className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Fleet Utilization"
          value={`${kpis.fleetUtilization}%`}
          subtitle="Active vs Total Operational"
          icon={<TrendingUp className="w-5 h-5 text-indigo-605" />}
          iconBg="bg-indigo-50"
          progress={kpis.fleetUtilization}
        />
      </div>

      {/* Lower Section (Recent Trips & In Shop list) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active/Recent Dispatches */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Active / Dispatched Trips</h3>
            <button
              onClick={() => setActiveTab('trips')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-805 flex items-center gap-1 cursor-pointer transition-all hover:translate-x-0.5"
            >
              Manage Trips <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            {activeDispatchedTrips.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm font-bold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                No active trips currently on road.
              </div>
            ) : (
              activeDispatchedTrips.map((trip) => {
                const v = vehicles.find((veh) => veh.id === trip.vehicleId);
                const d = drivers.find((drv) => drv.id === trip.driverId);
                return (
                  <div key={trip.id} className="flex justify-between items-center p-4 border border-slate-100 bg-slate-50/30 rounded-2xl hover:bg-slate-50/70 transition-all">
                    <div>
                      <span className="text-[10px] font-extrabold text-indigo-550 uppercase tracking-wider block">ROUTE</span>
                      <div className="font-bold text-slate-850 text-sm mt-0.5">{trip.source} → {trip.destination}</div>
                      <div className="text-xs text-slate-500 font-semibold mt-1">
                        Driver: <span className="text-slate-700 font-bold">{d?.name}</span> | Vehicle: <span className="text-slate-750 font-bold">{v?.registrationNumber}</span> ({v?.model})
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100/50 uppercase tracking-wider shadow-xs">
                      On Road
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Maintenance Records */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Vehicles in Workshop</h3>
            <button
              onClick={() => setActiveTab('maintenance')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-805 flex items-center gap-1 cursor-pointer transition-all hover:translate-x-0.5"
            >
              Maintenance Shop <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            {activeMaintenance.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm font-bold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                No vehicles currently in maintenance shop.
              </div>
            ) : (
              activeMaintenance.map((log) => {
                const v = vehicles.find((veh) => veh.id === log.vehicleId);
                return (
                  <div key={log.id} className="flex justify-between items-center p-4 border border-slate-100 bg-slate-50/30 rounded-2xl hover:bg-slate-50/70 transition-all">
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">VEHICLE IN SERVICE</span>
                      <div className="font-bold text-slate-850 text-sm mt-0.5">{v?.registrationNumber} ({v?.model})</div>
                      <div className="text-xs text-slate-550 font-medium mt-1">Issue: <span className="font-semibold text-slate-700">{log.description}</span></div>
                    </div>
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100/50 uppercase tracking-wider shadow-xs">
                      In Shop
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
