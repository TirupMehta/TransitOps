export interface User {
  id: number
  email: string
  fullName: string | null
  initials: string
  role?: string
}

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';

export interface Vehicle {
  id: number
  registrationNumber: string
  model: string
  type: string
  loadCapacity: number
  odometer: number
  acquisitionCost: number
  status: VehicleStatus
  createdAt?: string
  updatedAt?: string
}

export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';

export interface Driver {
  id: number
  name: string
  licenseNumber: string
  licenseCategory: string
  licenseExpiryDate: string
  contactNumber: string
  safetyScore: number
  status: DriverStatus
  createdAt?: string
  updatedAt?: string
}

export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface Trip {
  id: number
  source: string
  destination: string
  cargoWeight: number
  distance: number
  status: TripStatus
  vehicleId: number
  driverId: number
  vehicle?: Vehicle
  driver?: Driver
  createdAt?: string
  updatedAt?: string
}

export interface MaintenanceLog {
  id: number
  vehicleId: number
  description: string
  cost: number
  date: string
  status: 'Active' | 'Completed'
  vehicle?: Vehicle
  createdAt?: string
  updatedAt?: string
}

export interface FuelLog {
  id: number
  vehicleId: number
  liters: number
  cost: number
  date: string
  vehicle?: Vehicle
  createdAt?: string
  updatedAt?: string
}

export interface Expense {
  id: number
  vehicleId: number
  type: 'Fuel' | 'Toll' | 'Maintenance' | 'Other'
  amount: number
  date: string
  description: string
  vehicle?: Vehicle
  createdAt?: string
  updatedAt?: string
}

export interface DashboardKpis {
  activeVehicles: number
  availableVehicles: number
  vehiclesInMaintenance: number
  activeTrips: number
  pendingTrips: number
  driversOnDuty: number
  fleetUtilization: number
}
