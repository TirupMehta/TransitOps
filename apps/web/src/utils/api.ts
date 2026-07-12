import type { User, Vehicle, Driver, Trip, MaintenanceLog, Expense, DashboardKpis, GeneralSettings } from '../types';

const BASE_URL = 'http://localhost:3333/api/v1';

// Seed Initial Mock Data exactly matching the mockup screens
const INITIAL_VEHICLES: Vehicle[] = [
  { id: 1, registrationNumber: 'GJ01AB4321', model: 'VAN-05', type: 'Van', loadCapacity: 500, odometer: 74000, acquisitionCost: 620000, status: 'Available' },
  { id: 2, registrationNumber: 'GJ01AB9981', model: 'TRUCK-11', type: 'Truck', loadCapacity: 5000, odometer: 182000, acquisitionCost: 2450000, status: 'On Trip' },
  { id: 3, registrationNumber: 'GJ01AB1120', model: 'MINI-03', type: 'Mini', loadCapacity: 1000, odometer: 66000, acquisitionCost: 410000, status: 'In Shop' },
  { id: 4, registrationNumber: 'GJ01AB0087', model: 'VAN-09', type: 'Van', loadCapacity: 750, odometer: 241900, acquisitionCost: 590000, status: 'Retired' },
];

const INITIAL_DRIVERS: Driver[] = [
  { id: 1, name: 'Alex', licenseNumber: 'DL-987213', licenseCategory: 'LMV', licenseExpiryDate: '2029-12-31', contactNumber: '98765xxxxx', safetyScore: 92, status: 'Available', tripCompletionRate: 96 },
  { id: 2, name: 'Jean', licenseNumber: 'DL-441210', licenseCategory: 'HMV', licenseExpiryDate: '2025-03-15', contactNumber: '98220xxxxx', safetyScore: 78, status: 'Suspended', tripCompletionRate: 91 }, // Expired
  { id: 3, name: 'Priya', licenseNumber: 'DL-770311', licenseCategory: 'LMV', licenseExpiryDate: '2027-09-30', contactNumber: '99810xxxxx', safetyScore: 85, status: 'On Trip', tripCompletionRate: 95 },
  { id: 4, name: 'Suresh', licenseNumber: 'DL-900145', licenseCategory: 'HMV', licenseExpiryDate: '2027-01-15', contactNumber: '97440xxxxx', safetyScore: 82, status: 'Off Duty', tripCompletionRate: 88 },
];

const INITIAL_TRIPS: Trip[] = [
  { id: 1, tripCode: 'TR001', source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', cargoWeight: 450, distance: 28, status: 'Dispatched', vehicleId: 1, driverId: 1, eta: '45 min' },
  { id: 2, tripCode: 'TR002', source: 'Depot A', destination: 'Distribution Yard', cargoWeight: 4200, distance: 340, status: 'Completed', vehicleId: 2, driverId: 3, eta: '--' },
  { id: 3, tripCode: 'TR003', source: 'Mansa', destination: 'Kalol Depot', cargoWeight: 300, distance: 15, status: 'Dispatched', vehicleId: 3, driverId: 1, eta: '3h 10m' },
  { id: 4, tripCode: 'TR004', source: 'Vatva Industrial Area', destination: 'Sanand Warehouse', cargoWeight: 3500, distance: 60, status: 'Draft', vehicleId: 2, driverId: 4, eta: 'Awaiting driver' },
  { id: 6, tripCode: 'TR006', source: 'Mansa', destination: 'Kalol Depot', cargoWeight: 0, distance: 0, status: 'Cancelled', vehicleId: 4, driverId: 2, eta: 'Vehicle sent to shop' }
];

const INITIAL_MAINTENANCE: MaintenanceLog[] = [
  { id: 1, vehicleId: 1, description: 'Oil Change', cost: 2500, date: '2026-07-07', status: 'Active' },
  { id: 2, vehicleId: 2, description: 'Engine Repair', cost: 18000, date: '2026-07-06', status: 'Completed' },
  { id: 3, vehicleId: 3, description: 'Tyre Replace', cost: 6200, date: '2026-07-05', status: 'Active' },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 1, vehicleId: 1, type: 'Fuel', amount: 3150, date: '2026-07-05', description: 'Filled 42 Liters' },
  { id: 2, vehicleId: 2, type: 'Fuel', amount: 8400, date: '2026-07-06', description: 'Filled 110 Liters' },
  { id: 3, vehicleId: 3, type: 'Fuel', amount: 2050, date: '2026-07-06', description: 'Filled 28 Liters' },
  { id: 4, vehicleId: 1, tripId: 1, type: 'Toll', amount: 120, date: '2026-07-05', description: 'Toll plaza charges' },
  { id: 5, vehicleId: 2, tripId: 2, type: 'Toll', amount: 340, date: '2026-07-06', description: 'Highway entry toll' },
  { id: 6, vehicleId: 2, tripId: 2, type: 'Other', amount: 150, date: '2026-07-06', description: 'Loading fee' },
  { id: 7, vehicleId: 2, type: 'Maintenance', amount: 18000, date: '2026-07-06', description: 'Engine Repair' },
];

