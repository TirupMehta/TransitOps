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
      <div className="p-6 rounded-3xl neumorph-outset flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-primary text-base tracking-wider">Financial Performance & Fleet ROI</h3>
          <p className="text-xs text-secondary font-bold mt-2">
            Calculated as: <code className="text-orange bg-app-theme border border-theme px-2.5 py-1 rounded-xl font-bold font-mono text-[10px] tracking-wider">[ Revenue - (Maintenance + Fuel) ] / Acquisition Cost</code>
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl overflow-hidden neumorph-outset border border-theme">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-transparent border-b border-theme text-secondary text-xs font-extrabold uppercase tracking-wider">
              <th className="px-6 py-4">Vehicle Reg</th>
              <th className="px-6 py-4">Distance Driven</th>
              <th className="px-6 py-4">Acquisition Cost</th>
              <th className="px-6 py-4">Total Expenses</th>
              <th className="px-6 py-4">Est. Fuel Efficiency</th>
              <th className="px-6 py-4 text-right">Computed ROI (Est)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme text-sm font-semibold text-primary">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-secondary font-bold bg-transparent">
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
                  <tr key={v.id} className="hover-row transition-colors">
                    <td className="px-6 py-4 font-extrabold text-orange">{v.registrationNumber}</td>
                    <td className="px-6 py-4 font-bold text-secondary">{v.odometer.toLocaleString()} km</td>
                    <td className="px-6 py-4 text-primary">${v.acquisitionCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-rose-500 font-extrabold">${totalExpenses.toLocaleString()}</td>
                    <td className="px-6 py-4 font-extrabold text-primary">{getVehicleFuelEfficiency(v.id)} km/L</td>
                    <td className="px-6 py-4 text-right font-extrabold text-orange text-base">{roi}%</td>
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
