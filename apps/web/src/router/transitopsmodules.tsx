export interface TransitOpsModuleLink {
  id: string;
  label: string;
  path: string;
  description: string;
}

export interface TransitOpsModuleGroup {
  id: string;
  title: string;
  description: string;
  links: TransitOpsModuleLink[];
}

export const transitOpsModules: TransitOpsModuleGroup[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Overview of fleet performance, trip status, and compliance signals.',
    links: [
      { id: 'overview', label: 'Overview', path: '/dashboard/overview', description: 'KPI summary and live operations snapshot.' },
      { id: 'analytics', label: 'Analytics', path: '/dashboard/analytics', description: 'Fleet utilization, fuel efficiency, and ROI charts.' },
    ],
  },
  {
    id: 'vehicles',
    title: 'Vehicles',
    description: 'Register and monitor fleet assets with lifecycle and availability rules.',
    links: [
      { id: 'vehicle-registry', label: 'Vehicle Registry', path: '/dashboard/vehicles', description: 'Create, update, and review vehicle records.' },
      { id: 'maintenance', label: 'Maintenance', path: '/dashboard/maintenance', description: 'Open maintenance logs and manage shop status.' },
    ],
  },
  {
    id: 'drivers',
    title: 'Drivers',
    description: 'Manage driver profiles, compliance, and assignment eligibility.',
    links: [
      { id: 'driver-roster', label: 'Driver Roster', path: '/dashboard/drivers', description: 'Maintain license, safety score, and duty status.' },
    ],
  },
  {
    id: 'trips',
    title: 'Trips',
    description: 'Create dispatch-ready trips with business-rule validation.',
    links: [
      { id: 'trip-dispatch', label: 'Trip Dispatch', path: '/dashboard/trips', description: 'Assign vehicles and drivers to active deliveries.' },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    description: 'Track fuel, expenses, cost trends, and fleet ROI.',
    links: [
      { id: 'expenses', label: 'Expenses', path: '/dashboard/expenses', description: 'Record fuel, toll, and miscellaneous expense entries.' },
    ],
  },
];

export const transitOpsRoutes = transitOpsModules.flatMap((module) =>
  module.links.map((link) => ({ ...link, moduleId: module.id })),
);
