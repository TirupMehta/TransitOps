// app/controllers/users_controller.ts
//
// HTTP controller for /api/v1/users routes.
// Each operation combines the core User record with the matching
// role-specific profile (Driver | FinancialAnalyst | SafetyOfficer | FleetManager)
// inside a single DB transaction so both are always in sync.
//
// NOTE on passwords: every role model (Driver, FinancialAnalyst,
// SafetyOfficer, FleetManager) and the User model (via AuthFinder /
// @beforeSave) already hash the password automatically on save.
// This controller must pass the PLAIN password straight through —
// hashing it here as well would double-hash it and break login.

import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'

import User from '#models/user'
import Driver from '#models/driver'
import FinancialAnalyst from '#models/financial_analist'
import SafetyOfficer from '#models/safty_officer'
import FleetManager from '#models/fleet_manager'

/* =========================================================================
   Validators
   ========================================================================= */

/**
 * List query-string validator
 */
const listValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    perPage: vine.number().min(1).max(100).optional(),
    search: vine.string().trim().optional(),
    userType: vine
      .enum(['financial_analyst', 'fleet_manager', 'driver', 'safety_officer'])
      .optional(),
  })
)

/**
 * Create-user validator — common fields + role-specific required fields.
 * The role-specific fields are validated in code so we can give a clear error.
 */
const createUserValidator = vine.compile(
  vine.object({
    // ── User table ──────────────────────────────────────────────────
    fullName: vine.string().trim().minLength(2).maxLength(100),
    email: vine.string().trim().email(),
    mobile: vine.string().trim().minLength(10).maxLength(15),
    password: vine.string().minLength(6).maxLength(180),
    userType: vine.enum(['financial_analyst', 'fleet_manager', 'driver', 'safety_officer']),

    // ── Driver profile (required when userType === 'driver') ─────────
    driverLicenseNumber: vine.string().trim().minLength(4).maxLength(50).optional(),
    driverLicenseExpiryDate: vine.string().trim().optional(),

    // ── Common profile fields (optional for all roles) ───────────────
    address: vine.string().trim().maxLength(255).optional(),
    city: vine.string().trim().maxLength(100).optional(),
    state: vine.string().trim().maxLength(100).optional(),
    country: vine.string().trim().maxLength(100).optional(),
  })
)

/**
 * Update-profile validator — all fields optional; role-specific fields
 * are applied only when they are present.
 */
const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100).optional(),
    mobile: vine.string().trim().minLength(10).maxLength(15).optional(),

    // Driver-specific
    driverLicenseNumber: vine.string().trim().minLength(4).maxLength(50).optional(),
    driverLicenseExpiryDate: vine.string().trim().optional(),

    // Common profile
    address: vine.string().trim().maxLength(255).optional(),
    city: vine.string().trim().maxLength(100).optional(),
    state: vine.string().trim().maxLength(100).optional(),
    country: vine.string().trim().maxLength(100).optional(),
  })
)

const changePasswordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string().minLength(6),
    newPassword: vine.string().minLength(6).maxLength(180),
  })
)

const setActiveValidator = vine.compile(
  vine.object({
    isActive: vine.boolean(),
  })
)

/* =========================================================================
   Helpers
   ========================================================================= */

type UserType = 'driver' | 'financial_analyst' | 'safety_officer' | 'fleet_manager'

/** Shape a user + its profile into a unified response object */
function buildUserResponse(user: User) {
  const base = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    userType: user.userType,
    isActive: user.isActive,
  }

  // Attach whichever profile was preloaded
  if (user.userType === 'driver' && user.driver) {
    return {
      ...base,
      profile: {
        id: user.driver.id,
        driverName: user.driver.driverName,
        driverEmail: user.driver.driverEmail,
        driverPhone: user.driver.driverPhone,
        driverLicenseNumber: user.driver.driverLicenseNumber,
        driverLicenseExpiryDate: user.driver.driverLicenseExpiryDate,
        driverAddress: user.driver.driverAddress,
        driverCity: user.driver.driverCity,
        driverState: user.driver.driverState,
        driverCountry: user.driver.driverCountry,
        driverRole: user.driver.driverRole,
      },
    }
  }

  if (user.userType === 'financial_analyst' && user.financialAnalyst) {
    return {
      ...base,
      profile: {
        id: user.financialAnalyst.id,
        name: user.financialAnalyst.financialAnalistName,
        email: user.financialAnalyst.financialAnalistEmail,
        phone: user.financialAnalyst.financialAnalistPhone,
        address: user.financialAnalyst.financialAnalistAddress,
        city: user.financialAnalyst.financialAnalistCity,
        state: user.financialAnalyst.financialAnalistState,
        country: user.financialAnalyst.financialAnalistCountry,
        role: user.financialAnalyst.financialAnalistRole,
      },
    }
  }

  if (user.userType === 'fleet_manager' && user.fleetManager) {
    return {
      ...base,
      profile: {
        id: user.fleetManager.id,
        fullName: user.fleetManager.fullName,
        email: user.fleetManager.email,
        phoneNumber: user.fleetManager.phoneNumber,
        address: user.fleetManager.address,
        city: user.fleetManager.city,
        state: user.fleetManager.state,
        country: user.fleetManager.country,
        role: user.fleetManager.role,
      },
    }
  }

  // safety_officer — no preloaded relation on User yet; return base
  return { ...base, profile: null }
}

