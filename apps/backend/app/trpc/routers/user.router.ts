// app/trpc/routers/user.router.ts
//
// Full user router that mirrors UsersController:
// each mutation creates/updates/deletes both the User row AND the matching
// role-specific profile (Driver | FinancialAnalyst | SafetyOfficer | FleetManager)
// inside a single DB transaction.

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '#trpc/trpc'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

import User from '#models/user'
import Driver from '#models/driver'
import FinancialAnalyst from '#models/financial_analist'
import SafetyOfficer from '#models/safty_officer'
import FleetManager from '#models/fleet_manager'

/* =========================================================================
   Zod Schemas
   ========================================================================= */

const userTypeEnum = z.enum(['financial_analyst', 'fleet_manager', 'driver', 'safety_officer'])
type UserType = z.infer<typeof userTypeEnum>

// ── Input schemas ──────────────────────────────────────────────────────────

const idSchema = z.object({
  id: z.number().int().positive(),
})

const listSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  userType: userTypeEnum.optional(),
})

const createSchema = z.object({
  // User table
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  mobile: z.string().trim().min(10).max(15),
  password: z.string().min(6).max(180),
  userType: userTypeEnum,
  // Driver-specific (required when userType === 'driver')
  driverLicenseNumber: z.string().trim().min(4).max(50).optional(),
  driverLicenseExpiryDate: z.string().trim().optional(),
  // Common profile fields
  address: z.string().trim().max(255).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
})

const updateProfileSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string().trim().min(2).max(100).optional(),
  mobile: z.string().trim().min(10).max(15).optional(),
  // Driver-specific
  driverLicenseNumber: z.string().trim().min(4).max(50).optional(),
  driverLicenseExpiryDate: z.string().trim().optional(),
  // Common profile
  address: z.string().trim().max(255).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
})

const changePasswordSchema = z.object({
  id: z.number().int().positive(),
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6).max(180),
})

const setActiveSchema = z.object({
  id: z.number().int().positive(),
  isActive: z.boolean(),
})

// ── Shared profile sub-schemas ──────────────────────────────────────────────

const driverProfileOutput = z.object({
  id: z.number(),
  driverName: z.string(),
  driverEmail: z.string(),
  driverPhone: z.string(),
  driverLicenseNumber: z.string(),
  driverLicenseExpiryDate: z.string(),
  driverAddress: z.string().nullable().optional(),
  driverCity: z.string().nullable().optional(),
  driverState: z.string().nullable().optional(),
  driverCountry: z.string().nullable().optional(),
  driverRole: z.string().nullable().optional(),
})

const financialAnalystProfileOutput = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
})

const safetyOfficerProfileOutput = z.object({
  id: z.number(),
  safetyOfficerName: z.string(),
  safetyOfficerEmail: z.string(),
  safetyOfficerPhone: z.string(),
  safetyOfficerAddress: z.string().nullable().optional(),
  safetyOfficerCity: z.string().nullable().optional(),
  safetyOfficerState: z.string().nullable().optional(),
  safetyOfficerCountry: z.string().nullable().optional(),
  safetyOfficerRole: z.string().nullable().optional(),
})

const fleetManagerProfileOutput = z.object({
  id: z.number(),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
})

// ── Output schemas ──────────────────────────────────────────────────────────

const userBaseOutput = z.object({
  id: z.number(),
  fullName: z.string().nullable(),
  email: z.string(),
  mobile: z.string(),
  userType: z.string(),
  isActive: z.boolean(),
  profile: z
    .union([
      driverProfileOutput,
      financialAnalystProfileOutput,
      safetyOfficerProfileOutput,
      fleetManagerProfileOutput,
      z.null(),
    ])
    .optional(),
})

const listOutput = z.object({
  meta: z.object({
    total: z.number(),
    perPage: z.number(),
    currentPage: z.number(),
    lastPage: z.number(),
  }),
  data: z.array(userBaseOutput),
})

const successOutput = z.object({
  success: z.boolean(),
  message: z.string(),
})

/* =========================================================================
   Helpers
   ========================================================================= */

