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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Financial Performance & Fleet ROI</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Calculated as: <code className="text-indigo-650 bg-indigo-50 px-1 py-0.5 rounded font-bold font-mono">[ Revenue - (Maintenance + Fuel) ] / Acquisition Cost</code>
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Vehicle Reg</th>
              <th className="px-6 py-4">Distance Driven</th>
              <th className="px-6 py-4">Acquisition Cost</th>
              <th className="px-6 py-4">Total Expenses</th>
              <th className="px-6 py-4">Est. Fuel Efficiency</th>
              <th className="px-6 py-4 text-right">Computed ROI (Est)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
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
                  <tr key={v.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{v.registrationNumber}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{v.odometer.toLocaleString()} km</td>
                    <td className="px-6 py-4 font-semibold text-slate-650">${v.acquisitionCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-rose-600 font-bold">${totalExpenses.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{getVehicleFuelEfficiency(v.id)} km/L</td>
                    <td className="px-6 py-4 text-right font-extrabold text-indigo-600 text-base">{roi}%</td>
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