/** Preload the correct profile relation for a given userType and return the same builder */
function preloadProfile(
  query: ReturnType<typeof User.query>,
  userType: UserType
): ReturnType<typeof User.query> {
  if (userType === 'driver')
    return (query as ReturnType<typeof User.query>).preload('driver' as any) as any
  if (userType === 'financial_analyst')
    return (query as ReturnType<typeof User.query>).preload('financialAnalyst' as any) as any
  if (userType === 'fleet_manager')
    return (query as ReturnType<typeof User.query>).preload('fleetManager' as any) as any
  return query // safety_officer — add preload when model relation exists
}

/* =========================================================================
   Controller
   ========================================================================= */

export default class UsersController {
  /* ---------------------------------------------------------------------- */
  /* GET /api/v1/users                                                        */
  /* ---------------------------------------------------------------------- */
  /**
   * Paginated list of users.
   * Query-string: ?page=&perPage=&search=&userType=
   * Each user row includes its role-specific profile object.
   */
  async index({ request, response }: HttpContext) {
    const rawQuery = request.qs()
    const input = await listValidator.validate({
      page: rawQuery.page ? Number(rawQuery.page) : undefined,
      perPage: rawQuery.perPage ? Number(rawQuery.perPage) : undefined,
      search: rawQuery.search,
      userType: rawQuery.userType,
    })

    const page = input.page ?? 1
    const perPage = input.perPage ?? 20

    const query = User.query()

    if (input.search) {
      query.where((b) => {
        b.whereILike('full_name', `%${input.search}%`)
          .orWhereILike('email', `%${input.search}%`)
          .orWhereILike('mobile', `%${input.search}%`)
      })
    }

    if (input.userType) {
      query.where('user_type', input.userType)
      preloadProfile(query, input.userType as UserType)
    } else {
      // Preload all profiles so every user has its nested data
      query.preload('driver').preload('financialAnalyst').preload('fleetManager')
    }

    const result = await query.orderBy('id', 'asc').paginate(page, perPage)

    return response.ok({
      meta: {
        total: result.total,
        perPage: result.perPage,
        currentPage: result.currentPage,
        lastPage: result.lastPage,
      },
      data: result.all().map(buildUserResponse),
    })
  }

  /* ---------------------------------------------------------------------- */
  /* POST /api/v1/users                                                       */
  /* ---------------------------------------------------------------------- */
  /**
   * Create a User + matching role-specific profile atomically.
   *
   * Body (JSON):
   * {
   *   fullName, email, mobile, password, userType,
   *   // driver extras:
   *   driverLicenseNumber?, driverLicenseExpiryDate?,
   *   // common profile:
   *   address?, city?, state?, country?
   * }
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)

    // Validate driver-required fields early
    if (data.userType === 'driver') {
      if (!data.driverLicenseNumber || !data.driverLicenseExpiryDate) {
        return response.unprocessableEntity({
          message:
            'driverLicenseNumber and driverLicenseExpiryDate are required for driver accounts',
        })
      }
    }

    // Check email uniqueness across the User table
    const existing = await User.findBy('email', data.email)
    if (existing) {
      return response.conflict({ message: 'A user with this email already exists' })
    }

    // IMPORTANT: do NOT hash here. Every model (Driver, FinancialAnalyst,
    // SafetyOfficer, FleetManager, User) hashes its own password column
    // automatically on save (via @beforeSave / AuthFinder). Hashing it
    // here too would double-hash it and login would always fail.
    const plainPassword = data.password
    const userType = data.userType as UserType

    const result = await db.transaction(async (trx) => {
      /* ── 1. Create the role-specific profile ──────────────────────── */
      let profileId: number

