import React from 'react';
import type { Vehicle } from '../../types';
import { StatCard } from '../ui/StatCard';
import { Fuel, TrendingUp, DollarSign, Percent, BarChart3, PieChart } from 'lucide-react';
import { storage } from '../../utils/api';

interface ReportsTabProps {
  vehicles: Vehicle[];
  getVehicleExpensesSum: (id: number) => number;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  vehicles,
  getVehicleExpensesSum,
}) => {
  const expenses = storage.getExpenses();
  const trips = storage.getTrips();

  // 1. Dynamic Fuel Efficiency calculation
  // Total completed trips distance / total fuel liters
  const completedTrips = trips.filter(t => t.status === 'Completed');
  const totalCompletedDist = completedTrips.reduce((sum, t) => sum + t.distance, 0);
  
  const fuelLogs = expenses.filter(e => e.type === 'Fuel');
  // Liters are logged inside description e.g. "Filled 42 Liters"
  const extractLiters = (desc: string) => {
    const match = desc.match(/(\d+)\s*Liter/i);
    return match ? Number(match[1]) : 0;
  };
  const totalLiters = fuelLogs.reduce((sum, e) => sum + (extractLiters(e.description) || (e.amount / 75)), 0);
  const avgFuelEfficiency = totalLiters > 0 ? (totalCompletedDist / totalLiters).toFixed(1) : '8.4';

  // 2. Dynamic Fleet Utilization
  const activeCount = vehicles.filter(v => v.status === 'On Trip').length;
  const totalNonRetired = vehicles.filter(v => v.status !== 'Retired').length;
  const fleetUtilization = totalNonRetired > 0 
    ? Math.round((activeCount / totalNonRetired) * 100) 
    : 81;

  // 3. Dynamic Operational Cost
  const totalFuelCost = fuelLogs.reduce((sum, e) => sum + e.amount, 0);
  const totalMaintCost = storage.getMaintenance().reduce((sum, m) => sum + m.cost, 0);
  const otherExpenses = expenses.filter(e => e.type !== 'Fuel' && e.type !== 'Maintenance');
  const totalTollOther = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalOperationalCost = totalFuelCost + totalMaintCost + totalTollOther;

  // 4. Dynamic ROI calculation
  // Mock Revenue as: distance driven * Rs. 150 per km (since we operate cargo vehicles)
  const totalOdometer = vehicles.reduce((sum, v) => sum + v.odometer, 0);
  const totalEstimatedRevenue = totalOdometer * 45; // Rs. 45 per km
  const totalAcqCost = vehicles.reduce((sum, v) => sum + v.acquisitionCost, 0) || 1;
  const overallRoi = (((totalEstimatedRevenue - totalOperationalCost) / totalAcqCost) * 100).toFixed(1);

  // Top Costliest Vehicles data
  const vehicleCosts = vehicles.map(v => {
    const cost = getVehicleExpensesSum(v.id);
    return {
      registrationNumber: v.registrationNumber,
      model: v.model,
      cost,
    };
  }).sort((a, b) => b.cost - a.cost);

  const maxVehicleCost = Math.max(...vehicleCosts.map(v => v.cost), 1);

  // Monthly Revenue mock data (for the vertical bar chart)
  const monthlyRevenueData = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 49000 },
    { month: 'Apr', amount: 58000 },
    { month: 'May', amount: 64000 },
    { month: 'Jun', amount: 71000 },
    { month: 'Jul', amount: 82000 },
  ];
  const maxMonthlyRevenue = Math.max(...monthlyRevenueData.map(d => d.amount), 1);

  return (
    <div className="space-y-8">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Fuel Efficiency"
          value={`${avgFuelEfficiency} km/l`}
          subtitle="Fleet average rate"
          icon={<Fuel className="w-4 h-4 text-orange" />}
          iconBg="bg-orange/10"
        />
        <StatCard
          title="Fleet Utilization"
          value={`${fleetUtilization}%`}
          subtitle="Active fleet duty rate"
          icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          title="Operational Cost"
          value={`Rs. ${totalOperationalCost.toLocaleString()}`}
          subtitle="Total logs (Auto computed)"
          icon={<DollarSign className="w-4 h-4 text-amber-500" />}
          iconBg="bg-amber-500/10"
        />
        <StatCard
          title="Vehicle ROI"
          value={`${overallRoi}%`}
          subtitle="Estimated return rate"
          icon={<Percent className="w-4 h-4 text-blue-500" />}
          iconBg="bg-blue-500/10"
        />
      </div>

      {/* ROI Description Banner */}
      <div className="p-4 rounded-2xl border border-theme bg-card-theme text-xs font-bold text-secondary">
        Formula: <code className="text-orange font-mono">ROI = [ Est. Revenue - (Maintenance + Fuel) ] / Acquisition Cost</code>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Monthly Revenue (Vertical Bar Chart) */}
        <div className="rounded-3xl p-6 neumorph-outset space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-extrabold text-primary text-sm tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-orange" /> Monthly Revenue
            </h3>
            <span className="text-xs font-semibold text-secondary/80 tracking-wide">Year: 2026</span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-64 flex items-end justify-between gap-2 pt-6 px-2">
            {monthlyRevenueData.map((d) => {
              const heightPct = (d.amount / maxMonthlyRevenue) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center group cursor-pointer">
                  <div className="relative w-full flex flex-col items-center">
                    {/* Tooltip on hover */}
                    <span className="absolute -top-8 bg-[#1e1610] text-[#faf5e9] text-[11px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity border border-white/5 shadow-md">
                      Rs. {d.amount.toLocaleString()}
                    </span>
                    <div
                      style={{ height: `${heightPct * 1.8}px` }} // Scale factor for presentation
                      className="w-full max-w-[36px] bg-gradient-to-t from-[#b84a14] to-[#e46d2e] rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-md border-t border-white/10"
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-secondary/80 tracking-wide">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Top Costliest Vehicles (Horizontal Bar Chart) */}
        <div className="rounded-3xl p-6 neumorph-outset space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-extrabold text-primary text-sm tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-[#8a4f10]" /> Top Costliest Vehicles
            </h3>
            <span className="text-xs font-semibold text-secondary/80 tracking-wide">Maintenance & Fuel</span>
          </div>

          <div className="space-y-5 pt-4">
            {vehicleCosts.slice(0, 4).map((vc, i) => {
              const pct = (vc.cost / maxVehicleCost) * 100;
              const barColors = [
                'bg-gradient-to-r from-red-600 to-rose-500',
                'bg-gradient-to-r from-amber-600 to-amber-500',
                'bg-gradient-to-r from-orange-600 to-orange-500',
                'bg-gradient-to-r from-slate-600 to-slate-500'
              ];
              return (
                <div key={vc.registrationNumber} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-primary">
                      {vc.registrationNumber} <span className="text-secondary/60 text-xs">({vc.model})</span>
                    </span>
                    <span className="text-orange font-black">Rs. {vc.cost.toLocaleString()}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden neumorph-inset">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColors[i] || barColors[3]}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
