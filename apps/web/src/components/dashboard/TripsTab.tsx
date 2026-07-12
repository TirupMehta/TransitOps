import React, { useState } from 'react';
import type { Trip, Vehicle, Driver, TripStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Search, Compass, AlertTriangle, CheckCircle, Play, XCircle, CheckCircle2, HelpCircle, AlertCircle, Lock } from 'lucide-react';
import { storage } from '../../utils/api';

interface TripsTabProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  userRole?: string;
  onUpdate: () => void;
}

export const TripsTab: React.FC<TripsTabProps> = ({
  trips,
  vehicles,
  drivers,
  userRole,
  onUpdate,
}) => {
  const canWrite = userRole?.toLowerCase().includes('manager') || userRole?.toLowerCase().includes('driver') || userRole?.toLowerCase().includes('dispatcher');
  const [search, setSearch] = useState('');
  
  // Create Trip Form State
  const [source, setSource] = useState('Gandhinagar Depot');
  const [destination, setDestination] = useState('Ahmedabad Hub');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [cargoWeight, setCargoWeight] = useState(300);
  const [distance, setDistance] = useState(28);

  // Complete Trip Dialog State
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null);
  const [finalOdo, setFinalOdo] = useState(0);
  const [fuelLiters, setFuelLiters] = useState(10);
  const [fuelCost, setFuelCost] = useState(1000);
  const [completeError, setCompleteError] = useState<string | null>(null);

  // Filter available items for creation
  const isLicenseExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => d.status === 'Available' && !isLicenseExpired(d.licenseExpiryDate));

  const selectedVehicleObj = vehicles.find(v => v.id === selectedVehicleId);

  const vehicleCapacity = selectedVehicleObj?.loadCapacity || 0;
  const isOverweight = cargoWeight > vehicleCapacity;
  const capacityExceeded = isOverweight ? cargoWeight - vehicleCapacity : 0;
  const isValidToDispatch = selectedVehicleId && selectedDriverId && !isOverweight && source.trim() && destination.trim() && cargoWeight > 0 && distance > 0;

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidToDispatch) return;

    const currentTrips = storage.getTrips();
    const currentVehicles = storage.getVehicles();
    const currentDrivers = storage.getDrivers();

    const tripId = Math.max(...currentTrips.map(t => t.id), 0) + 1;
    const tripCode = `TR${String(tripId).padStart(3, '0')}`;

    const newTrip: Trip = {
      id: tripId,
      tripCode,
      source,
      destination,
      cargoWeight,
      distance,
      status: 'Dispatched', // Auto dispatch on create
      vehicleId: selectedVehicleId!,
      driverId: selectedDriverId!,
      eta: 'Calculating...',
    };

    // Update statuses to "On Trip"
    const updatedVehicles = currentVehicles.map(v => 
      v.id === selectedVehicleId ? { ...v, status: 'On Trip' as const } : v
    );
    const updatedDrivers = currentDrivers.map(d => 
      d.id === selectedDriverId ? { ...d, status: 'On Trip' as const } : d
    );

    storage.setTrips([...currentTrips, newTrip]);
    storage.setVehicles(updatedVehicles);
    storage.setDrivers(updatedDrivers);

    // Reset Form
    setSelectedVehicleId(null);
    setSelectedDriverId(null);
    setCargoWeight(300);
    setDistance(28);

    onUpdate();
  };

  const handleDraftTrip = () => {
    if (!selectedVehicleId || !selectedDriverId) return;

    const currentTrips = storage.getTrips();
    const tripId = Math.max(...currentTrips.map(t => t.id), 0) + 1;
    const tripCode = `TR${String(tripId).padStart(3, '0')}`;

    const newTrip: Trip = {
      id: tripId,
      tripCode,
      source,
      destination,
      cargoWeight,
      distance,
      status: 'Draft',
      vehicleId: selectedVehicleId!,
      driverId: selectedDriverId!,
      eta: 'Awaiting driver',
    };

    storage.setTrips([...currentTrips, newTrip]);
    
    // Reset Form
    setSelectedVehicleId(null);
    setSelectedDriverId(null);
    setCargoWeight(300);
    setDistance(28);

    onUpdate();
  };

  const handleDispatchDraft = (trip: Trip) => {
    const currentTrips = storage.getTrips();
    const currentVehicles = storage.getVehicles();
    const currentDrivers = storage.getDrivers();

    // Check if vehicle/driver are still available
    const v = currentVehicles.find(veh => veh.id === trip.vehicleId);
    const d = currentDrivers.find(drv => drv.id === trip.driverId);

    if (v?.status !== 'Available' || d?.status !== 'Available') {
      alert('Cannot dispatch: Vehicle or Driver is no longer Available.');
      return;
    }

    const updatedTrips = currentTrips.map(t => 
      t.id === trip.id ? { ...t, status: 'Dispatched' as const, eta: 'Calculating...' } : t
    );
    const updatedVehicles = currentVehicles.map(veh => 
      veh.id === trip.vehicleId ? { ...veh, status: 'On Trip' as const } : veh
    );
    const updatedDrivers = currentDrivers.map(drv => 
      drv.id === trip.driverId ? { ...drv, status: 'On Trip' as const } : drv
    );

    storage.setTrips(updatedTrips);
    storage.setVehicles(updatedVehicles);
    storage.setDrivers(updatedDrivers);
    onUpdate();
  };

  const handleCancelTrip = (trip: Trip) => {
    if (!window.confirm('Are you sure you want to cancel this trip?')) return;

    const currentTrips = storage.getTrips();
    const currentVehicles = storage.getVehicles();
    const currentDrivers = storage.getDrivers();

    const updatedTrips = currentTrips.map(t => 
      t.id === trip.id ? { ...t, status: 'Cancelled' as const, eta: 'Vehicle sent to shop' } : t
    );
    
    // Restore vehicle & driver back to Available
    const updatedVehicles = currentVehicles.map(v => 
      v.id === trip.vehicleId ? { ...v, status: 'Available' as const } : v
    );
    const updatedDrivers = currentDrivers.map(d => 
      d.id === trip.driverId ? { ...d, status: 'Available' as const } : d
    );

    storage.setTrips(updatedTrips);
    storage.setVehicles(updatedVehicles);
    storage.setDrivers(updatedDrivers);
    onUpdate();
  };

  const handleOpenCompleteModal = (trip: Trip) => {
    const v = vehicles.find(veh => veh.id === trip.vehicleId);
    setCompletingTrip(trip);
    setFinalOdo((v?.odometer || 0) + trip.distance);
    setFuelLiters(Math.round(trip.distance / 8.4)); // Estimate using mockup's 8.4 km/l
    setFuelCost(Math.round((trip.distance / 8.4) * 75)); // Estimate 75 Rs/liter
    setCompleteError(null);
  };

  const handleCompleteTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTrip) return;

    const v = vehicles.find(veh => veh.id === completingTrip.vehicleId);
    if (v && finalOdo < v.odometer) {
      setCompleteError(`Final odometer cannot be less than current odometer (${v.odometer} km).`);
      return;
    }

    const currentTrips = storage.getTrips();
    const currentVehicles = storage.getVehicles();
    const currentDrivers = storage.getDrivers();
    const currentExpenses = storage.getExpenses();

    // 1. Update trip status
    const updatedTrips = currentTrips.map(t => 
      t.id === completingTrip.id ? { ...t, status: 'Completed' as const, eta: '--' } : t
    );

    // 2. Update vehicle odometer & status
    const updatedVehicles = currentVehicles.map(veh => 
      veh.id === completingTrip.vehicleId 
        ? { ...veh, odometer: finalOdo, status: 'Available' as const } 
        : veh
    );

    // 3. Update driver status
    const updatedDrivers = currentDrivers.map(drv => 
      drv.id === completingTrip.driverId 
        ? { ...drv, status: 'Available' as const } 
        : drv
    );

    // 4. Log Fuel Expense
    const expenseId = Math.max(...currentExpenses.map(ex => ex.id), 0) + 1;
    const newFuelExpense = {
      id: expenseId,
      vehicleId: completingTrip.vehicleId,
      tripId: completingTrip.id,
      type: 'Fuel' as const,
      amount: Number(fuelCost),
      date: new Date().toISOString().split('T')[0],
      description: `Fuel consumption: ${fuelLiters} Liters for trip ${completingTrip.tripCode}`,
    };

    storage.setTrips(updatedTrips);
    storage.setVehicles(updatedVehicles);
    storage.setDrivers(updatedDrivers);
    storage.setExpenses([...currentExpenses, newFuelExpense]);

    setCompletingTrip(null);
    onUpdate();
  };

  const getBadgeVariant = (status: TripStatus) => {
    switch (status) {
      case 'Draft': return 'neutral';
      case 'Dispatched': return 'info';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
    }
  };

  const filteredTrips = trips.map(t => ({
    ...t,
    vehicle: vehicles.find(v => v.id === t.vehicleId),
    driver: drivers.find(d => d.id === t.driverId)
  })).filter(t => {
    const matchesSearch = t.tripCode.toLowerCase().includes(search.toLowerCase()) ||
                          t.source.toLowerCase().includes(search.toLowerCase()) ||
                          t.destination.toLowerCase().includes(search.toLowerCase()) ||
                          (t.driver?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (t.vehicle?.registrationNumber || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search Bar Toolbar */}
      <div className="flex justify-between items-center gap-4 p-4 rounded-2xl neumorph-outset">
        <div className="relative rounded-xl neumorph-inset group border border-theme w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/70" />
          <input
            type="text"
            placeholder="Search trips (Route, Driver, Vehicle)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none text-primary font-bold"
          />
        </div>
        <div className="text-xs font-extrabold text-orange tracking-wider flex items-center gap-1.5">
          {!canWrite && (
            <span className="text-xs font-semibold text-secondary/60 bg-card-theme/50 px-3 py-1.5 rounded-xl border border-theme flex items-center gap-1.5 shadow-xs mr-2">
              <Lock className="w-3.5 h-3.5 text-orange" /> Read-Only View
            </span>
          )}
          <Compass className="w-5 h-5" /> Trip Dispatcher Control Board
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Create Trip Form */}
        {canWrite && (
          <div className="rounded-3xl p-6 neumorph-outset relative">
          <div className="mb-6">
            <h3 className="font-extrabold text-primary text-sm tracking-wider mb-2">Create Trip</h3>
            {/* Trip Lifecycle Progress Indicator */}
            <div className="flex items-center justify-between text-xs font-bold text-secondary px-2.5 py-2 bg-card-theme/40 border border-theme rounded-2xl">
              <span className="text-orange">Draft</span>
              <span className="text-secondary/40">→</span>
              <span className="text-blue-500">Dispatched</span>
              <span className="text-secondary/40">→</span>
              <span className="text-emerald-500">Completed</span>
              <span className="text-secondary/40">→</span>
              <span className="text-rose-500">Cancelled</span>
            </div>
          </div>

          <form onSubmit={handleCreateTrip} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                Source Depot
              </label>
              <div className="rounded-xl neumorph-inset px-3 py-2">
                <input
                  type="text"
                  required
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                Destination Depot
              </label>
              <div className="rounded-xl neumorph-inset px-3 py-2">
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                Vehicle (Available Only)
              </label>
              <div className="rounded-xl neumorph-inset px-3 py-2">
                <select
                  value={selectedVehicleId || ''}
                  onChange={(e) => setSelectedVehicleId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-card-theme text-primary">Select Vehicle...</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id} className="bg-card-theme text-primary">
                      {v.registrationNumber} ({v.model} - Cap: {v.loadCapacity} kg)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                Driver (Available Only)
              </label>
              <div className="rounded-xl neumorph-inset px-3 py-2">
                <select
                  value={selectedDriverId || ''}
                  onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-card-theme text-primary">Select Driver...</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id} className="bg-card-theme text-primary">
                      {d.name} (DL: {d.licenseNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Cargo Weight (kg)
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <input
                    type="number"
                    required
                    min={0}
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(Number(e.target.value))}
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Planned Dist. (km)
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <input
                    type="number"
                    required
                    min={0}
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Capacity Verification Box (Exactly from Screen 4) */}
            <div className={`p-4 rounded-2xl border ${isOverweight ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'} text-xs font-bold space-y-1.5`}>
              <div className="flex justify-between items-center">
                <span>Vehicle Capacity:</span>
                <span>{selectedVehicleId ? `${vehicleCapacity} kg` : 'Select Vehicle'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cargo Weight:</span>
                <span>{cargoWeight} kg</span>
              </div>
              <div className="border-t border-theme border-dashed pt-1.5 mt-1.5 flex items-start gap-1.5">
                {isOverweight ? (
                  <>
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>X Capacity exceeded by {capacityExceeded} kg -- dispatch blocked</span>
                  </>
                ) : selectedVehicleId ? (
                  <>
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Cargo weight satisfies vehicle limits -- Ready to Dispatch</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-secondary" />
                    <span className="text-secondary">Please select vehicle and driver.</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleDraftTrip}
                disabled={!selectedVehicleId || !selectedDriverId}
                className="flex-1 font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs neumorph-btn-vanilla disabled:opacity-50 disabled:pointer-events-none"
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={!isValidToDispatch}
                className="flex-1 font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs neumorph-btn-orange disabled:opacity-50 disabled:pointer-events-none shadow-md"
              >
                Dispatch
              </button>
            </div>
          </form>
        </div>
      )}

        {/* Right Side: Live Board */}
        <div className={`${canWrite ? 'lg:col-span-2' : 'lg:col-span-3'} rounded-3xl p-6 neumorph-outset flex flex-col justify-between`}>
          <div>
            <h3 className="font-extrabold text-primary text-sm tracking-wider mb-4">Live Board</h3>

            <div className="space-y-4">
              {filteredTrips.length === 0 ? (
                <div className="text-center py-16 text-secondary text-xs font-bold neumorph-inset rounded-2xl">
                  No dispatcher records found.
                </div>
              ) : (
                filteredTrips.map((trip) => (
                  <div key={trip.id} className="p-4 rounded-2xl neumorph-btn-vanilla flex flex-wrap justify-between items-center gap-4 hover:scale-[1.002] transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-orange">{trip.tripCode}</span>
                        <div className="font-extrabold text-primary text-sm">{trip.source} → {trip.destination}</div>
                      </div>
                      <div className="text-xs text-secondary font-semibold">
                        Driver: <span className="text-primary font-bold">{trip.driver?.name || 'Unassigned'}</span> |
                        Vehicle: <span className="text-primary font-bold">{trip.vehicle?.registrationNumber || 'Unassigned'} ({trip.vehicle?.model})</span> |
                        Weight: <span className="text-primary font-bold">{trip.cargoWeight} kg</span> |
                        Dist: <span className="text-primary font-bold">{trip.distance} km</span>
                      </div>
                      <div className="text-xs text-secondary font-bold flex items-center gap-1.5 mt-1">
                        <span>ETA: <strong className="text-primary">{trip.eta}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={getBadgeVariant(trip.status)}>{trip.status}</Badge>

                      {/* Dispatched actions */}
                      {trip.status === 'Dispatched' && canWrite && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenCompleteModal(trip)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600 transition-colors shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                          </button>
                          <button
                            onClick={() => handleCancelTrip(trip)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 cursor-pointer hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      )}

                      {/* Draft actions */}
                      {trip.status === 'Draft' && canWrite && (
                        <button
                          onClick={() => handleDispatchDraft(trip)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500 text-white cursor-pointer hover:bg-blue-600 transition-colors shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5" /> Dispatch
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rules Footer (Exactly from Screen 4) */}
          <div className="p-4 rounded-2xl border border-theme bg-card-theme text-xs font-bold text-secondary mt-6">
            On Complete: odometer → fuel log → expenses → Vehicle & Driver Available
          </div>
        </div>
      </div>

      {/* Complete Trip Odometer & Fuel Modal */}
      {completingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass-backdrop p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 bg-app-theme neumorph-outset relative border border-theme animate-scale-up">
            <h3 className="text-base font-extrabold text-primary tracking-wider mb-6">
              Complete Dispatch {completingTrip.tripCode}
            </h3>

            {completeError && (
              <div className="mb-4 flex items-center gap-2 bg-red-500/10 border-2 border-dashed border-red-500/20 text-red-500 px-3 py-2 rounded-xl text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{completeError}</span>
              </div>
            )}

            <form onSubmit={handleCompleteTripSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                  Final Odometer (km)
                </label>
                <div className="rounded-xl neumorph-inset px-3 py-2">
                  <input
                    type="number"
                    required
                    value={finalOdo}
                    onChange={(e) => setFinalOdo(Number(e.target.value))}
                    className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                  />
                </div>
                <span className="text-xs text-secondary/60 mt-1 block">
                  Current vehicle odometer: {vehicles.find(v => v.id === completingTrip.vehicleId)?.odometer} km
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    Fuel Consumed (Liters)
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <input
                      type="number"
                      required
                      min={0}
                      value={fuelLiters}
                      onChange={(e) => setFuelLiters(Number(e.target.value))}
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">
                    Fuel Cost (Rs.)
                  </label>
                  <div className="rounded-xl neumorph-inset px-3 py-2">
                    <input
                      type="number"
                      required
                      min={0}
                      value={fuelCost}
                      onChange={(e) => setFuelCost(Number(e.target.value))}
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCompletingTrip(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold neumorph-btn-vanilla cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold neumorph-btn-orange cursor-pointer"
                >
                  Log & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
