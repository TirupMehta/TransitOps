import type { User, Vehicle, Driver, Trip, MaintenanceLog, Expense, DashboardKpis } from '../types';

const BASE_URL = 'http://localhost:3333/api/v1';

// Seed Initial Mock Data
const INITIAL_VEHICLES: Vehicle[] = [
  { id: 1, registrationNumber: 'VAN-05', model: 'Ford Transit', type: 'Van', loadCapacity: 500, odometer: 12500, acquisitionCost: 35000, status: 'Available' },
  { id: 2, registrationNumber: 'TRK-12', model: 'Volvo FH16', type: 'Truck', loadCapacity: 15000, odometer: 89000, acquisitionCost: 120000, status: 'On Trip' },
  { id: 3, registrationNumber: 'VAN-08', model: 'Mercedes Sprinter', type: 'Van', loadCapacity: 800, odometer: 42000, acquisitionCost: 45000, status: 'In Shop' },
  { id: 4, registrationNumber: 'TRK-03', model: 'Scania R500', type: 'Truck', loadCapacity: 18000, odometer: 110000, acquisitionCost: 135000, status: 'Retired' },
];

const INITIAL_DRIVERS: Driver[] = [
  { id: 1, name: 'Alex Johnson', licenseNumber: 'DL-9876543', licenseCategory: 'Commercial (Heavy)', licenseExpiryDate: '2027-10-15', contactNumber: '+1 555-0192', safetyScore: 92, status: 'Available' },
  { id: 2, name: 'Sarah Miller', licenseNumber: 'DL-1234567', licenseCategory: 'Commercial', licenseExpiryDate: '2026-12-05', contactNumber: '+1 555-0143', safetyScore: 95, status: 'On Trip' },
  { id: 3, name: 'John Doe', licenseNumber: 'DL-5558882', licenseCategory: 'Standard', licenseExpiryDate: '2023-05-20', contactNumber: '+1 555-0122', safetyScore: 78, status: 'Suspended' }, // Expired
  { id: 4, name: 'Robert Lee', licenseNumber: 'DL-3449911', licenseCategory: 'Commercial (Heavy)', licenseExpiryDate: '2028-02-28', contactNumber: '+1 555-0188', safetyScore: 88, status: 'Available' },
];

const INITIAL_TRIPS: Trip[] = [
  { id: 1, source: 'Warehouse A', destination: 'Distribution Center B', cargoWeight: 450, distance: 120, status: 'Completed', vehicleId: 1, driverId: 1 },
  { id: 2, source: 'Port Terminal 3', destination: 'Factory Yard 1', cargoWeight: 12000, distance: 340, status: 'Dispatched', vehicleId: 2, driverId: 2 },
];

const INITIAL_MAINTENANCE: MaintenanceLog[] = [
  { id: 1, vehicleId: 3, description: 'Brake pad replacement and alignment', cost: 450, date: '2026-07-10', status: 'Active' },
  { id: 2, vehicleId: 1, description: 'Engine oil change and general inspection', cost: 120, date: '2026-06-15', status: 'Completed' },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 1, vehicleId: 1, type: 'Fuel', amount: 85, date: '2026-07-11', description: 'Filled 50 liters' },
  { id: 2, vehicleId: 2, type: 'Toll', amount: 45, date: '2026-07-12', description: 'Highway gate pass' },
  { id: 3, vehicleId: 3, type: 'Maintenance', amount: 450, date: '2026-07-10', description: 'Brake service' },
];

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
    console.warn(`Backend fetch failed for ${endpoint}. Falling back to mock implementation.`, error);
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
  'safety@transitops.com': { name: 'Elena Rostova', role: 'Safety Officer' },
  'driver@transitops.com': { name: 'Marcus Miller', role: 'Driver' },
  'finance@transitops.com': { name: 'Sarah Jenkins', role: 'Financial Analyst' },
};

// Login API that supports both Backend and Fallback
export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  try {
    const data = await apiRequest<{ user: User & { initials: string }; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Save to local storage
    localStorage.setItem('transit_token', data.token);
    localStorage.setItem('transit_user', JSON.stringify(data.user));
    window.dispatchEvent(new Event('auth-changed'));
    
    return data;
  } catch (backendError) {
    console.log('Skipping backend login, resolving via local mock account...');
    
    // Check local mock database
    const userMatch = DEMO_USERS[email.toLowerCase()];
    if (userMatch && password === 'password') {
      const mockUser: User = {
        id: Math.floor(Math.random() * 1000) + 1,
        email: email.toLowerCase(),
        fullName: userMatch.name,
        role: userMatch.role,
        initials: userMatch.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      };
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      localStorage.setItem('transit_token', mockToken);
      localStorage.setItem('transit_user', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('auth-changed'));
      
      return { user: mockUser, token: mockToken };
    }
    
    throw new Error('Invalid email or password (default password: "password")');
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
  
  const fleetUtilization = vehicles.length > 0 
    ? Math.round(((vehicles.filter(v => v.status === 'On Trip').length) / vehicles.filter(v => v.status !== 'Retired').length) * 100) 
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