/** Preload the correct profile relation and return the user with it. */
async function fetchUserWithProfile(id: number): Promise<User | null> {
  const bare = await User.find(id)
  if (!bare) return null

  const userType = bare.userType as UserType
  const query = User.query().where('id', id)

  if (userType === 'driver') (query as any).preload('driver')
  else if (userType === 'financial_analyst') (query as any).preload('financialAnalyst')
  else if (userType === 'fleet_manager') (query as any).preload('fleetManager')

  return ((await query.first()) as User) ?? null
}

/** Shape a User instance (with preloaded relations) into the output object. */
function buildResponse(user: User) {
  const base = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    userType: user.userType,
    isActive: user.isActive,
  }

  const u = user as any

  if (user.userType === 'driver' && u.driver) {
    return {
      ...base,
      profile: {
        id: u.driver.id,
        driverName: u.driver.driverName,
        driverEmail: u.driver.driverEmail,
        driverPhone: u.driver.driverPhone,
        driverLicenseNumber: u.driver.driverLicenseNumber,
        driverLicenseExpiryDate: u.driver.driverLicenseExpiryDate,
        driverAddress: u.driver.driverAddress,
        driverCity: u.driver.driverCity,
        driverState: u.driver.driverState,
        driverCountry: u.driver.driverCountry,
        driverRole: u.driver.driverRole,
      },
    }
  }

  if (user.userType === 'financial_analyst' && u.financialAnalyst) {
    return {
      ...base,
      profile: {
        id: u.financialAnalyst.id,
        name: u.financialAnalyst.financialAnalistName,
        email: u.financialAnalyst.financialAnalistEmail,
        phone: u.financialAnalyst.financialAnalistPhone,
        address: u.financialAnalyst.financialAnalistAddress,
        city: u.financialAnalyst.financialAnalistCity,
        state: u.financialAnalyst.financialAnalistState,
        country: u.financialAnalyst.financialAnalistCountry,
        role: u.financialAnalyst.financialAnalistRole,
      },
    }
  }

  if (user.userType === 'fleet_manager' && u.fleetManager) {
    return {
      ...base,
      profile: {
        id: u.fleetManager.id,
        fullName: u.fleetManager.fullName,
        email: u.fleetManager.email,
        phoneNumber: u.fleetManager.phoneNumber,
        address: u.fleetManager.address,
        city: u.fleetManager.city,
        state: u.fleetManager.state,
        country: u.fleetManager.country,
        role: u.fleetManager.role,
      },
    }
  }

  // safety_officer — surface the raw fields if the relation is loaded
  if (user.userType === 'safety_officer' && u.$extras?.safetyOfficer) {
    const s = u.$extras.safetyOfficer
    return {
      ...base,
      profile: {
        id: s.id,
        safetyOfficerName: s.safetyOfficerName,
        safetyOfficerEmail: s.safetyOfficerEmail,
        safetyOfficerPhone: s.safetyOfficerPhone,
        safetyOfficerAddress: s.safetyOfficerAddress,
        safetyOfficerCity: s.safetyOfficerCity,
        safetyOfficerState: s.safetyOfficerState,
        safetyOfficerCountry: s.safetyOfficerCountry,
        safetyOfficerRole: s.safetyOfficerRole,
      },
    }
  }

  return { ...base, profile: null }
}

/* =========================================================================
   Router
   ========================================================================= */

