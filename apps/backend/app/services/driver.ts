// app/services/driver.ts

import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { TRPCError } from '@trpc/server'
import Driver from '#models/driver'

interface CreateDriverInput {
  driverName: string
  driverEmail: string
  driverPhone: string
  driverLicenseNumber: string
  driverLicenseExpiryDate: string
  driverPassword: string
  driverAddress?: string
  driverCity?: string
  driverState?: string
  driverCountry?: string
  driverRole?: string
}

interface UpdateDriverInput {
  id: number
  driverName?: string
  driverEmail?: string
  driverPhone?: string
  driverLicenseNumber?: string
  driverLicenseExpiryDate?: string
  driverPassword?: string
  driverAddress?: string
  driverCity?: string
  driverState?: string
  driverCountry?: string
  driverRole?: string
}

interface ListDriverInput {
  page: number
  perPage: number
  search?: string
}

@inject()
export default class DriverService {
  /**
   * CREATE
   */
  async create(input: CreateDriverInput) {
    const existing = await Driver.query()
      .where('driver_email', input.driverEmail)
      .whereNull('deleted_at')
      .first()

    if (existing) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A driver with this email already exists',
      })
    }

    const hashedPassword = await hash.make(input.driverPassword)

    const driver = await Driver.create({
      ...input,
      driverPassword: hashedPassword,
      driverRole: input.driverRole ?? 'driver',
    })

    return {
      id: driver.id,
      driverName: driver.driverName,
      driverEmail: driver.driverEmail,
    }
  }

  /**
   * LIST (paginated + search)
   */
  async list(input: ListDriverInput) {
    const { page, perPage, search } = input

    const query = Driver.query().whereNull('deleted_at')

    if (search) {
      query.where((builder) => {
        builder
          .whereILike('driver_name', `%${search}%`)
          .orWhereILike('driver_email', `%${search}%`)
          .orWhereILike('driver_city', `%${search}%`)
          .orWhereILike('driver_license_number', `%${search}%`)
      })
    }

    const result = await query
      .select(
        'id',
        'driverName',
        'driverEmail',
        'driverPhone',
        'driverLicenseNumber',
        'driverLicenseExpiryDate',
        'driverCity',
        'driverState',
        'driverCountry',
        'createdAt'
      )
      .orderBy('createdAt', 'desc')
      .paginate(page, perPage)

    return {
      meta: {
        total: result.total,
        perPage: result.perPage,
        currentPage: result.currentPage,
        lastPage: result.lastPage,
      },
      data: result.all().map((driver) => ({
        id: driver.id,
        driverName: driver.driverName,
        driverEmail: driver.driverEmail,
        driverPhone: driver.driverPhone,
        driverLicenseNumber: driver.driverLicenseNumber,
        driverLicenseExpiryDate: driver.driverLicenseExpiryDate,
        driverCity: driver.driverCity,
        driverState: driver.driverState,
        driverCountry: driver.driverCountry,
        createdAt: driver.createdAt.toISO() as string,
      })),
    }
  }

  /**
   * GET BY ID
   */
  async getById(id: number) {
    const driver = await Driver.query()
      .where('id', id)
      .whereNull('deleted_at')
      .first()

    if (!driver) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Driver not found' })
    }

    return {
      id: driver.id,
      driverName: driver.driverName,
      driverEmail: driver.driverEmail,
      driverPhone: driver.driverPhone,
      driverLicenseNumber: driver.driverLicenseNumber,
      driverLicenseExpiryDate: driver.driverLicenseExpiryDate,
      driverAddress: driver.driverAddress,
      driverCity: driver.driverCity,
      driverState: driver.driverState,
      driverCountry: driver.driverCountry,
      driverRole: driver.driverRole,
      createdAt: driver.createdAt.toISO() as string,
    }
  }

  /**
   * UPDATE
   */
  async update(input: UpdateDriverInput) {
    const { id, ...data } = input

    const driver = await Driver.query()
      .where('id', id)
      .whereNull('deleted_at')
      .first()

    if (!driver) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Driver not found' })
    }

    if (data.driverEmail && data.driverEmail !== driver.driverEmail) {
      const emailTaken = await Driver.query()
        .where('driver_email', data.driverEmail)
        .whereNot('id', id)
        .whereNull('deleted_at')
        .first()

      if (emailTaken) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already in use' })
      }
    }

    if (data.driverPassword) {
      data.driverPassword = await hash.make(data.driverPassword)
    }

    driver.merge(data)
    await driver.save()

    return {
      id: driver.id,
      driverName: driver.driverName,
      driverEmail: driver.driverEmail,
    }
  }

  /**
   * DELETE (soft delete)
   */
  async delete(id: number) {
    const driver = await Driver.query()
      .where('id', id)
      .whereNull('deleted_at')
      .first()

    if (!driver) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Driver not found' })
    }

    driver.deletedAt = DateTime.now()
    await driver.save()

    return { success: true, id: driver.id }
  }

  /**
   * RESTORE (undo soft delete)
   */
  async restore(id: number) {
    const driver = await Driver.query()
      .where('id', id)
      .whereNotNull('deleted_at')
      .first()

    if (!driver) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Driver not found or not deleted' })
    }

    driver.deletedAt = null as any
    await driver.save()

    return { success: true, id: driver.id }
  }
}
