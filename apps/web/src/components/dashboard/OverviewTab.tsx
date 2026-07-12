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
      {/* Bento Header: Filters (Outset Neumorphic) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl neumorph-outset border border-white/50">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[#87786f] text-xs font-extrabold uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#b84a14]" />
            <span>Search Filters</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl bg-[#faf5e9] shadow-[inset_1.5px_1.5px_3px_#e0d4bc,inset_-1.5px_-1.5px_3px_#ffffff] border border-white/10 px-2 py-0.5">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs text-[#2e2520] font-extrabold focus:outline-none py-1.5 px-2 cursor-pointer"
              >
                <option value="">All Vehicle Types</option>
                <option value="Van">Vans</option>
                <option value="Truck">Trucks</option>
              </select>
            </div>
            <div className="rounded-xl bg-[#faf5e9] shadow-[inset_1.5px_1.5px_3px_#e0d4bc,inset_-1.5px_-1.5px_3px_#ffffff] border border-white/10 px-2 py-0.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-[#2e2520] font-extrabold focus:outline-none py-1.5 px-2 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="In Shop">In Shop</option>
              </select>
            </div>
            <div className="rounded-xl bg-[#faf5e9] shadow-[inset_1.5px_1.5px_3px_#e0d4bc,inset_-1.5px_-1.5px_3px_#ffffff] border border-white/10 px-2 py-0.5">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="bg-transparent text-xs text-[#2e2520] font-extrabold focus:outline-none py-1.5 px-2 cursor-pointer"
              >
                <option value="">All Regions</option>
                <option value="East">East Coast</option>
                <option value="West">West Coast</option>
                <option value="Central">Central Hub</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* KPI 1: Active Vehicles */}
        <StatCard
          title="Active Vehicles"
          value={kpis.activeVehicles}
          subtitle="Fleet currently dispatched"
          icon={<Truck className="w-5 h-5 text-[#b84a14]" />}
          iconBg="bg-[#fdf3ee]"
        />

        {/* KPI 2: Available Fleet */}
        <StatCard
          title="Available Fleet"
          value={kpis.availableVehicles}
          subtitle="Ready for dispatching"
          icon={<CheckCircle className="w-5 h-5 text-[#4f6128]" />}
          iconBg="bg-[#f0f4e4]"
        />

        {/* KPI 3: In Maintenance */}
        <StatCard
          title="In Maintenance"
          value={kpis.vehiclesInMaintenance}
          subtitle="Currently inside shop"
          icon={<Wrench className="w-5 h-5 text-[#8a4f10]" />}
          iconBg="bg-[#fbf2e6]"
        />

        {/* KPI 4: Fleet Utilization */}
        <StatCard
          title="Fleet Utilization"
          value={`${kpis.fleetUtilization}%`}
          subtitle="Operational utility rate"
          icon={<TrendingUp className="w-5 h-5 text-[#2b5058]" />}
          iconBg="bg-[#eaf3f5]"
          progress={kpis.fleetUtilization}
        />

        {/* Bento Column (Trip Dispatches) - Spans 2 columns */}
        <div className="md:col-span-2 rounded-3xl p-6 neumorph-outset border border-white/50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-[#2e2520] text-base uppercase tracking-wider">Active Dispatched Trips</h3>
              <button
                onClick={() => setActiveTab('trips')}
                className="text-xs font-bold text-[#b84a14] hover:text-[#d35e23] flex items-center gap-1 cursor-pointer transition-all hover:translate-x-0.5"
              >
                Trips Directory <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {activeDispatchedTrips.length === 0 ? (
                <div className="text-center py-12 text-[#87786f] text-xs font-bold bg-[#faf5e9] rounded-2xl shadow-[inset_2px_2px_6px_#e0d4bc,inset_-2px_-2px_6px_#ffffff] border border-white/10">
                  No active trips currently dispatched.
                </div>
              ) : (
                activeDispatchedTrips.slice(0, 3).map((trip) => {
                  const v = vehicles.find((veh) => veh.id === trip.vehicleId);
                  const d = drivers.find((drv) => drv.id === trip.driverId);
                  return (
                    <div key={trip.id} className="flex justify-between items-center p-4 rounded-2xl bg-[#faf5e9] shadow-[3px_3px_6px_#e0d4bc,-3px_-3px_6px_#ffffff] border border-white/20 hover:scale-[1.005] transition-all">
                      <div>
                        <span className="text-[9px] font-extrabold text-[#b84a14] uppercase tracking-widest block">Route Path</span>
                        <div className="font-extrabold text-[#2e2520] text-sm mt-0.5">{trip.source} → {trip.destination}</div>
                        <div className="text-xs text-[#87786f] font-semibold mt-1">
                          Driver: <span className="text-[#2e2520] font-bold">{d?.name}</span> | Vehicle: <span className="text-[#2e2520] font-bold">{v?.registrationNumber}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-blue-700 bg-[#eaf3f5] border border-[#cbe0e5]/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        On Road
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bento Column (Vehicles In Maintenance) - Spans 2 columns */}
        <div className="md:col-span-2 rounded-3xl p-6 neumorph-outset border border-white/50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-[#2e2520] text-base uppercase tracking-wider">Vehicles In Workshop</h3>
              <button
                onClick={() => setActiveTab('maintenance')}
                className="text-xs font-bold text-[#b84a14] hover:text-[#d35e23] flex items-center gap-1 cursor-pointer transition-all hover:translate-x-0.5"
              >
                Maintenance Logs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {activeMaintenance.length === 0 ? (
                <div className="text-center py-12 text-[#87786f] text-xs font-bold bg-[#faf5e9] rounded-2xl shadow-[inset_2px_2px_6px_#e0d4bc,inset_-2px_-2px_6px_#ffffff] border border-white/10">
                  No fleet vehicles currently in the shop.
                </div>
              ) : (
                activeMaintenance.slice(0, 3).map((log) => {
                  const v = vehicles.find((veh) => veh.id === log.vehicleId);
                  return (
                    <div key={log.id} className="flex justify-between items-center p-4 rounded-2xl bg-[#faf5e9] shadow-[3px_3px_6px_#e0d4bc,-3px_-3px_6px_#ffffff] border border-white/20 hover:scale-[1.005] transition-all">
                      <div>
                        <span className="text-[9px] font-extrabold text-[#8a4f10] uppercase tracking-widest block">Service Job</span>
                        <div className="font-extrabold text-[#2e2520] text-sm mt-0.5">{v?.registrationNumber} ({v?.model})</div>
                        <div className="text-xs text-[#87786f] font-semibold mt-1">Issue: <span className="text-[#2e2520] font-bold">{log.description}</span></div>
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-700 bg-[#fbf2e6] border border-[#f0dcb8]/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
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
    </div>
  );
};
