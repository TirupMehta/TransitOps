import { LayoutDashboard, Truck, Users, Compass, Wrench, Fuel, BarChart3, Settings, UserCheck } from 'lucide-react';
import type { ComponentType } from 'react';

export interface RouteConfig {
  id: 'dashboard' | 'fleet' | 'drivers' | 'trips' | 'maintenance' | 'expenses' | 'analytics' | 'settings' | 'fleet-registry';
  label: string;
  icon: ComponentType<any>;
}

export const routes: RouteConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'fleet', label: 'Fleet', icon: Truck },
  { id: 'fleet-registry', label: 'Fleet Managers', icon: UserCheck },
  { id: 'drivers', label: 'Drivers', icon: Users },
  { id: 'trips', label: 'Trips', icon: Compass },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'expenses', label: 'Fuel & Expenses', icon: Fuel },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];
