// database/seeders/initial_users_seeder.ts
//
// Seeds one user of every role so the app can be tested immediately.
// Run: node ace db:seed --files database/seeders/initial_users_seeder.ts
//
// NOTE: Passwords are passed as PLAIN TEXT here on purpose.
// Both the role-specific models (FleetManager, Driver, FinancialAnalyst,
// SafetyOfficer) and the User model (via AuthFinder / @beforeSave hooks)
// already hash the password automatically before saving.
// Hashing it again here would cause "Invalid user credentials" on login
// because the stored hash would be a hash-of-a-hash.

import { BaseSeeder } from '@adonisjs/lucid/seeders'

import User from '#models/user'
import Driver from '#models/driver'
import FinancialAnalyst from '#models/financial_analist'
import SafetyOfficer from '#models/safty_officer'
import FleetManager from '#models/fleet_manager'

export default class InitialUsersSeeder extends BaseSeeder {
  async run() {
    console.log('🌱 Seeding initial users...')

    /* ──────────────────────────────────────────────────────────────────────
       1. Fleet Manager
       Login: fleetmanager@transit.com / Fleet@123
    ────────────────────────────────────────────────────────────────────── */
    const fleetPwd = 'Fleet@123' // plain — models hash it themselves

    const fleetManager = await FleetManager.updateOrCreate(
      { email: 'fleetmanager@transit.com' },
      {
        fullName: 'Suresh Fleet',
        email: 'fleetmanager@transit.com',
        password: fleetPwd,
        phoneNumber: '9800000001',
        address: '10, MG Road',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        role: 'fleet_manager',
      }
    )

    await User.updateOrCreate(
      { email: 'fleetmanager@transit.com' },
      {
        fullName: 'Suresh Fleet',
        email: 'fleetmanager@transit.com',
        mobile: '9800000001',
        password: fleetPwd,
        userType: 'fleet_manager',
        isActive: true,
        fleetManagerId: fleetManager.id,
      }
    )

    console.log('  ✅ Fleet Manager  →  fleetmanager@transit.com  /  Fleet@123')

    /* ──────────────────────────────────────────────────────────────────────
       2. Driver
       Login: driver@transit.com / Driver@123
    ────────────────────────────────────────────────────────────────────── */
    const driverPwd = 'Driver@123' // plain — models hash it themselves

    const driver = await Driver.updateOrCreate(
      { driverEmail: 'driver@transit.com' },
      {
        driverName: 'Raju Driver',
        driverEmail: 'driver@transit.com',
        driverPhone: '9800000002',
        driverPassword: driverPwd,
        driverLicenseNumber: 'DL-MH-20240001',
        driverLicenseExpiryDate: '2028-12-31',
        driverAddress: '22, Shivaji Nagar',
        driverCity: 'Mumbai',
        driverState: 'Maharashtra',
        driverCountry: 'India',
        driverRole: 'driver',
      }
    )

    await User.updateOrCreate(
      { email: 'driver@transit.com' },
      {
        fullName: 'Raju Driver',
        email: 'driver@transit.com',
        mobile: '9800000002',
        password: driverPwd,
        userType: 'driver',
        isActive: true,
        driverId: driver.id,
      }
    )

    console.log('  ✅ Driver         →  driver@transit.com  /  Driver@123')

    /* ──────────────────────────────────────────────────────────────────────
       3. Financial Analyst
       Login: analyst@transit.com / Analyst@123
    ────────────────────────────────────────────────────────────────────── */
    const analystPwd = 'Analyst@123' // plain — models hash it themselves

    const analyst = await FinancialAnalyst.updateOrCreate(
      { financialAnalistEmail: 'analyst@transit.com' },
      {
        financialAnalistName: 'Priya Sharma',
        financialAnalistEmail: 'analyst@transit.com',
        financialAnalistPhone: '9800000003',
        financialAnalistPassword: analystPwd,
        financialAnalistAddress: '5, Koramangala',
        financialAnalistCity: 'Bangalore',
        financialAnalistState: 'Karnataka',
        financialAnalistCountry: 'India',
        financialAnalistRole: 'financial_analyst',
        isActive: true,
      }
    )

    await User.updateOrCreate(
      { email: 'analyst@transit.com' },
      {
        fullName: 'Priya Sharma',
        email: 'analyst@transit.com',
        mobile: '9800000003',
        password: analystPwd,
        userType: 'financial_analyst',
        isActive: true,
        financialAnalystId: analyst.id,
      }
    )

    console.log('  ✅ Fin. Analyst   →  analyst@transit.com  /  Analyst@123')

    /* ──────────────────────────────────────────────────────────────────────
       4. Safety Officer
       Login: safety@transit.com / Safety@123
    ────────────────────────────────────────────────────────────────────── */
    const safetyPwd = 'Safety@123' // plain — models hash it themselves

    const officer = await SafetyOfficer.updateOrCreate(
      { safetyOfficerEmail: 'safety@transit.com' },
      {
        safetyOfficerName: 'Amit Safety',
        safetyOfficerEmail: 'safety@transit.com',
        safetyOfficerPhone: '9800000004',
        safetyOfficerPassword: safetyPwd,
        safetyOfficerAddress: '7, Camp Area',
        safetyOfficerCity: 'Pune',
        safetyOfficerState: 'Maharashtra',
        safetyOfficerCountry: 'India',
        safetyOfficerRole: 'safety_officer',
        isActive: true,
      }
    )

    await User.updateOrCreate(
      { email: 'safety@transit.com' },
      {
        fullName: 'Amit Safety',
        email: 'safety@transit.com',
        mobile: '9800000004',
        password: safetyPwd,
        userType: 'safety_officer',
        isActive: true,
        safetyOfficerId: officer.id,
      }
    )

    console.log('  ✅ Safety Officer →  safety@transit.com  /  Safety@123')

    console.log('\n🎉 Seeding complete! All 4 users ready.')
    console.log('─'.repeat(52))
    console.log('Role              Email                    Password')
    console.log('─'.repeat(52))
    console.log('Fleet Manager     fleetmanager@transit.com Fleet@123')
    console.log('Driver            driver@transit.com       Driver@123')
    console.log('Financial Analyst analyst@transit.com      Analyst@123')
    console.log('Safety Officer    safety@transit.com       Safety@123')
    console.log('─'.repeat(52))
  }
}