const INITIAL_SETTINGS: GeneralSettings = {
  depotName: 'Gandhinagar Depot GIDY',
  currency: 'INR (Rs)',
  distanceUnit: 'Kilometers',
};

// Helper to initialize local storage data if empty
function initStorage() {
  if (!localStorage.getItem('transit_vehicles')) {
    localStorage.setItem('transit_vehicles', JSON.stringify(INITIAL_VEHICLES));
  }
  if (!localStorage.getItem('transit_drivers')) {
    localStorage.setItem('transit_drivers', JSON.stringify(INITIAL_DRIVERS));
  }
  if (!localStorage.getItem('transit_trips')) {
    localStorage.setItem('transit_trips', JSON.stringify(INITIAL_TRIPS));
  }
  if (!localStorage.getItem('transit_maintenance')) {
    localStorage.setItem('transit_maintenance', JSON.stringify(INITIAL_MAINTENANCE));
  }
  if (!localStorage.getItem('transit_expenses')) {
    localStorage.setItem('transit_expenses', JSON.stringify(INITIAL_EXPENSES));
  }
  if (!localStorage.getItem('transit_settings')) {
    localStorage.setItem('transit_settings', JSON.stringify(INITIAL_SETTINGS));
  }
}

initStorage();

// Storage getter & setter helper wrappers
export const storage = {
  getVehicles: (): Vehicle[] => JSON.parse(localStorage.getItem('transit_vehicles') || '[]'),
  setVehicles: (data: Vehicle[]) => localStorage.setItem('transit_vehicles', JSON.stringify(data)),
  
  getDrivers: (): Driver[] => JSON.parse(localStorage.getItem('transit_drivers') || '[]'),
  setDrivers: (data: Driver[]) => localStorage.setItem('transit_drivers', JSON.stringify(data)),
  
  getTrips: (): Trip[] => JSON.parse(localStorage.getItem('transit_trips') || '[]'),
  setTrips: (data: Trip[]) => localStorage.setItem('transit_trips', JSON.stringify(data)),
  
  getMaintenance: (): MaintenanceLog[] => JSON.parse(localStorage.getItem('transit_maintenance') || '[]'),
  setMaintenance: (data: MaintenanceLog[]) => localStorage.setItem('transit_maintenance', JSON.stringify(data)),
  
  getExpenses: (): Expense[] => JSON.parse(localStorage.getItem('transit_expenses') || '[]'),
  setExpenses: (data: Expense[]) => localStorage.setItem('transit_expenses', JSON.stringify(data)),

  getSettings: (): GeneralSettings => JSON.parse(localStorage.getItem('transit_settings') || JSON.stringify(INITIAL_SETTINGS)),
  setSettings: (data: GeneralSettings) => localStorage.setItem('transit_settings', JSON.stringify(data)),
};

// API Fetch implementation with Local fallback
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('transit_token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (response.status === 401) {
      localStorage.removeItem('transit_token');
      localStorage.removeItem('transit_user');
      window.dispatchEvent(new Event('auth-changed'));
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.warn(`Backend fetch failed for ${endpoint}. Falling back to mock/local implementation.`, error);
    throw error; // Propagate error so callsite knows backend failed
  }
}

// Authenticated User Helpers
export function getStoredUser(): User | null {
  const userJson = localStorage.getItem('transit_user');
  return userJson ? JSON.parse(userJson) : null;
}

export function getStoredToken(): string | null {
  return localStorage.getItem('transit_token');
}

// Mock auth database
const DEMO_USERS: Record<string, { name: string; role: string }> = {
  'manager@transitops.com': { name: 'David Smith', role: 'Fleet Manager' },
  'manager@transitops.in': { name: 'David Smith', role: 'Fleet Manager' },
  'safety@transitops.com': { name: 'Elena Rostova', role: 'Safety Officer' },
  'safety@transitops.in': { name: 'Elena Rostova', role: 'Safety Officer' },
  'driver@transitops.com': { name: 'Marcus Miller', role: 'Dispatcher' }, // Wait, mockup uses "Dispatcher" instead of "Driver"
  'driver@transitops.in': { name: 'Marcus Miller', role: 'Dispatcher' },
  'dispatcher@transitops.in': { name: 'Ranjeet K.', role: 'Dispatcher' },
  'finance@transitops.com': { name: 'Sarah Jenkins', role: 'Financial Analyst' },
  'finance@transitops.in': { name: 'Sarah Jenkins', role: 'Financial Analyst' },
};

