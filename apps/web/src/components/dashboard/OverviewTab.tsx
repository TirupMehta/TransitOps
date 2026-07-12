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
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl neumorph-outset">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-secondary text-xs font-extrabold tracking-wider">
            <Filter className="w-4 h-4 text-orange" />
            <span>Search Filters</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl neumorph-inset px-2 py-0.5">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs text-primary font-extrabold focus:outline-none py-1.5 px-2 cursor-pointer"
              >
                <option value="" className="bg-card-theme text-primary">All Vehicle Types</option>
                <option value="Van" className="bg-card-theme text-primary">Vans</option>
                <option value="Truck" className="bg-card-theme text-primary">Trucks</option>
              </select>
            </div>
            <div className="rounded-xl neumorph-inset px-2 py-0.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-primary font-extrabold focus:outline-none py-1.5 px-2 cursor-pointer"
              >
                <option value="" className="bg-card-theme text-primary">All Statuses</option>
                <option value="Available" className="bg-card-theme text-primary">Available</option>
                <option value="On Trip" className="bg-card-theme text-primary">On Trip</option>
                <option value="In Shop" className="bg-card-theme text-primary">In Shop</option>
              </select>
            </div>
            <div className="rounded-xl neumorph-inset px-2 py-0.5">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="bg-transparent text-xs text-primary font-extrabold focus:outline-none py-1.5 px-2 cursor-pointer"
              >
                <option value="" className="bg-card-theme text-primary">All Regions</option>
                <option value="East" className="bg-card-theme text-primary">East Coast</option>
                <option value="West" className="bg-card-theme text-primary">West Coast</option>
                <option value="Central" className="bg-card-theme text-primary">Central Hub</option>
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
          icon={<Truck className="w-5 h-5 text-orange" />}
          iconBg="bg-orange/10"
        />

        {/* KPI 2: Available Fleet */}
        <StatCard
          title="Available Fleet"
          value={kpis.availableVehicles}
          subtitle="Ready for dispatching"
          icon={<CheckCircle className="w-5 h-5 text-[#4f6128]" />}
          iconBg="bg-[#4f6128]/10"
        />

        {/* KPI 3: In Maintenance */}
        <StatCard
          title="In Maintenance"
          value={kpis.vehiclesInMaintenance}
          subtitle="Currently inside shop"
          icon={<Wrench className="w-5 h-5 text-[#8a4f10]" />}
          iconBg="bg-[#8a4f10]/10"
        />

        {/* KPI 4: Fleet Utilization */}
        <StatCard
          title="Fleet Utilization"
          value={`${kpis.fleetUtilization}%`}
          subtitle="Operational utility rate"
          icon={<TrendingUp className="w-5 h-5 text-[#2b5058]" />}
          iconBg="bg-[#2b5058]/10"
          progress={kpis.fleetUtilization}
        />

        {/* Bento Column (Trip Dispatches) - Spans 2 columns */}
        <div className="md:col-span-2 rounded-3xl p-6 neumorph-outset flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-primary text-base tracking-wider">Active Dispatched Trips</h3>
              <button
                onClick={() => setActiveTab('trips')}
                className="text-xs font-bold text-orange hover:text-orange/80 flex items-center gap-1 cursor-pointer transition-all hover:translate-x-0.5"
              >
                Trips Directory <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {activeDispatchedTrips.length === 0 ? (
                <div className="text-center py-12 text-secondary text-xs font-bold neumorph-inset rounded-2xl">
                  No active trips currently dispatched.
                </div>
              ) : (
                activeDispatchedTrips.slice(0, 3).map((trip) => {
                  const v = vehicles.find((veh) => veh.id === trip.vehicleId);
                  const d = drivers.find((drv) => drv.id === trip.driverId);
                  return (
                    <div key={trip.id} className="flex justify-between items-center p-4 rounded-2xl neumorph-btn-vanilla hover:scale-[1.005] transition-all">
                      <div>
                        <span className="text-[9px] font-extrabold text-orange tracking-widest block">Route Path</span>
                        <div className="font-extrabold text-primary text-sm mt-0.5">{trip.source} → {trip.destination}</div>
                        <div className="text-xs text-secondary font-semibold mt-1">
                          Driver: <span className="text-primary font-bold">{d?.name}</span> | Vehicle: <span className="text-primary font-bold">{v?.registrationNumber}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-blue-400 bg-[#2b5058]/20 border border-[#2b5058]/30 px-2.5 py-1 rounded-full tracking-wider">
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
        <div className="md:col-span-2 rounded-3xl p-6 neumorph-outset flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-primary text-base tracking-wider">Vehicles In Workshop</h3>
              <button
                onClick={() => setActiveTab('maintenance')}
                className="text-xs font-bold text-orange hover:text-orange/80 flex items-center gap-1 cursor-pointer transition-all hover:translate-x-0.5"
              >
                Maintenance Logs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {activeMaintenance.length === 0 ? (
                <div className="text-center py-12 text-secondary text-xs font-bold neumorph-inset rounded-2xl">
                  No fleet vehicles currently in the shop.
                </div>
              ) : (
                activeMaintenance.slice(0, 3).map((log) => {
                  const v = vehicles.find((veh) => veh.id === log.vehicleId);
                  return (
                    <div key={log.id} className="flex justify-between items-center p-4 rounded-2xl neumorph-btn-vanilla hover:scale-[1.005] transition-all">
                      <div>
                        <span className="text-[9px] font-extrabold text-[#8a4f10] tracking-widest block">Service Job</span>
                        <div className="font-extrabold text-primary text-sm mt-0.5">{v?.registrationNumber} ({v?.model})</div>
                        <div className="text-xs text-secondary font-semibold mt-1">Issue: <span className="text-primary font-bold">{log.description}</span></div>
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-400 bg-[#8a4f10]/20 border border-[#8a4f10]/30 px-2.5 py-1 rounded-full tracking-wider">
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
