import React, { useState } from 'react';
import type { Vehicle, Driver, Trip, DashboardKpis } from '../../types';
import { StatCard } from '../ui/StatCard';
import { Filter, Truck, CheckCircle, Wrench, Navigation, Clock, UserCheck, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface OverviewTabProps {
  kpis: DashboardKpis;
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  userRole?: string;
  setActiveTab: (tab: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  kpis,
  trips,
  vehicles,
  drivers,
  setActiveTab,
}) => {
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Calculate vehicle counts for progress bars
  const availableCount = vehicles.filter(v => v.status === 'Available').length;
  const onTripCount = vehicles.filter(v => v.status === 'On Trip').length;
  const inShopCount = vehicles.filter(v => v.status === 'In Shop').length;
  const retiredCount = vehicles.filter(v => v.status === 'Retired').length;
  const totalCount = vehicles.length || 1;

  const getTripBadgeVariant = (status: Trip['status']) => {
    switch (status) {
      case 'Draft': return 'neutral';
      case 'Dispatched': return 'info';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
    }
  };

  // Filter recent trips based on selected filters (type/status)
  const recentTrips = trips.map(t => {
    const v = vehicles.find(veh => veh.id === t.vehicleId);
    const d = drivers.find(drv => drv.id === t.driverId);
    return {
      ...t,
      vehicleObj: v,
      driverObj: d
    };
  }).filter(t => {
    const matchesType = typeFilter ? t.vehicleObj?.type === typeFilter : true;
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesType && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Search Filters (Outset Neumorphic) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl neumorph-outset">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-secondary text-xs font-extrabold tracking-wider">
            <Filter className="w-4 h-4 text-orange" />
            <span>Search Filters</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
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
            <div className="rounded-xl neumorph-inset px-2 py-0.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-primary font-extrabold focus:outline-none py-1.5 px-2 cursor-pointer"
              >
                <option value="" className="bg-card-theme text-primary">Status: All</option>
                <option value="Draft" className="bg-card-theme text-primary">Draft</option>
                <option value="Dispatched" className="bg-card-theme text-primary">Dispatched</option>
                <option value="Completed" className="bg-card-theme text-primary">Completed</option>
                <option value="Cancelled" className="bg-card-theme text-primary">Cancelled</option>
              </select>
            </div>
            <div className="rounded-xl neumorph-inset px-2 py-0.5">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="bg-transparent text-xs text-primary font-extrabold focus:outline-none py-1.5 px-2 cursor-pointer"
              >
                <option value="" className="bg-card-theme text-primary">Region: All</option>
                <option value="East" className="bg-card-theme text-primary">East Coast</option>
                <option value="West" className="bg-card-theme text-primary">West Coast</option>
                <option value="Central" className="bg-card-theme text-primary">Central Hub</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Central Report Hero Card matching screenshot */}
      <div className="rounded-3xl p-8 bg-card-theme border border-theme shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1 space-y-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c82046] block">Overview Analysis</span>
          <h2 className="text-2xl font-extrabold text-primary font-sans">Fleet Performance Metrics</h2>
          
          <div className="space-y-1">
            <span className="text-xs font-semibold text-secondary block">Total Distance Covered</span>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-extrabold text-primary tracking-tight">224,500 km</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-extrabold">
                ▲ 12.4%
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#c82046]/10 text-[#c82046] text-xs font-extrabold">
                Avg: 8.5 km/L
              </span>
            </div>
            <span className="text-[10px] text-secondary font-bold block">vs prev. 199,730 km Jun 1 - Aug 31, 2026</span>
          </div>

          {/* Mini split bar mimicking the distribution bar in screenshot */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <div className="w-2.5 h-2.5 rounded-full bg-[#c82046]"></div>
              <span>Vans (12,500 km)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
              <span>Trucks (89,000 km)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <div className="w-2.5 h-2.5 rounded-full bg-[#76767d]"></div>
              <span>Other (123,000 km)</span>
            </div>
          </div>
        </div>

        {/* Small stats pill cards on the right side matching screenshot */}
        <div className="flex flex-wrap md:flex-col justify-end gap-3 shrink-0">
          <div className="rounded-2xl p-4 bg-app-theme/40 border border-theme flex items-center justify-between gap-4 w-44">
            <div>
              <span className="text-[9px] text-secondary font-extrabold uppercase tracking-wider block">Fleet Size</span>
              <span className="text-sm font-extrabold text-primary">{vehicles.length} Active</span>
            </div>
            <Truck className="w-5 h-5 text-orange shrink-0" />
          </div>

          <div className="rounded-2xl p-4 bg-app-theme/40 border border-theme flex items-center justify-between gap-4 w-44">
            <div>
              <span className="text-[9px] text-secondary font-extrabold uppercase tracking-wider block">Utilization</span>
              <span className="text-sm font-extrabold text-primary">{kpis.fleetUtilization}%</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-extrabold text-[10px]">
              ▲
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
          iconBg="bg-orange-light"
        />
        <StatCard
          title="Available Fleet"
          value={String(kpis.availableVehicles).padStart(2, '0')}
          subtitle="Ready for Trip"
          icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          title="In Maintenance"
          value={String(kpis.vehiclesInMaintenance).padStart(2, '0')}
          subtitle="In Shop"
          icon={<Wrench className="w-3.5 h-3.5 text-amber-500" />}
          iconBg="bg-amber-500/10"
        />
        <StatCard
          title="Active Trips"
          value={String(kpis.activeTrips).padStart(2, '0')}
          subtitle="On Road"
          icon={<Navigation className="w-3.5 h-3.5 text-blue-500" />}
          iconBg="bg-blue-500/10"
        />
        <StatCard
          title="Pending Trips"
          value={String(kpis.pendingTrips).padStart(2, '0')}
          subtitle="Draft status"
          icon={<Clock className="w-3.5 h-3.5 text-orange" />}
          iconBg="bg-orange/10"
        />
        <StatCard
          title="Drivers On Duty"
          value={String(kpis.driversOnDuty).padStart(2, '0')}
          subtitle="On Service"
          icon={<UserCheck className="w-3.5 h-3.5 text-amber-600" />}
          iconBg="bg-amber-600/10"
        />
        <StatCard
          title="Fleet Utilization"
          value={`${kpis.fleetUtilization}%`}
          subtitle="Utility Rate"
          icon={<TrendingUp className="w-3.5 h-3.5 text-cyan-500" />}
          iconBg="bg-cyan-500/10"
        />
      </div>

      {/* Main Content split panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Recent Trips Table (Spans 2 columns) */}
        <div className="lg:col-span-2 rounded-3xl p-5 md:p-6 neumorph-outset flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-primary text-sm tracking-wider">Recent Trips</h3>
              <button
                onClick={() => setActiveTab('trips')}
                className="text-xs font-bold text-orange hover:text-orange/80 cursor-pointer transition-all"
              >
                Trips Directory
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-theme text-secondary text-xs font-semibold tracking-wider">
                    <th className="pb-3 pr-4">Trip</th>
                    <th className="pb-3 pr-4">Vehicle</th>
                    <th className="pb-3 pr-4">Driver</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">ETA</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-primary">
                  {recentTrips.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-secondary font-bold bg-transparent">
                        No trips found.
                      </td>
                    </tr>
                  ) : (
                    recentTrips.map((trip) => (
                      <tr key={trip.id} className="border-b border-theme/30 hover-row transition-colors">
                        <td className="py-3 font-extrabold text-primary tabular-nums">{trip.tripCode}</td>
                        <td className="py-3 font-extrabold text-orange">{trip.vehicleObj?.model || 'Unassigned'}</td>
                        <td className="py-3 font-bold text-primary">{trip.driverObj?.name || 'Unassigned'}</td>
                        <td className="py-3">
                          <Badge variant={getTripBadgeVariant(trip.status)}>{trip.status}</Badge>
                        </td>
                        <td className="py-3 text-right font-extrabold text-secondary tabular-nums">{trip.eta}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Panel: Vehicle Status progress bars */}
        <div className="rounded-3xl p-5 md:p-6 neumorph-outset flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-primary text-sm uppercase tracking-wider">Vehicle Status</h3>
              <button
                onClick={() => setActiveTab('fleet')}
                className="text-xs font-bold text-orange hover:text-orange/80 cursor-pointer transition-all"
              >
                Fleet Registry
              </button>
            </div>

            <div className="space-y-5 mt-4">
              {/* Available */}
              <div>
                <div className="flex justify-between text-xs font-extrabold mb-1.5">
                  <span className="text-primary flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
                  </span>
                  <span className="text-secondary tabular-nums">{availableCount} vehicles</span>
                </div>
                <div className="h-2 w-full rounded-full bg-inset-theme overflow-hidden neumorph-inset">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(availableCount / totalCount) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* On Trip */}
              <div>
                <div className="flex justify-between text-xs font-extrabold mb-1.5">
                  <span className="text-primary flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> On Trip
                  </span>
                  <span className="text-secondary tabular-nums">{onTripCount} vehicles</span>
                </div>
                <div className="h-2 w-full rounded-full bg-inset-theme overflow-hidden neumorph-inset">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${(onTripCount / totalCount) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* In Shop */}
              <div>
                <div className="flex justify-between text-xs font-extrabold mb-1.5">
                  <span className="text-primary flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> In Shop
                  </span>
                  <span className="text-secondary tabular-nums">{inShopCount} vehicles</span>
                </div>
                <div className="h-2 w-full rounded-full bg-inset-theme overflow-hidden neumorph-inset">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(inShopCount / totalCount) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Retired */}
              <div>
                <div className="flex justify-between text-xs font-extrabold mb-1.5">
                  <span className="text-primary flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Retired
                  </span>
                  <span className="text-secondary tabular-nums">{retiredCount} vehicles</span>
                </div>
                <div className="h-2 w-full rounded-full bg-inset-theme overflow-hidden neumorph-inset">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${(retiredCount / totalCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
