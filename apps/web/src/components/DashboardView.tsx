import React, { useState, useEffect } from 'react';
import { storage, getKpis } from '../utils/api';
import type { User, Vehicle, Driver, Trip, MaintenanceLog, Expense } from '../types';
import { Sidebar, isTabAllowed } from './dashboard/Sidebar';
import { Header } from './dashboard/Header';
import { OverviewTab } from './dashboard/OverviewTab';
import { VehiclesTab } from './dashboard/VehiclesTab';
import { DriversTab } from './dashboard/DriversTab';
import { TripsTab } from './dashboard/TripsTab';
import { MaintenanceTab } from './dashboard/MaintenanceTab';
import { ExpensesTab } from './dashboard/ExpensesTab';
import { ReportsTab } from './dashboard/ReportsTab';
import { SettingsTab as DashboardSettingsTab } from './dashboard/SettingsTab';
import { FleetManagerSection } from './dashboard/FleetManagerSection';
import { trpcClient } from '../lib/trpc';

interface DashboardViewProps {
  user: User;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

type TabType = 'dashboard' | 'fleet' | 'drivers' | 'trips' | 'maintenance' | 'expenses' | 'analytics' | 'settings' | 'fleet-registry';

export const DashboardView: React.FC<DashboardViewProps> = ({ user, theme, onToggleTheme }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [kpis, setKpis] = useState(getKpis());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const refreshData = async () => {
    setVehicles(storage.getVehicles());

    try {
      const client = trpcClient as any;
      const res = await client.driver.list.query({ page: 1, perPage: 100 });
      const mapped = res.data.map((d: any) => ({
        id: d.id,
        name: d.driverName,
        licenseNumber: d.driverLicenseNumber,
        licenseCategory: 'LMV',
        licenseExpiryDate: d.driverLicenseExpiryDate,
        contactNumber: d.driverPhone,
        tripCompletionRate: 98,
        safetyScore: 92,
        status: 'Available',
      }));
      setDrivers(mapped);
    } catch {
      setDrivers(storage.getDrivers());
    }

    setTrips(storage.getTrips());
    setMaintenance(storage.getMaintenance());
    setExpenses(storage.getExpenses());
    setKpis(getKpis());
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  // Ensure user is redirected to a tab they are allowed to see if the active tab is restricted
  useEffect(() => {
    if (!isTabAllowed(activeTab, user.role)) {
      setActiveTab('dashboard');
    }
  }, [user.role, activeTab]);

  const getVehicleExpensesSum = (vehicleId: number) => {
    const vExpenses = expenses.filter((e) => e.vehicleId === vehicleId);
    const fuelLogsSum = vExpenses.filter(e => e.type === 'Fuel').reduce((sum, e) => sum + e.amount, 0);
    const otherExpensesSum = vExpenses.filter(e => e.type !== 'Fuel').reduce((sum, e) => sum + e.amount, 0);
    
    // Include maintenance costs directly linked to this vehicle
    const maintSum = storage.getMaintenance()
      .filter(m => m.vehicleId === vehicleId)
      .reduce((sum, m) => sum + m.cost, 0);

    return fuelLogsSum + maintSum + otherExpensesSum;
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
            userRole={user.role}
            setActiveTab={(tab) => setActiveTab(tab as TabType)}
          />
        );
      case 'fleet':
        return (
          <VehiclesTab
            vehicles={vehicles}
            userRole={user.role}
            onUpdate={refreshData}
          />
        );
      case 'fleet-registry':
        return (
          <FleetManagerSection
            vehicles={vehicles}
            userRole={user.role}
            onUpdate={refreshData}
          />
        );
      case 'drivers':
        return (
          <DriversTab 
            drivers={drivers} 
            userRole={user.role}
            onUpdate={refreshData} 
          />
        );
      case 'trips':
        return (
          <TripsTab
            trips={trips}
            vehicles={vehicles}
            drivers={drivers}
            userRole={user.role}
            onUpdate={refreshData}
          />
        );
      case 'maintenance':
        return (
          <MaintenanceTab
            maintenance={maintenance}
            vehicles={vehicles}
            userRole={user.role}
            onUpdate={refreshData}
          />
        );
      case 'expenses':
        return (
          <ExpensesTab 
            expenses={expenses} 
            vehicles={vehicles} 
            userRole={user.role}
            onUpdate={refreshData}
          />
        );
      case 'analytics':
        return (
          <ReportsTab
            vehicles={vehicles}
            getVehicleExpensesSum={getVehicleExpensesSum}
          />
        );
      case 'settings':
        return (
          <DashboardSettingsTab 
            user={user}
            onUpdate={refreshData} 
          />
        );
      default:
        return <div>Tab not found</div>;
    }
  };

  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Overview Dashboard';
      case 'fleet': return 'Fleet Registry';
      case 'fleet-registry': return 'Fleet Managers';
      case 'drivers': return 'Driver Profiles';
      case 'trips': return 'Trip Dispatcher';
      case 'maintenance': return 'Maintenance Shop';
      case 'expenses': return 'Fuel & Expenses';
      case 'analytics': return 'Reports & Analytics';
      case 'settings': return 'Settings & RBAC';
      default: return tab;
    }
  };

  return (
    <div className="flex h-screen bg-app-theme overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab as TabType)}
        user={user}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeTab={activeTab} user={user} theme={theme} onToggleTheme={onToggleTheme} />

        <div className="flex-1 overflow-y-auto p-5 md:p-8 relative bg-app-theme space-y-6">
          {/* Page Title & Breadcrumbs header */}
          <div className="flex items-center gap-2.5 shrink-0 border-b border-theme/60 pb-3.5">
            <span className="text-secondary text-xs font-extrabold tracking-wider">TransitOps</span>
            <span className="text-secondary/20 text-sm">/</span>
            <h1 className="text-sm font-extrabold text-primary tracking-widest font-sans uppercase">
              {getBreadcrumbTitle(activeTab)}
            </h1>
          </div>

          <div>
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
};
