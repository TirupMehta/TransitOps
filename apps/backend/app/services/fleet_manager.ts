// app/services/fleetmanager.ts

import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { TRPCError } from '@trpc/server'
import FleetManager from '#models/fleet_manager'

interface CreateFleetManagerInput {
  fullName: string
  email: string
  password: string
  phoneNumber: string
  address?: string
  city?: string
  state?: string
  country?: string
  role?: string
}

interface UpdateFleetManagerInput {
  id: number
  fullName?: string
  email?: string
  password?: string
  phoneNumber?: string
  address?: string
  city?: string
  state?: string
  country?: string
  role?: string
}

interface ListFleetManagerInput {
  page: number
  perPage: number
  search?: string
}

@inject()
export default class FleetManagerService {
  /**
   * CREATE
   */
  async create(input: CreateFleetManagerInput) {
    const existing = await FleetManager.query()
      .where('email', input.email)
      .whereNull('deleted_at')
      .first()

    if (existing) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A fleet manager with this email already exists',
      })
    }

    const hashedPassword = await hash.make(input.password)

    const fleetManager = await FleetManager.create({
      ...input,
      password: hashedPassword,
      role: input.role ?? 'fleet_manager',
    })

    return {
      id: fleetManager.id,
      fullName: fleetManager.fullName,
      email: fleetManager.email,
    }
  }

  /**
   * LIST (paginated + search)
   */
  async list(input: ListFleetManagerInput) {
    const { page, perPage, search } = input

    const query = FleetManager.query().whereNull('deleted_at')

    if (search) {
      query.where((builder) => {
        builder
          .whereILike('fullName', `%${search}%`)
          .orWhereILike('email', `%${search}%`)
          .orWhereILike('city', `%${search}%`)
      })
    }

    const result = await query
      .select('id', 'fullName', 'email', 'phoneNumber', 'city', 'state', 'country', 'createdAt')
      .orderBy('createdAt', 'desc')
      .paginate(page, perPage)

    return {
      meta: {
        total: result.total,
        perPage: result.perPage,
        currentPage: result.currentPage,
        lastPage: result.lastPage,
      },
      data: result.all().map((fleetManager) => ({
        id: fleetManager.id,
        fullName: fleetManager.fullName,
        email: fleetManager.email,
        phoneNumber: fleetManager.phoneNumber,
        city: fleetManager.city,
        state: fleetManager.state,
        country: fleetManager.country,
        createdAt: fleetManager.createdAt.toISO() as string,
      })),
    }
  }

  /**
   * GET BY ID
   */
  async getById(id: number) {
    const fleetManager = await FleetManager.query()
      .where('id', id)
      .whereNull('deleted_at')
      .first()

    if (!fleetManager) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Fleet manager not found' })
    }

    return {
      id: fleetManager.id,
      fullName: fleetManager.fullName,
      email: fleetManager.email,
      phoneNumber: fleetManager.phoneNumber,
      address: fleetManager.address,
      city: fleetManager.city,
      state: fleetManager.state,
      country: fleetManager.country,
      role: fleetManager.role,
      createdAt: fleetManager.createdAt.toISO() as string,
    }
  }

  /**
   * UPDATE
   */
  async update(input: UpdateFleetManagerInput) {
    const { id, ...data } = input

    const fleetManager = await FleetManager.query()
      .where('id', id)
      .whereNull('deleted_at')
      .first()

    if (!fleetManager) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Fleet manager not found' })
    }

    if (data.email && data.email !== fleetManager.email) {
      const emailTaken = await FleetManager.query()
        .where('email', data.email)
        .whereNot('id', id)
        .whereNull('deleted_at')
        .first()

      if (emailTaken) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already in use' })
      }
    }

    if (data.password) {
      data.password = await hash.make(data.password)
    }

    fleetManager.merge(data)
    await fleetManager.save()

    return {
      id: fleetManager.id,
      fullName: fleetManager.fullName,
      email: fleetManager.email,
    }
  }

  /**
   * DELETE (soft delete)
   */
  async delete(id: number) {
    const fleetManager = await FleetManager.query()
      .where('id', id)
      .whereNull('deleted_at')
      .first()

    if (!fleetManager) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Fleet manager not found' })
    }

    fleetManager.deletedAt = DateTime.now()
    await fleetManager.save()

    return { success: true, id: fleetManager.id }
  }

  /**
   * RESTORE (undo soft delete)
   */
  async restore(id: number) {
    const fleetManager = await FleetManager.query()
      .where('id', id)
      .whereNotNull('deleted_at')
      .first()

    if (!fleetManager) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Fleet manager not found or not deleted' })
    }

    fleetManager.deletedAt = null as any
    await fleetManager.save()

    return { success: true, id: fleetManager.id }
  }
}