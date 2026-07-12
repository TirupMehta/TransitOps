import React from 'react';
import type { Vehicle } from '../../types';

interface ReportsTabProps {
  vehicles: Vehicle[];
  getVehicleExpensesSum: (id: number) => number;
  getVehicleFuelEfficiency: (id: number) => string;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  vehicles,
  getVehicleExpensesSum,
  getVehicleFuelEfficiency,
}) => {
  return (
    <div className="space-y-8">
      <div className="p-6 rounded-3xl neumorph-outset flex justify-between items-center bg-transparent">
        <div>
          <h3 className="font-extrabold text-[#faf5e9] text-base uppercase tracking-wider">Financial Performance & Fleet ROI</h3>
          <p className="text-xs text-[#87786f] font-bold mt-2">
            Calculated as: <code className="text-[#b84a14] bg-[#1e1610] border border-white/5 px-2.5 py-1 rounded-xl font-bold font-mono text-[10px] uppercase tracking-wider">[ Revenue - (Maintenance + Fuel) ] / Acquisition Cost</code>
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl overflow-hidden neumorph-outset border border-white/5 bg-transparent">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-transparent border-b border-[#eedebd]/10 text-[#87786f] text-xs font-extrabold uppercase tracking-wider">
              <th className="px-6 py-4">Vehicle Reg</th>
              <th className="px-6 py-4">Distance Driven</th>
              <th className="px-6 py-4">Acquisition Cost</th>
              <th className="px-6 py-4">Total Expenses</th>
              <th className="px-6 py-4">Est. Fuel Efficiency</th>
              <th className="px-6 py-4 text-right">Computed ROI (Est)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eedebd]/10 text-sm font-semibold text-white/70">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[#87786f] font-bold bg-[#faf5e9]/5">
                  No vehicles registered in fleet.
                </td>
              </tr>
            ) : (
              vehicles.map((v) => {
                const totalExpenses = getVehicleExpensesSum(v.id);
                // ROI Formula: [ (Est Revenue - Total Expenses) / Acquisition Cost ] * 100
                // Mocks Revenue as: distance * $2.20 per km
                const mockRev = v.odometer * 2.2;
                const roi = v.acquisitionCost > 0 
                  ? (((mockRev - totalExpenses) / v.acquisitionCost) * 100).toFixed(1) 
                  : '0.0';

                return (
                  <tr key={v.id} className="hover:bg-[#eedebd]/5 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-[#b84a14]">{v.registrationNumber}</td>
                    <td className="px-6 py-4 font-bold text-[#87786f]">{v.odometer.toLocaleString()} km</td>
                    <td className="px-6 py-4 text-white/60">${v.acquisitionCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-rose-400 font-extrabold">${totalExpenses.toLocaleString()}</td>
                    <td className="px-6 py-4 font-extrabold text-white/80">{getVehicleFuelEfficiency(v.id)} km/L</td>
                    <td className="px-6 py-4 text-right font-extrabold text-[#b84a14] text-base">{roi}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