export const userRouter = router({
  /* ----------------------------------------------------------------------- */
  /* me — GET /trpc/user.me                                                   */
  /* ----------------------------------------------------------------------- */
  me: protectedProcedure.output(userBaseOutput).query(async ({ ctx }) => {
    const authUser = await ctx.auth.getUserOrFail()
    const user = (await fetchUserWithProfile(authUser.id))!
    return buildResponse(user)
  }),

  /* ----------------------------------------------------------------------- */
  /* list — GET /trpc/user.list                                               */
  /* ----------------------------------------------------------------------- */
  list: protectedProcedure
    .input(listSchema)
    .output(listOutput)
    .query(async ({ input }) => {
      const { page, perPage, search, userType } = input

      const query = User.query()

      if (search) {
        query.where((b) => {
          b.whereILike('full_name', `%${search}%`)
            .orWhereILike('email', `%${search}%`)
            .orWhereILike('mobile', `%${search}%`)
        })
      }

      if (userType) {
        query.where('user_type', userType)
        if (userType === 'driver') (query as any).preload('driver')
        else if (userType === 'financial_analyst') (query as any).preload('financialAnalyst')
        else if (userType === 'fleet_manager') (query as any).preload('fleetManager')
      } else {
        ;(query as any).preload('driver').preload('financialAnalyst').preload('fleetManager')
      }

      const result = await query.orderBy('id', 'asc').paginate(page, perPage)

      return {
        meta: {
          total: result.total,
          perPage: result.perPage,
          currentPage: result.currentPage,
          lastPage: result.lastPage,
        },
        data: result.all().map((u) => buildResponse(u as User)),
      }
    }),

  /* ----------------------------------------------------------------------- */
  /* getById — GET /trpc/user.getById                                         */
  /* ----------------------------------------------------------------------- */
  getById: protectedProcedure
    .input(idSchema)
    .output(userBaseOutput)
    .query(async ({ input }) => {
      const user = await fetchUserWithProfile(input.id)
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      return buildResponse(user)
    }),

  /* ----------------------------------------------------------------------- */
  /* create — mutation /trpc/user.create                                      */
  /* Creates User + role-specific profile atomically.                         */
  /* ----------------------------------------------------------------------- */
  create: protectedProcedure
    .input(createSchema)
    .output(userBaseOutput)
    .mutation(async ({ input }) => {
      // Driver requires license fields
      if (input.userType === 'driver') {
        if (!input.driverLicenseNumber || !input.driverLicenseExpiryDate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'driverLicenseNumber and driverLicenseExpiryDate are required for driver accounts',
          })
        }
      }

      // Email uniqueness
      const existing = await User.findBy('email', input.email)
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'A user with this email already exists' })
      }

      const hashedPassword = await hash.make(input.password)
      const userType = input.userType as UserType

      const created = await db.transaction(async (trx) => {
        let profileId: number

        if (userType === 'driver') {
          const driver = await Driver.create(
            {
              driverName: input.fullName,
              driverEmail: input.email,
              driverPhone: input.mobile,
              driverPassword: hashedPassword,
              driverLicenseNumber: input.driverLicenseNumber!,
              driverLicenseExpiryDate: input.driverLicenseExpiryDate!,
              driverAddress: input.address ?? '',
              driverCity: input.city ?? '',
              driverState: input.state ?? '',
              driverCountry: input.country ?? '',
              driverRole: 'driver',
            },
            { client: trx }
          )
          profileId = driver.id
        } else if (userType === 'financial_analyst') {
          const analyst = await FinancialAnalyst.create(
            {
              financialAnalistName: input.fullName,
              financialAnalistEmail: input.email,
              financialAnalistPhone: input.mobile,
              financialAnalistPassword: hashedPassword,
              financialAnalistAddress: input.address ?? '',
              financialAnalistCity: input.city ?? '',
              financialAnalistState: input.state ?? '',
              financialAnalistCountry: input.country ?? '',
              financialAnalistRole: 'financial_analyst',
            },
            { client: trx }
          )
          profileId = analyst.id
        } else if (userType === 'safety_officer') {
          const officer = await SafetyOfficer.create(
            {
              safetyOfficerName: input.fullName,
              safetyOfficerEmail: input.email,
              safetyOfficerPhone: input.mobile,
              safetyOfficerPassword: hashedPassword,
              safetyOfficerAddress: input.address ?? '',
              safetyOfficerCity: input.city ?? '',
              safetyOfficerState: input.state ?? '',
              safetyOfficerCountry: input.country ?? '',
              safetyOfficerRole: 'safety_officer',
            },
            { client: trx }
          )
          profileId = officer.id
        } else {
          // fleet_manager
          const manager = await FleetManager.create(
            {
              fullName: input.fullName,
              email: input.email,
              phoneNumber: input.mobile,
              password: hashedPassword,
              address: input.address ?? '',
              city: input.city ?? '',
              state: input.state ?? '',
              country: input.country ?? '',
              role: 'fleet_manager',
            },
            { client: trx }
          )
          profileId = manager.id
        }

        const user = await User.create(
          {
            fullName: input.fullName,
            email: input.email,
            mobile: input.mobile,
            password: hashedPassword,
            userType,
            isActive: true,
            driverId: userType === 'driver' ? profileId : null,
            financialAnalystId: userType === 'financial_analyst' ? profileId : null,
            safetyOfficerId: userType === 'safety_officer' ? profileId : null,
            fleetManagerId: userType === 'fleet_manager' ? profileId : null,
          },
          { client: trx }
        )

        return user
      })

      const user = (await fetchUserWithProfile(created.id))!
      return buildResponse(user)
    }),

  /* ----------------------------------------------------------------------- */
  /* updateProfile — mutation /trpc/user.updateProfile                        */
  /* Updates User + matching profile in one transaction.                      */
  /* ----------------------------------------------------------------------- */
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .output(userBaseOutput)
    .mutation(async ({ input }) => {
      const { id, ...data } = input

      const user = await User.find(id)
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })

      const userType = user.userType as UserType

      await db.transaction(async (trx) => {
        user.useTransaction(trx)
        if (data.fullName !== undefined) user.fullName = data.fullName
        if (data.mobile !== undefined) user.mobile = data.mobile
        await user.save()

        if (userType === 'driver' && user.driverId) {
          const driver = await Driver.find(user.driverId, { client: trx })
          if (driver) {
            if (data.fullName !== undefined) driver.driverName = data.fullName
            if (data.mobile !== undefined) driver.driverPhone = data.mobile
            if (data.driverLicenseNumber !== undefined)
              driver.driverLicenseNumber = data.driverLicenseNumber
            if (data.driverLicenseExpiryDate !== undefined)
              driver.driverLicenseExpiryDate = data.driverLicenseExpiryDate
            if (data.address !== undefined) driver.driverAddress = data.address
            if (data.city !== undefined) driver.driverCity = data.city
            if (data.state !== undefined) driver.driverState = data.state
            if (data.country !== undefined) driver.driverCountry = data.country
            await driver.save()
          }
        } else if (userType === 'financial_analyst' && user.financialAnalystId) {
          const analyst = await FinancialAnalyst.find(user.financialAnalystId, { client: trx })
          if (analyst) {
            if (data.fullName !== undefined) analyst.financialAnalistName = data.fullName
            if (data.mobile !== undefined) analyst.financialAnalistPhone = data.mobile
            if (data.address !== undefined) analyst.financialAnalistAddress = data.address
            if (data.city !== undefined) analyst.financialAnalistCity = data.city
            if (data.state !== undefined) analyst.financialAnalistState = data.state
            if (data.country !== undefined) analyst.financialAnalistCountry = data.country
            await analyst.save()
          }
        } else if (userType === 'safety_officer' && user.safetyOfficerId) {
          const officer = await SafetyOfficer.find(user.safetyOfficerId, { client: trx })
          if (officer) {
            if (data.fullName !== undefined) officer.safetyOfficerName = data.fullName
            if (data.mobile !== undefined) officer.safetyOfficerPhone = data.mobile
            if (data.address !== undefined) officer.safetyOfficerAddress = data.address
            if (data.city !== undefined) officer.safetyOfficerCity = data.city
            if (data.state !== undefined) officer.safetyOfficerState = data.state
            if (data.country !== undefined) officer.safetyOfficerCountry = data.country
            await officer.save()
          }
        } else if (userType === 'fleet_manager' && user.fleetManagerId) {
          const manager = await FleetManager.find(user.fleetManagerId, { client: trx })
          if (manager) {
            if (data.fullName !== undefined) manager.fullName = data.fullName
            if (data.mobile !== undefined) manager.phoneNumber = data.mobile
            if (data.address !== undefined) manager.address = data.address
            if (data.city !== undefined) manager.city = data.city
            if (data.state !== undefined) manager.state = data.state
            if (data.country !== undefined) manager.country = data.country
            await manager.save()
          }
        }
      })

      const updated = (await fetchUserWithProfile(id))!
      return buildResponse(updated)
    }),

  /* ----------------------------------------------------------------------- */
  /* changePassword — mutation /trpc/user.changePassword                      */
  /* Verifies current password and syncs new hash to the profile table.       */
  /* ----------------------------------------------------------------------- */
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .output(successOutput)
    .mutation(async ({ input }) => {
      const { id, currentPassword, newPassword } = input

      const user = await User.find(id)
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })

      const valid = await hash.verify(user.password, currentPassword)
      if (!valid) throw new TRPCError({ code: 'FORBIDDEN', message: 'Current password is incorrect' })

      const newHash = await hash.make(newPassword)
      const userType = user.userType as UserType

      await db.transaction(async (trx) => {
        user.useTransaction(trx)
        user.password = newHash
        await user.save()

        if (userType === 'driver' && user.driverId) {
          const driver = await Driver.find(user.driverId, { client: trx })
          if (driver) { driver.driverPassword = newHash; await driver.save() }
        } else if (userType === 'financial_analyst' && user.financialAnalystId) {
          const analyst = await FinancialAnalyst.find(user.financialAnalystId, { client: trx })
          if (analyst) { analyst.financialAnalistPassword = newHash; await analyst.save() }
        } else if (userType === 'safety_officer' && user.safetyOfficerId) {
          const officer = await SafetyOfficer.find(user.safetyOfficerId, { client: trx })
          if (officer) { officer.safetyOfficerPassword = newHash; await officer.save() }
        } else if (userType === 'fleet_manager' && user.fleetManagerId) {
          const manager = await FleetManager.find(user.fleetManagerId, { client: trx })
          if (manager) { manager.password = newHash; await manager.save() }
        }
      })

      return { success: true, message: 'Password updated successfully' }
    }),

  /* ----------------------------------------------------------------------- */
  /* setActive — mutation /trpc/user.setActive                                */
  /* Toggles isActive on User + syncs to profile tables that carry it.        */
  /* ----------------------------------------------------------------------- */
  setActive: protectedProcedure
    .input(setActiveSchema)
    .output(successOutput)
    .mutation(async ({ input }) => {
      const { id, isActive } = input

      const user = await User.find(id)
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })

      const userType = user.userType as UserType

      await db.transaction(async (trx) => {
        user.useTransaction(trx)
        user.isActive = isActive
        await user.save()

        if (userType === 'financial_analyst' && user.financialAnalystId) {
          const analyst = await FinancialAnalyst.find(user.financialAnalystId, { client: trx })
          if (analyst) { analyst.isActive = isActive; await analyst.save() }
        } else if (userType === 'safety_officer' && user.safetyOfficerId) {
          const officer = await SafetyOfficer.find(user.safetyOfficerId, { client: trx })
          if (officer) { officer.isActive = isActive; await officer.save() }
        }
      })

      return {
        success: true,
        message: isActive ? 'User activated successfully' : 'User deactivated successfully',
      }
    }),

  /* ----------------------------------------------------------------------- */
  /* delete — mutation /trpc/user.delete                                      */
  /* Soft-deletes User (isActive=false) + hard/soft deletes profile.          */
  /* ----------------------------------------------------------------------- */
  delete: protectedProcedure
    .input(idSchema)
    .output(successOutput)
    .mutation(async ({ input }) => {
      const user = await User.find(input.id)
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })

      const now = DateTime.now()
      const userType = user.userType as UserType

      await db.transaction(async (trx) => {
        user.useTransaction(trx)
        user.isActive = false
        await user.save()

        if (userType === 'driver' && user.driverId) {
          const driver = await Driver.find(user.driverId, { client: trx })
          if (driver) { driver.deletedAt = now; await driver.save() }
        } else if (userType === 'financial_analyst' && user.financialAnalystId) {
          const analyst = await FinancialAnalyst.find(user.financialAnalystId, { client: trx })
          if (analyst) { analyst.deletedAt = now; await analyst.save() }
        } else if (userType === 'safety_officer' && user.safetyOfficerId) {
          const officer = await SafetyOfficer.find(user.safetyOfficerId, { client: trx })
          if (officer) { officer.deletedAt = now; await officer.save() }
        } else if (userType === 'fleet_manager' && user.fleetManagerId) {
          const manager = await FleetManager.find(user.fleetManagerId, { client: trx })
          if (manager) { manager.deletedAt = now; await manager.save() }
        }
      })

      return { success: true, message: 'User deleted successfully' }
    }),
})
