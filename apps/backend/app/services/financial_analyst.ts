// app/services/financial_analyst.ts

import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { TRPCError } from '@trpc/server'
import FinancialAnalyst from '#models/financial_analist'

interface CreateFinancialAnalystInput {
  financialAnalistName: string
  financialAnalistEmail: string
  financialAnalistPhone: string
  financialAnalistPassword: string
  financialAnalistAddress?: string
  financialAnalistCity?: string
  financialAnalistState?: string
  financialAnalistCountry?: string
  financialAnalistRole?: string
}

interface UpdateFinancialAnalystInput {
  id: number
  financialAnalistName?: string
  financialAnalistEmail?: string
  financialAnalistPhone?: string
  financialAnalistPassword?: string
  financialAnalistAddress?: string
  financialAnalistCity?: string
  financialAnalistState?: string
  financialAnalistCountry?: string
  financialAnalistRole?: string
}

interface ListFinancialAnalystInput {
  page: number
  perPage: number
  search?: string
}

@inject()
export default class FinancialAnalystService {
  /**
   * CREATE
   */
  async create(input: CreateFinancialAnalystInput) {
    const existing = await FinancialAnalyst.query()
      .where('financial_analist_email', input.financialAnalistEmail)
      .whereNull('deleted_at')
      .first()

    if (existing) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A financial analyst with this email already exists',
      })
    }

    const hashedPassword = await hash.make(input.financialAnalistPassword)

    const analyst = await FinancialAnalyst.create({
      ...input,
      financialAnalistPassword: hashedPassword,
      financialAnalistRole: input.financialAnalistRole ?? 'financial_analyst',
    })

    return {
      id: analyst.id,
      financialAnalistName: analyst.financialAnalistName,
      financialAnalistEmail: analyst.financialAnalistEmail,
    }
  }

  /**
   * LIST (paginated + search)
   */
  async list(input: ListFinancialAnalystInput) {
    const { page, perPage, search } = input

    const query = FinancialAnalyst.query().whereNull('deleted_at')

    if (search) {
      query.where((builder) => {
        builder
          .whereILike('financial_analist_name', `%${search}%`)
          .orWhereILike('financial_analist_email', `%${search}%`)
          .orWhereILike('financial_analist_city', `%${search}%`)
      })
    }

    const result = await query
      .select(
        'id',
        'financialAnalistName',
        'financialAnalistEmail',
        'financialAnalistPhone',
        'financialAnalistCity',
        'financialAnalistState',
        'financialAnalistCountry',
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
      data: result.all().map((analyst) => ({
        id: analyst.id,
        financialAnalistName: analyst.financialAnalistName,
        financialAnalistEmail: analyst.financialAnalistEmail,
        financialAnalistPhone: analyst.financialAnalistPhone,
        financialAnalistCity: analyst.financialAnalistCity,
        financialAnalistState: analyst.financialAnalistState,
        financialAnalistCountry: analyst.financialAnalistCountry,
        isActive: analyst.isActive,
        createdAt: analyst.createdAt.toISO() as string,
      })),
    }
  }

  /**
   * GET BY ID
   */
  async getById(id: number) {
    const analyst = await FinancialAnalyst.query()
      .where('id', id)
      .whereNull('deleted_at')
      .first()

    if (!analyst) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Financial analyst not found' })
    }

    return {
      id: analyst.id,
      financialAnalistName: analyst.financialAnalistName,
      financialAnalistEmail: analyst.financialAnalistEmail,
      financialAnalistPhone: analyst.financialAnalistPhone,
      financialAnalistAddress: analyst.financialAnalistAddress,
      financialAnalistCity: analyst.financialAnalistCity,
      financialAnalistState: analyst.financialAnalistState,
      financialAnalistCountry: analyst.financialAnalistCountry,
      financialAnalistRole: analyst.financialAnalistRole,
      isActive: analyst.isActive,
      createdAt: analyst.createdAt.toISO() as string,
    }
  }

  /**
   * UPDATE
   */
  async update(input: UpdateFinancialAnalystInput) {
    const { id, ...data } = input

    const analyst = await FinancialAnalyst.query()
      .where('id', id)
      .whereNull('deleted_at')
      .first()

    if (!analyst) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Financial analyst not found' })
    }

    if (data.financialAnalistEmail && data.financialAnalistEmail !== analyst.financialAnalistEmail) {
      const emailTaken = await FinancialAnalyst.query()
        .where('financial_analist_email', data.financialAnalistEmail)
        .whereNot('id', id)
        .whereNull('deleted_at')
        .first()

      if (emailTaken) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already in use' })
      }
    }

    if (data.financialAnalistPassword) {
      data.financialAnalistPassword = await hash.make(data.financialAnalistPassword)
    }

    analyst.merge(data)
    await analyst.save()

    return {
      id: analyst.id,
      financialAnalistName: analyst.financialAnalistName,
      financialAnalistEmail: analyst.financialAnalistEmail,
    }
  }

  /**
   * DELETE (soft delete)
   */
  async delete(id: number) {
    const analyst = await FinancialAnalyst.query()
      .where('id', id)
      .whereNull('deleted_at')
      .first()

    if (!analyst) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Financial analyst not found' })
    }

    analyst.deletedAt = DateTime.now()
    await analyst.save()

    return { success: true, id: analyst.id }
  }

  /**
   * RESTORE (undo soft delete)
   */
  async restore(id: number) {
    const analyst = await FinancialAnalyst.query()
      .where('id', id)
      .whereNotNull('deleted_at')
      .first()

    if (!analyst) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Financial analyst not found or not deleted',
      })
    }

    analyst.deletedAt = null as any
    await analyst.save()

    return { success: true, id: analyst.id }
  }
}
