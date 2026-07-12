import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { UserPlus, Users, Trash2, Mail, Phone, MapPin, Loader2, ShieldCheck, Truck, ShieldAlert, BadgeCent } from 'lucide-react'
import { trpcClient } from '../../lib/trpc'
import { useAuth } from '../../hooks/useAuth'
import type { Vehicle } from '../../types'

// ── Zod Schemas ───────────────────────────────────────────────────────────────
import { createFleetManagerSchema, type CreateFleetManagerInput } from '../../schemas/fleet-manager.schema'
import { createSafetyManagerSchema, type CreateSafetyManagerInput } from '../../schemas/safety-manager.schema'
import { createDriverSchema, type CreateDriverInput } from '../../schemas/driver.schema'
import { createFinancialAnalystSchema, type CreateFinancialAnalystInput } from '../../schemas/financial-analyst.schema'

const client = trpcClient as any

interface FleetManagerSectionProps {
  vehicles: Vehicle[]
  userRole?: string
  onUpdate: () => void
}

type SubTab = 'fleet' | 'safety' | 'driver' | 'finance'

export const FleetManagerSection: React.FC<FleetManagerSectionProps> = ({
  vehicles: _vehicles,
  userRole: _userRole,
  onUpdate: _onUpdate,
}) => {
  const { user: currentUser } = useAuth()
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('fleet')
  const [managers, setManagers] = useState<any[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // ── 1. Forms Instantiations ────────────────────────────────────────────────
  const fleetForm = useForm<CreateFleetManagerInput>({
    resolver: zodResolver(createFleetManagerSchema),
    defaultValues: { fullName: '', email: '', password: '', phoneNumber: '', address: '', city: '', state: '', country: '' }
  })

  const safetyForm = useForm<CreateSafetyManagerInput>({
    resolver: zodResolver(createSafetyManagerSchema),
    defaultValues: { safetyOfficerName: '', safetyOfficerEmail: '', safetyOfficerPassword: '', safetyOfficerPhone: '', safetyOfficerAddress: '', safetyOfficerCity: '', safetyOfficerState: '', safetyOfficerCountry: '' }
  })

  const driverForm = useForm<CreateDriverInput>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: { driverName: '', driverEmail: '', driverPassword: '', driverPhone: '', driverLicenseNumber: '', driverLicenseExpiryDate: '', driverAddress: '', driverCity: '', driverState: '', driverCountry: '' }
  })

  const financeForm = useForm<CreateFinancialAnalystInput>({
    resolver: zodResolver(createFinancialAnalystSchema),
    defaultValues: { financialAnalistName: '', financialAnalistEmail: '', financialAnalistPassword: '', financialAnalistPhone: '', financialAnalistAddress: '', financialAnalistCity: '', financialAnalistState: '', financialAnalistCountry: '' }
  })

  // Get active form state context
  const getActiveForm = () => {
    switch (activeSubTab) {
      case 'fleet': return fleetForm
      case 'safety': return safetyForm
      case 'driver': return driverForm
      case 'finance': return financeForm
    }
  }

  const { control, handleSubmit, reset, formState: { errors } } = getActiveForm() as any

  // ── 2. Data Fetching via tRPC ─────────────────────────────────────────────
  const fetchManagersList = async () => {
    try {
      setLoadingList(true)
      let res
      if (activeSubTab === 'fleet') {
        res = await client.fleetManager.list.query({ page: 1, perPage: 100 })
      } else if (activeSubTab === 'safety') {
        res = await client.safetyManager.list.query({ page: 1, perPage: 100 })
      } else if (activeSubTab === 'driver') {
        res = await client.driver.list.query({ page: 1, perPage: 100 })
      } else {
        res = await client.financialAnalyst.list.query({ page: 1, perPage: 100 })
      }
      setManagers(res.data)
    } catch (err: any) {
      console.error(`Failed to load directory for ${activeSubTab}:`, err)
      toast.error(`Could not load ${activeSubTab} list`)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    fetchManagersList()
  }, [activeSubTab])

  // ── 3. Submit Handler ──────────────────────────────────────────────────────
  const onSubmit = async (data: any) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === '' ? undefined : v])
    ) as any

    setSubmitting(true)
    try {
      if (activeSubTab === 'fleet') {
        await client.fleetManager.create.mutate(cleanData)
      } else if (activeSubTab === 'safety') {
        await client.safetyManager.create.mutate(cleanData)
      } else if (activeSubTab === 'driver') {
        await client.driver.create.mutate(cleanData)
      } else {
        await client.financialAnalyst.create.mutate(cleanData)
      }

      toast.success('Registration successful!')
      reset()
      fetchManagersList()
    } catch (err: any) {
      toast.error('Registration failed', { description: err?.message ?? 'Action could not be completed' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── 4. Delete Handler ──────────────────────────────────────────────────────
  const handleDelete = async (id: number, email: string) => {
    if (currentUser && email === currentUser.email) {
      toast.error('Cannot delete your own account!')
      return
    }

    if (!window.confirm(`Are you sure you want to delete this registry item?`)) {
      return
    }

    try {
      if (activeSubTab === 'fleet') {
        await client.fleetManager.delete.mutate({ id })
      } else if (activeSubTab === 'safety') {
        await client.safetyManager.delete.mutate({ id })
      } else if (activeSubTab === 'driver') {
        await client.driver.delete.mutate({ id })
      } else {
        await client.financialAnalyst.delete.mutate({ id })
      }

      toast.success('Registry deleted successfully')
      fetchManagersList()
    } catch (err: any) {
      toast.error('Deletion failed', { description: err.message })
    }
  }

  // Helper mappings for roles
  const getSubTabInfo = () => {
    switch (activeSubTab) {
      case 'fleet':
        return {
          label: 'Fleet Managers',
          nameField: 'fullName',
          emailField: 'email',
          phoneField: 'phoneNumber',
          icon: Truck
        }
      case 'safety':
        return {
          label: 'Safety Managers',
          nameField: 'safetyOfficerName',
          emailField: 'safetyOfficerEmail',
          phoneField: 'safetyOfficerPhone',
          icon: ShieldCheck
        }
      case 'driver':
        return {
          label: 'Drivers',
          nameField: 'driverName',
          emailField: 'driverEmail',
          phoneField: 'driverPhone',
          icon: Users
        }
      case 'finance':
        return {
          label: 'Financial Analysts',
          nameField: 'financialAnalistName',
          emailField: 'financialAnalistEmail',
          phoneField: 'financialAnalistPhone',
          icon: BadgeCent
        }
    }
  }

  const activeInfo = getSubTabInfo()

  return (
    <div className="space-y-6">
      
      {/* Sub tabs navigation */}
      <div className="flex gap-2.5 p-1 rounded-2xl neumorph-inset max-w-2xl bg-inset-theme border border-theme/40">
        {[
          { id: 'fleet', label: 'Fleet Managers', icon: Truck },
          { id: 'safety', label: 'Safety Managers', icon: ShieldCheck },
          { id: 'driver', label: 'Drivers', icon: Users },
          { id: 'finance', label: 'Financial Analysts', icon: BadgeCent }
        ].map((tab) => {
          const IconComp = tab.icon
          const isActive = activeSubTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isActive
                  ? 'bg-card-theme text-orange shadow-md border border-white/5'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <IconComp className="w-4.5 h-4.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
        
        {/* List of Registered Accounts */}
        <div className="xl:col-span-2 rounded-3xl p-6 neumorph-outset flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-primary text-sm tracking-wider flex items-center gap-1.5">
                <activeInfo.icon className="w-5 h-5 text-orange" /> {activeInfo.label} Directory
              </h3>
              <span className="text-xs font-semibold text-orange bg-orange/10 px-2.5 py-1 rounded-full border border-orange/10">
                {managers.length} Registered
              </span>
            </div>

            {loadingList ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-orange/30 border-t-orange animate-spin" />
                <span className="text-xs font-bold text-secondary tracking-widest uppercase">Loading Directory...</span>
              </div>
            ) : managers.length === 0 ? (
              <div className="text-center py-20 text-xs text-secondary font-bold">
                No registered {activeInfo.label} found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {managers.map((m) => {
                  const nameVal = m[activeInfo.nameField]
                  const emailVal = m[activeInfo.emailField]
                  const phoneVal = m[activeInfo.phoneField]
                  const isCurrent = Boolean(currentUser && emailVal === currentUser.email)

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl border border-theme bg-card-theme hover:border-orange/20 transition-all duration-300 relative group flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center font-black text-orange text-xs">
                            {nameVal?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-extrabold text-primary text-xs tracking-wide">{nameVal}</h4>
                              {isCurrent && (
                                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">You</span>
                              )}
                            </div>
                            <span className="text-[10px] text-secondary/85 font-semibold">ID: #{m.id}</span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 text-[10px] text-secondary/80 font-semibold">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-secondary/60" />
                            <span>{emailVal}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-secondary/60" />
                            <span>{phoneVal}</span>
                          </div>
                          {activeSubTab === 'driver' && m.driverLicenseNumber && (
                            <div className="flex items-center gap-2">
                              <ShieldAlert className="w-3.5 h-3.5 text-secondary/60" />
                              <span>License: {m.driverLicenseNumber} ({m.driverLicenseExpiryDate})</span>
                            </div>
                          )}
                          {m.city && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-secondary/60" />
                              <span>
                                {m.city}, {m.state ?? m.country}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-theme/40 flex justify-end">
                        <button
                          onClick={() => handleDelete(m.id, emailVal)}
                          disabled={isCurrent}
                          className="p-2 rounded-xl text-secondary hover:text-red-500 hover:bg-red-500/10 cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Registration Form based on Tab */}
        <div className="rounded-3xl p-6 neumorph-outset">
          <h3 className="font-extrabold text-primary text-sm tracking-wider mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-orange" /> Register {activeSubTab === 'fleet' ? 'Fleet Manager' : activeSubTab === 'safety' ? 'Safety Officer' : activeSubTab === 'driver' ? 'Driver' : 'Financial Analyst'}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Full Name</label>
              <div className={`relative rounded-xl neumorph-inset border px-3 py-2.5 ${errors[activeSubTab === 'fleet' ? 'fullName' : activeSubTab === 'safety' ? 'safetyOfficerName' : activeSubTab === 'driver' ? 'driverName' : 'financialAnalistName'] ? 'border-red-500/60' : 'border-theme'}`}>
                <Controller
                  name={activeSubTab === 'fleet' ? 'fullName' : activeSubTab === 'safety' ? 'safetyOfficerName' : activeSubTab === 'driver' ? 'driverName' : 'financialAnalistName'}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter full name"
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  )}
                />
              </div>
              {errors[activeSubTab === 'fleet' ? 'fullName' : activeSubTab === 'safety' ? 'safetyOfficerName' : activeSubTab === 'driver' ? 'driverName' : 'financialAnalistName'] && (
                <p className="mt-1 px-1 text-[9px] font-bold text-red-500">
                  {errors[activeSubTab === 'fleet' ? 'fullName' : activeSubTab === 'safety' ? 'safetyOfficerName' : activeSubTab === 'driver' ? 'driverName' : 'financialAnalistName']?.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Email Address</label>
              <div className={`relative rounded-xl neumorph-inset border px-3 py-2.5 ${errors[activeSubTab === 'fleet' ? 'email' : activeSubTab === 'safety' ? 'safetyOfficerEmail' : activeSubTab === 'driver' ? 'driverEmail' : 'financialAnalistEmail'] ? 'border-red-500/60' : 'border-theme'}`}>
                <Controller
                  name={activeSubTab === 'fleet' ? 'email' : activeSubTab === 'safety' ? 'safetyOfficerEmail' : activeSubTab === 'driver' ? 'driverEmail' : 'financialAnalistEmail'}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      placeholder="name@transit.com"
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  )}
                />
              </div>
              {errors[activeSubTab === 'fleet' ? 'email' : activeSubTab === 'safety' ? 'safetyOfficerEmail' : activeSubTab === 'driver' ? 'driverEmail' : 'financialAnalistEmail'] && (
                <p className="mt-1 px-1 text-[9px] font-bold text-red-500">
                  {errors[activeSubTab === 'fleet' ? 'email' : activeSubTab === 'safety' ? 'safetyOfficerEmail' : activeSubTab === 'driver' ? 'driverEmail' : 'financialAnalistEmail']?.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Password</label>
              <div className={`relative rounded-xl neumorph-inset border px-3 py-2.5 ${errors[activeSubTab === 'fleet' ? 'password' : activeSubTab === 'safety' ? 'safetyOfficerPassword' : activeSubTab === 'driver' ? 'driverPassword' : 'financialAnalistPassword'] ? 'border-red-500/60' : 'border-theme'}`}>
                <Controller
                  name={activeSubTab === 'fleet' ? 'password' : activeSubTab === 'safety' ? 'safetyOfficerPassword' : activeSubTab === 'driver' ? 'driverPassword' : 'financialAnalistPassword'}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  )}
                />
              </div>
              {errors[activeSubTab === 'fleet' ? 'password' : activeSubTab === 'safety' ? 'safetyOfficerPassword' : activeSubTab === 'driver' ? 'driverPassword' : 'financialAnalistPassword'] && (
                <p className="mt-1 px-1 text-[9px] font-bold text-red-500">
                  {errors[activeSubTab === 'fleet' ? 'password' : activeSubTab === 'safety' ? 'safetyOfficerPassword' : activeSubTab === 'driver' ? 'driverPassword' : 'financialAnalistPassword']?.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Phone Number</label>
              <div className={`relative rounded-xl neumorph-inset border px-3 py-2.5 ${errors[activeSubTab === 'fleet' ? 'phoneNumber' : activeSubTab === 'safety' ? 'safetyOfficerPhone' : activeSubTab === 'driver' ? 'driverPhone' : 'financialAnalistPhone'] ? 'border-red-500/60' : 'border-theme'}`}>
                <Controller
                  name={activeSubTab === 'fleet' ? 'phoneNumber' : activeSubTab === 'safety' ? 'safetyOfficerPhone' : activeSubTab === 'driver' ? 'driverPhone' : 'financialAnalistPhone'}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="9800000000"
                      className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                    />
                  )}
                />
              </div>
              {errors[activeSubTab === 'fleet' ? 'phoneNumber' : activeSubTab === 'safety' ? 'safetyOfficerPhone' : activeSubTab === 'driver' ? 'driverPhone' : 'financialAnalistPhone'] && (
                <p className="mt-1 px-1 text-[9px] font-bold text-red-500">
                  {errors[activeSubTab === 'fleet' ? 'phoneNumber' : activeSubTab === 'safety' ? 'safetyOfficerPhone' : activeSubTab === 'driver' ? 'driverPhone' : 'financialAnalistPhone']?.message}
                </p>
              )}
            </div>

            {/* Driver specific license details */}
            {activeSubTab === 'driver' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">License Number</label>
                  <div className={`relative rounded-xl neumorph-inset border px-3 py-2.5 ${errors.driverLicenseNumber ? 'border-red-500/60' : 'border-theme'}`}>
                    <Controller
                      name="driverLicenseNumber"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="DL-2026"
                          className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                        />
                      )}
                    />
                  </div>
                  {errors.driverLicenseNumber && <p className="mt-1 px-1 text-[9px] font-bold text-red-500">{errors.driverLicenseNumber.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Expiry Date</label>
                  <div className={`relative rounded-xl neumorph-inset border px-3 py-2.5 ${errors.driverLicenseExpiryDate ? 'border-red-500/60' : 'border-theme'}`}>
                    <Controller
                      name="driverLicenseExpiryDate"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="date"
                          className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none cursor-pointer"
                        />
                      )}
                    />
                  </div>
                  {errors.driverLicenseExpiryDate && <p className="mt-1 px-1 text-[9px] font-bold text-red-500">{errors.driverLicenseExpiryDate.message}</p>}
                </div>
              </div>
            )}

            {/* City & Country Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">City</label>
                <div className="relative rounded-xl neumorph-inset border px-3 py-2.5 border-theme">
                  <Controller
                    name={activeSubTab === 'fleet' ? 'city' : activeSubTab === 'safety' ? 'safetyOfficerCity' : activeSubTab === 'driver' ? 'driverCity' : 'financialAnalistCity'}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Delhi"
                        className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                      />
                    )}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Country</label>
                <div className="relative rounded-xl neumorph-inset border px-3 py-2.5 border-theme">
                  <Controller
                    name={activeSubTab === 'fleet' ? 'country' : activeSubTab === 'safety' ? 'safetyOfficerCountry' : activeSubTab === 'driver' ? 'driverCountry' : 'financialAnalistCountry'}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="India"
                        className="w-full bg-transparent text-xs text-primary font-bold focus:outline-none"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:pointer-events-none neumorph-btn-orange text-xs shadow-md mt-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                `Register ${activeSubTab === 'fleet' ? 'Fleet Manager' : activeSubTab === 'safety' ? 'Safety Officer' : activeSubTab === 'driver' ? 'Driver' : 'Financial Analyst'}`
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  )
}
