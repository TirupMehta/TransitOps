// app/services/safety_manager.ts

import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { TRPCError } from '@trpc/server'
import SafetyOfficer from '#models/safty_officer'

interface CreateSafetyManagerInput {
  safetyOfficerName: string
  safetyOfficerEmail: string
  safetyOfficerPhone: string
  safetyOfficerPassword: string
  safetyOfficerAddress?: string
  safetyOfficerCity?: string
  safetyOfficerState?: string
  safetyOfficerCountry?: string
  safetyOfficerRole?: string
}

interface UpdateSafetyManagerInput {
  id: number
  safetyOfficerName?: string
  safetyOfficerEmail?: string
  safetyOfficerPhone?: string
  safetyOfficerPassword?: string
  safetyOfficerAddress?: string
  safetyOfficerCity?: string
  safetyOfficerState?: string
  safetyOfficerCountry?: string
  safetyOfficerRole?: string
}

interface ListSafetyManagerInput {
  page: number
  perPage: number
  search?: string
}

@inject()
export default class SafetyManagerService {
  /**
   * CREATE
   */
  async create(input: CreateSafetyManagerInput) {
    const existing = await SafetyOfficer.query()
      .where('safety_officer_email', input.safetyOfficerEmail)
      .whereNull('deleted_at')
      .first()

    if (existing) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A safety officer with this email already exists',
      })
    }

    const hashedPassword = await hash.make(input.safetyOfficerPassword)

    const officer = await SafetyOfficer.create({
      ...input,
      safetyOfficerPassword: hashedPassword,
      safetyOfficerRole: input.safetyOfficerRole ?? 'safety_officer',
    })

    return {
      id: officer.id,
      safetyOfficerName: officer.safetyOfficerName,
      safetyOfficerEmail: officer.safetyOfficerEmail,
    }
  }

  /**
   * LIST (paginated + search)
   */
  async list(input: ListSafetyManagerInput) {
    const { page, perPage, search } = input

    const query = SafetyOfficer.query().whereNull('deleted_at')

    if (search) {
      query.where((builder) => {
        builder
          .whereILike('safety_officer_name', `%${search}%`)
          .orWhereILike('safety_officer_email', `%${search}%`)
          .orWhereILike('safety_officer_city', `%${search}%`)
      })
    }

    const result = await query
      .select(
        'id',
        'safetyOfficerName',
        'safetyOfficerEmail',
        'safetyOfficerPhone',
        'safetyOfficerCity',
        'safetyOfficerState',
        'safetyOfficerCountry',
        'isActive',
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
      data: result.all().map((officer) => ({
        id: officer.id,
        safetyOfficerName: officer.safetyOfficerName,
        safetyOfficerEmail: officer.safetyOfficerEmail,
        safetyOfficerPhone: officer.safetyOfficerPhone,
        safetyOfficerCity: officer.safetyOfficerCity,
        safetyOfficerState: officer.safetyOfficerState,
        safetyOfficerCountry: officer.safetyOfficerCountry,
        isActive: officer.isActive,
        createdAt: officer.createdAt.toISO() as string,
      })),
    }
  }

  /**
   * GET BY ID
   */
  async getById(id: number) {
    const officer = await SafetyOfficer.query()
      .where('id', id)
      .whereNull('deleted_at')
      .first()

    if (!officer) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Safety officer not found' })
    }

    return {
      id: officer.id,
      safetyOfficerName: officer.safetyOfficerName,
      safetyOfficerEmail: officer.safetyOfficerEmail,
      safetyOfficerPhone: officer.safetyOfficerPhone,
      safetyOfficerAddress: officer.safetyOfficerAddress,
      safetyOfficerCity: officer.safetyOfficerCity,
      safetyOfficerState: officer.safetyOfficerState,
      safetyOfficerCountry: officer.safetyOfficerCountry,
      safetyOfficerRole: officer.safetyOfficerRole,
      isActive: officer.isActive,
      createdAt: officer.createdAt.toISO() as string,
    }
  }

  /**
   * UPDATE
   */
  async update(input: UpdateSafetyManagerInput) {
    const { id, ...data } = input

    const officer = await SafetyOfficer.query()
      .where('id', id)
      .whereNull('deleted_at')
      .first()

    if (!officer) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Safety officer not found' })
    }

    if (data.safetyOfficerEmail && data.safetyOfficerEmail !== officer.safetyOfficerEmail) {
      const emailTaken = await SafetyOfficer.query()
        .where('safety_officer_email', data.safetyOfficerEmail)
        .whereNot('id', id)
        .whereNull('deleted_at')
        .first()

      if (emailTaken) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already in use' })
      }
    }

    if (data.safetyOfficerPassword) {
      data.safetyOfficerPassword = await hash.make(data.safetyOfficerPassword)
    }

    officer.merge(data)
    await officer.save()

    return {
      id: officer.id,
      safetyOfficerName: officer.safetyOfficerName,
      safetyOfficerEmail: officer.safetyOfficerEmail,
    }
  }

  /**
   * DELETE (soft delete)
   */
  async delete(id: number) {
    const officer = await SafetyOfficer.query()
      .where('id', id)
      .whereNull('deleted_at')
      .first()

    if (!officer) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Safety officer not found' })
    }

    officer.deletedAt = DateTime.now()
    await officer.save()

    return { success: true, id: officer.id }
  }

  /**
   * RESTORE (undo soft delete)
   */
  async restore(id: number) {
    const officer = await SafetyOfficer.query()
      .where('id', id)
      .whereNotNull('deleted_at')
      .first()

    if (!officer) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Safety officer not found or not deleted' })
    }

    officer.deletedAt = null as any
    await officer.save()

    return { success: true, id: officer.id }
  }
}