      if (userType === 'driver') {
        const driver = await Driver.create(
          {
            driverName: data.fullName,
            driverEmail: data.email,
            driverPhone: data.mobile,
            driverPassword: plainPassword,
            driverLicenseNumber: data.driverLicenseNumber!,
            driverLicenseExpiryDate: data.driverLicenseExpiryDate!,
            driverAddress: data.address ?? '',
            driverCity: data.city ?? '',
            driverState: data.state ?? '',
            driverCountry: data.country ?? '',
            driverRole: 'driver',
          },
          { client: trx }
        )
        profileId = driver.id
      } else if (userType === 'financial_analyst') {
        const analyst = await FinancialAnalyst.create(
          {
            financialAnalistName: data.fullName,
            financialAnalistEmail: data.email,
            financialAnalistPhone: data.mobile,
            financialAnalistPassword: plainPassword,
            financialAnalistAddress: data.address ?? '',
            financialAnalistCity: data.city ?? '',
            financialAnalistState: data.state ?? '',
            financialAnalistCountry: data.country ?? '',
            financialAnalistRole: 'financial_analyst',
          },
          { client: trx }
        )
        profileId = analyst.id
      } else if (userType === 'safety_officer') {
        const officer = await SafetyOfficer.create(
          {
            safetyOfficerName: data.fullName,
            safetyOfficerEmail: data.email,
            safetyOfficerPhone: data.mobile,
            safetyOfficerPassword: plainPassword,
            safetyOfficerAddress: data.address ?? '',
            safetyOfficerCity: data.city ?? '',
            safetyOfficerState: data.state ?? '',
            safetyOfficerCountry: data.country ?? '',
            safetyOfficerRole: 'safety_officer',
          },
          { client: trx }
        )
        profileId = officer.id
      } else {
        // fleet_manager
        const manager = await FleetManager.create(
          {
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.mobile,
            password: plainPassword,
            address: data.address ?? '',
            city: data.city ?? '',
            state: data.state ?? '',
            country: data.country ?? '',
            role: 'fleet_manager',
          },
          { client: trx }
        )
        profileId = manager.id
      }

