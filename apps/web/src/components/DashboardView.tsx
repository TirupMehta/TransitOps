import React, { useState, useEffect } from 'react';
import { storage, getKpis } from '../utils/api';
import type { User, Vehicle, Driver, Trip, MaintenanceLog, Expense } from '../types';
import { Sidebar } from './dashboard/Sidebar';
import { Header } from './dashboard/Header';
import { OverviewTab } from './dashboard/OverviewTab';
import { VehiclesTab } from './dashboard/VehiclesTab';
import { DriversTab } from './dashboard/DriversTab';
import { TripsTab } from './dashboard/TripsTab';
import { MaintenanceTab } from './dashboard/MaintenanceTab';
import { ExpensesTab } from './dashboard/ExpensesTab';
import { ReportsTab } from './dashboard/ReportsTab';

interface DashboardViewProps {
  user: User;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

type TabType = 'dashboard' | 'vehicles' | 'drivers' | 'trips' | 'maintenance' | 'expenses' | 'reports';

export const DashboardView: React.FC<DashboardViewProps> = ({ user, theme, onToggleTheme }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [kpis, setKpis] = useState(getKpis());

  const refreshData = () => {
    setVehicles(storage.getVehicles());
    setDrivers(storage.getDrivers());
    setTrips(storage.getTrips());
    setMaintenance(storage.getMaintenance());
    setExpenses(storage.getExpenses());
    setKpis(getKpis());
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const getVehicleExpensesSum = (vehicleId: number) => {
    return expenses.filter((e) => e.vehicleId === vehicleId).reduce((sum, e) => sum + e.amount, 0);
  };

  const getVehicleFuelEfficiency = (vehicleId: number) => {
    const vTrips = trips.filter((t) => t.vehicleId === vehicleId && t.status === 'Completed');
    const totalDist = vTrips.reduce((sum, t) => sum + t.distance, 0);
    const fuelLogs = expenses.filter((e) => e.vehicleId === vehicleId && e.type === 'Fuel');
    const totalFuelAmount = fuelLogs.reduce((sum, e) => sum + e.amount, 0);
    const estLiters = totalFuelAmount / 1.65; // $1.65 per liter
    return estLiters > 0 ? (totalDist / estLiters).toFixed(1) : '0.0';
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <OverviewTab
            kpis={kpis}
            trips={trips}
            vehicles={vehicles}
            drivers={drivers}
            maintenance={maintenance}
            setActiveTab={setActiveTab}
          />
        );
      case 'vehicles':
        return (
          <VehiclesTab
            vehicles={vehicles}
            getVehicleExpensesSum={getVehicleExpensesSum}
          />
        );
      case 'drivers':
        return <DriversTab drivers={drivers} />;
      case 'trips':
        return (
          <TripsTab
            trips={trips}
            vehicles={vehicles}
            drivers={drivers}
          />
        );
      case 'maintenance':
        return (
          <MaintenanceTab
            maintenance={maintenance}
            vehicles={vehicles}
          />
        );
      case 'expenses':
        return <ExpensesTab expenses={expenses} vehicles={vehicles} />;
      case 'reports':
        return (
          <ReportsTab
            vehicles={vehicles}
            getVehicleExpensesSum={getVehicleExpensesSum}
            getVehicleFuelEfficiency={getVehicleFuelEfficiency}
          />
        );
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#1a120b] overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeTab={activeTab} user={user} theme={theme} onToggleTheme={onToggleTheme} />

        <div className="flex-1 overflow-y-auto p-8 relative bg-[#1a120b]/30">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};