// Login API that supports both Backend and Fallback
export async function login(email: string, password: string, selectedRole?: string): Promise<{ user: User; token: string }> {
  try {
    const data = await apiRequest<{ user: User & { initials: string }; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Save to local storage
    const userRole = selectedRole || getLocalUserRole(email) || 'Fleet Manager';
    const userWithRole = { ...data.user, role: userRole };
    
    localStorage.setItem('transit_token', data.token);
    localStorage.setItem('transit_user', JSON.stringify(userWithRole));
    saveLocalUserRole(email, userRole);
    window.dispatchEvent(new Event('auth-changed'));
    
    return { user: userWithRole, token: data.token };
  } catch (backendError) {
    console.log('Skipping backend login, resolving via local mock account...');
    
    // Check local mock database
    const userMatch = DEMO_USERS[email.toLowerCase()];
    if (userMatch && password === 'password') {
      const mockUser: User = {
        id: Math.floor(Math.random() * 1000) + 1,
        email: email.toLowerCase(),
        fullName: userMatch.name,
        role: selectedRole || userMatch.role,
        initials: userMatch.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      };
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      localStorage.setItem('transit_token', mockToken);
      localStorage.setItem('transit_user', JSON.stringify(mockUser));
      saveLocalUserRole(email, mockUser.role || 'Fleet Manager');
      window.dispatchEvent(new Event('auth-changed'));
      
      return { user: mockUser, token: mockToken };
    }
    
    // Fallback: allow generic logins for testing
    if (password === 'password') {
      const role = selectedRole || getLocalUserRole(email) || 'Fleet Manager';
      const name = email.split('@')[0];
      const mockUser: User = {
        id: Math.floor(Math.random() * 1000) + 1,
        email: email.toLowerCase(),
        fullName: name.charAt(0).toUpperCase() + name.slice(1),
        role: role,
        initials: name.substring(0, 2).toUpperCase(),
      };
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      localStorage.setItem('transit_token', mockToken);
      localStorage.setItem('transit_user', JSON.stringify(mockUser));
      saveLocalUserRole(email, role);
      window.dispatchEvent(new Event('auth-changed'));
      
      return { user: mockUser, token: mockToken };
    }
    
    throw new Error('Invalid email or password (default password: "password")');
  }
}

// Signup API that supports both Backend and Fallback
export async function signup(fullName: string, email: string, password: string, role: string): Promise<{ user: User; token: string }> {
  try {
    const data = await apiRequest<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, passwordConfirmation: password }),
    });

    const userWithRole = { ...data.user, role };
    localStorage.setItem('transit_token', data.token);
    localStorage.setItem('transit_user', JSON.stringify(userWithRole));
    saveLocalUserRole(email, role);
    window.dispatchEvent(new Event('auth-changed'));

    return { user: userWithRole, token: data.token };
  } catch (backendError) {
    console.log('Skipping backend signup, registering locally...');
    
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'US';
    const mockUser: User = {
      id: Math.floor(Math.random() * 1000) + 1,
      email: email.toLowerCase(),
      fullName,
      role,
      initials,
    };
    const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);

    localStorage.setItem('transit_token', mockToken);
    localStorage.setItem('transit_user', JSON.stringify(mockUser));
    saveLocalUserRole(email, role);
    window.dispatchEvent(new Event('auth-changed'));

    return { user: mockUser, token: mockToken };
  }
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/account/logout', { method: 'POST' });
  } catch (e) {
    console.warn('Backend logout failed or offline, resetting local session...');
  } finally {
    localStorage.removeItem('transit_token');
    localStorage.removeItem('transit_user');
    window.dispatchEvent(new Event('auth-changed'));
  }
}

// Local role mapping helper
export function getLocalUserRole(email: string): string | null {
  const mapping = JSON.parse(localStorage.getItem('transit_email_roles') || '{}');
  return mapping[email.toLowerCase()] || null;
}

export function saveLocalUserRole(email: string, role: string) {
  const mapping = JSON.parse(localStorage.getItem('transit_email_roles') || '{}');
  mapping[email.toLowerCase()] = role;
  localStorage.setItem('transit_email_roles', JSON.stringify(mapping));
}

// Fetch dashboard KPIs
export function getKpis(): DashboardKpis {
  const vehicles = storage.getVehicles();
  const drivers = storage.getDrivers();
  const trips = storage.getTrips();

  const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const vehiclesInMaintenance = vehicles.filter(v => v.status === 'In Shop').length;
  
  const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter(t => t.status === 'Draft').length;
  const driversOnDuty = drivers.filter(d => d.status === 'On Trip' || d.status === 'Available').length;
  
  const activeCount = vehicles.filter(v => v.status === 'On Trip').length;
  const totalNonRetired = vehicles.filter(v => v.status !== 'Retired').length;
  const fleetUtilization = totalNonRetired > 0 
    ? Math.round((activeCount / totalNonRetired) * 100) 
    : 0;

  return {
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilization,
  };
}