      /* ── 2. Create the User row, linking to the profile ───────────── */
      const user = await User.create(
        {
          fullName: data.fullName,
          email: data.email,
          mobile: data.mobile,
          password: plainPassword,
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

    // Re-fetch with profile so the response includes all nested data
    const user = (await preloadProfile(
      User.query().where('id', result.id),
      userType
    ).firstOrFail()) as User

    return response.created(buildUserResponse(user))
  }

  /* ---------------------------------------------------------------------- */
  /* GET /api/v1/users/:id                                                    */
  /* ---------------------------------------------------------------------- */
  /**
   * Fetch a single user + its profile by id.
   */
  async show({ params, response }: HttpContext) {
    const id = Number(params.id)
    if (!Number.isInteger(id) || id < 1) {
      return response.badRequest({ message: 'Invalid user id' })
    }

    // First load user to determine userType, then re-query with profile preloaded
    const bare = await User.find(id)
    if (!bare) {
      return response.notFound({ message: 'User not found' })
    }

    const user = (await preloadProfile(
      User.query().where('id', id),
      bare.userType as UserType
    ).firstOrFail()) as User

    return response.ok(buildUserResponse(user))
  }

  /* ---------------------------------------------------------------------- */
  /* PATCH /api/v1/users/:id/profile                                         */
  /* ---------------------------------------------------------------------- */
  /**
   * Update the User row AND the matching role-specific profile simultaneously.
   *
   * Body (JSON): any subset of
   * { fullName, mobile, address, city, state, country,
   *   driverLicenseNumber, driverLicenseExpiryDate }
   */
  async updateProfile({ params, request, response }: HttpContext) {
    const id = Number(params.id)
    if (!Number.isInteger(id) || id < 1) {
      return response.badRequest({ message: 'Invalid user id' })
    }

    const data = await request.validateUsing(updateProfileValidator)

    const user = await User.find(id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    const userType = user.userType as UserType

    await db.transaction(async (trx) => {
      // ── Update User row ────────────────────────────────────────────
      user.useTransaction(trx)
      if (data.fullName !== undefined) user.fullName = data.fullName
      if (data.mobile !== undefined) user.mobile = data.mobile
      await user.save()

      // ── Update the matching profile ────────────────────────────────
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

    // Re-fetch with profile
    const updated = (await preloadProfile(
      User.query().where('id', id),
      userType
    ).firstOrFail()) as User

    return response.ok(buildUserResponse(updated))
  }

  /* ---------------------------------------------------------------------- */
  /* PATCH /api/v1/users/:id/password                                        */
  /* ---------------------------------------------------------------------- */
  /**
   * Change the user's password after verifying the current one.
   * The new (plain) password is also synced to the matching profile table —
   * each model hashes its own password column automatically on save.
   *
   * Body (JSON): { currentPassword, newPassword }
   */
  async changePassword({ params, request, response }: HttpContext) {
    const id = Number(params.id)
    if (!Number.isInteger(id) || id < 1) {
      return response.badRequest({ message: 'Invalid user id' })
    }

    const { currentPassword, newPassword } = await request.validateUsing(changePasswordValidator)

    const user = await User.find(id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    const valid = await hash.verify(user.password, currentPassword)
    if (!valid) {
      return response.forbidden({ message: 'Current password is incorrect' })
    }

    // Do NOT hash here — let each model's own hook hash it on save.
    const newPlainPassword = newPassword

    await db.transaction(async (trx) => {
      user.useTransaction(trx)
      user.password = newPlainPassword
      await user.save()

      const userType = user.userType as UserType

      // Sync to profile
      if (userType === 'driver' && user.driverId) {
        const driver = await Driver.find(user.driverId, { client: trx })
        if (driver) {
          driver.driverPassword = newPlainPassword
          await driver.save()
        }
      } else if (userType === 'financial_analyst' && user.financialAnalystId) {
        const analyst = await FinancialAnalyst.find(user.financialAnalystId, { client: trx })
        if (analyst) {
          analyst.financialAnalistPassword = newPlainPassword
          await analyst.save()
        }
      } else if (userType === 'safety_officer' && user.safetyOfficerId) {
        const officer = await SafetyOfficer.find(user.safetyOfficerId, { client: trx })
        if (officer) {
          officer.safetyOfficerPassword = newPlainPassword
          await officer.save()
        }
      } else if (userType === 'fleet_manager' && user.fleetManagerId) {
        const manager = await FleetManager.find(user.fleetManagerId, { client: trx })
        if (manager) {
          manager.password = newPlainPassword
          await manager.save()
        }
      }
    })

    return response.ok({ success: true, message: 'Password updated successfully' })
  }

  /* ---------------------------------------------------------------------- */
  /* PATCH /api/v1/users/:id/active                                          */
  /* ---------------------------------------------------------------------- */
  /**
   * Activate or deactivate a user account.
   * Syncs isActive to the SafetyOfficer and FinancialAnalyst profiles
   * (those models carry an isActive flag).
   *
   * Body (JSON): { isActive: boolean }
   */
  async setActive({ params, request, response }: HttpContext) {
    const id = Number(params.id)
    if (!Number.isInteger(id) || id < 1) {
      return response.badRequest({ message: 'Invalid user id' })
    }

    const { isActive } = await request.validateUsing(setActiveValidator)

    const user = await User.find(id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    await db.transaction(async (trx) => {
      user.useTransaction(trx)
      user.isActive = isActive
      await user.save()

      const userType = user.userType as UserType

      // Sync isActive where the profile carries it
      if (userType === 'financial_analyst' && user.financialAnalystId) {
        const analyst = await FinancialAnalyst.find(user.financialAnalystId, { client: trx })
        if (analyst) {
          analyst.isActive = isActive
          await analyst.save()
        }
      } else if (userType === 'safety_officer' && user.safetyOfficerId) {
        const officer = await SafetyOfficer.find(user.safetyOfficerId, { client: trx })
        if (officer) {
          officer.isActive = isActive
          await officer.save()
        }
      }
    })

    return response.ok({
      success: true,
      message: isActive ? 'User activated successfully' : 'User deactivated successfully',
    })
  }

  /* ---------------------------------------------------------------------- */
  /* DELETE /api/v1/users/:id                                                 */
  /* ---------------------------------------------------------------------- */
  /**
   * Soft-delete the User AND the matching profile in one transaction.
   */
  async destroy({ params, response }: HttpContext) {
    const id = Number(params.id)
    if (!Number.isInteger(id) || id < 1) {
      return response.badRequest({ message: 'Invalid user id' })
    }

    const user = await User.find(id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    const { DateTime } = await import('luxon')
    const now = DateTime.now()
    const userType = user.userType as UserType

    await db.transaction(async (trx) => {
      user.useTransaction(trx)
      // Mark user inactive (no deleted_at on User model — use isActive flag)
      user.isActive = false
      await user.save()

      // Soft-delete the profile
      if (userType === 'driver' && user.driverId) {
        const driver = await Driver.find(user.driverId, { client: trx })
        if (driver) {
          driver.deletedAt = now
          await driver.save()
        }
      } else if (userType === 'financial_analyst' && user.financialAnalystId) {
        const analyst = await FinancialAnalyst.find(user.financialAnalystId, { client: trx })
        if (analyst) {
          analyst.deletedAt = now
          await analyst.save()
        }
      } else if (userType === 'safety_officer' && user.safetyOfficerId) {
        const officer = await SafetyOfficer.find(user.safetyOfficerId, { client: trx })
        if (officer) {
          officer.deletedAt = now
          await officer.save()
        }
      } else if (userType === 'fleet_manager' && user.fleetManagerId) {
        const manager = await FleetManager.find(user.fleetManagerId, { client: trx })
        if (manager) {
          manager.deletedAt = now
          await manager.save()
        }
      }
    })

    return response.ok({ success: true, message: 'User deleted successfully' })
  }
}