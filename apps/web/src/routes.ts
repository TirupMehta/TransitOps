import { LayoutDashboard, Truck, Users, Compass, Wrench, Fuel, BarChart3 } from 'lucide-react';
import type { ComponentType } from 'react';

export interface RouteConfig {
  id: 'dashboard' | 'vehicles' | 'drivers' | 'trips' | 'maintenance' | 'expenses' | 'reports';
  label: string;
  icon: ComponentType<any>;
}

export const routes: RouteConfig[] = [
  { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'vehicles', label: 'Vehicle Registry', icon: Truck },
  { id: 'drivers', label: 'Driver Management', icon: Users },
  { id: 'trips', label: 'Trip Management', icon: Compass },
  { id: 'maintenance', label: 'Maintenance Logs', icon: Wrench },
  { id: 'expenses', label: 'Fuel & Expenses', icon: Fuel },
  { id: 'reports', label: 'Reports & ROI', icon: BarChart3 },
];
