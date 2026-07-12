// Navigation path constants for all dashboard tabs
export const NAV_PATHS = {
  root: '/',
  dashboard: '/dashboard/overview',
  fleet: '/dashboard/vehicles',
  fleetRegistry: '/dashboard/managers',
  drivers: '/dashboard/drivers',
  trips: '/dashboard/trips',
  maintenance: '/dashboard/maintenance',
  expenses: '/dashboard/expenses',
  analytics: '/dashboard/analytics',
  settings: '/dashboard/settings',
} as const;

export type NavPath = (typeof NAV_PATHS)[keyof typeof NAV_PATHS];

// Map URL path segments to tab IDs used in DashboardView
export const PATH_TO_TAB: Record<string, string> = {
  overview: 'dashboard',
  vehicles: 'fleet',
  managers: 'fleet-registry',
  drivers: 'drivers',
  trips: 'trips',
  maintenance: 'maintenance',
  expenses: 'expenses',
  analytics: 'analytics',
  settings: 'settings',
};

export const TAB_TO_PATH: Record<string, string> = {
  dashboard: '/dashboard/overview',
  fleet: '/dashboard/vehicles',
  'fleet-registry': '/dashboard/managers',
  drivers: '/dashboard/drivers',
  trips: '/dashboard/trips',
  maintenance: '/dashboard/maintenance',
  expenses: '/dashboard/expenses',
  analytics: '/dashboard/analytics',
  settings: '/dashboard/settings',
};
