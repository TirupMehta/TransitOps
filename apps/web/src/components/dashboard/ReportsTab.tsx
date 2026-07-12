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
      <div className="p-6 rounded-3xl neumorph-outset border border-white/50 flex justify-between items-center bg-[#faf5e9]">
        <div>
          <h3 className="font-extrabold text-[#2e2520] text-base uppercase tracking-wider">Financial Performance & Fleet ROI</h3>
          <p className="text-xs text-[#87786f] font-bold mt-1">
            Calculated as: <code className="text-[#b84a14] bg-[#faf5e9] shadow-[inset_1.5px_1.5px_3px_#e0d4bc,inset_-1.5px_-1.5px_3px_#ffffff] border border-white/10 px-2 py-0.5 rounded-lg font-bold font-mono text-[10px] uppercase tracking-wider">[ Revenue - (Maintenance + Fuel) ] / Acquisition Cost</code>
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl overflow-hidden neumorph-outset border border-white/50 bg-[#faf5e9]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#faf5e9] border-b border-[#eedebd]/60 text-[#87786f] text-xs font-extrabold uppercase tracking-wider">
              <th className="px-6 py-4">Vehicle Reg</th>
              <th className="px-6 py-4">Distance Driven</th>
              <th className="px-6 py-4">Acquisition Cost</th>
              <th className="px-6 py-4">Total Expenses</th>
              <th className="px-6 py-4">Est. Fuel Efficiency</th>
              <th className="px-6 py-4 text-right">Computed ROI (Est)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eedebd]/40 text-sm font-semibold text-[#2e2520]">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[#87786f] font-bold bg-[#faf5e9]/50">
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
                  <tr key={v.id} className="hover:bg-[#eedebd]/20 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-[#b84a14]">{v.registrationNumber}</td>
                    <td className="px-6 py-4 font-bold text-[#87786f]">{v.odometer.toLocaleString()} km</td>
                    <td className="px-6 py-4 text-[#2e2520]/80">${v.acquisitionCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-rose-650 font-extrabold">${totalExpenses.toLocaleString()}</td>
                    <td className="px-6 py-4 font-extrabold text-[#2e2520]">{getVehicleFuelEfficiency(v.id)} km/L</td>
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
