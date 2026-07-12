// app/trpc/routers/financial_analyst.router.ts

import { z } from 'zod'
import { router, protectedProcedure } from '#trpc/trpc'
import FinancialAnalystService from '#services/financial_analyst'
import FinancialAnalystsController from '#controllers/financial_analysts_controller'

/**
 * ----------------------------
 * Input Schemas
 * ----------------------------
 */
const createFinancialAnalystSchema = z.object({
  financialAnalistName: z.string().trim().min(2).max(100),
  financialAnalistEmail: z.string().trim().email(),
  financialAnalistPhone: z.string().trim().min(10).max(15),
  financialAnalistPassword: z.string().min(6).max(180),
  financialAnalistAddress: z.string().trim().min(2).max(255).optional(),
  financialAnalistCity: z.string().trim().min(2).max(100).optional(),
  financialAnalistState: z.string().trim().min(2).max(100).optional(),
  financialAnalistCountry: z.string().trim().min(2).max(100).optional(),
  financialAnalistRole: z.string().trim().optional(),
})

const updateFinancialAnalystSchema = z.object({
  id: z.number().positive(),
  financialAnalistName: z.string().trim().min(2).max(100).optional(),
  financialAnalistEmail: z.string().trim().email().optional(),
  financialAnalistPhone: z.string().trim().min(10).max(15).optional(),
  financialAnalistPassword: z.string().min(6).max(180).optional(),
  financialAnalistAddress: z.string().trim().min(2).max(255).optional(),
  financialAnalistCity: z.string().trim().min(2).max(100).optional(),
  financialAnalistState: z.string().trim().min(2).max(100).optional(),
  financialAnalistCountry: z.string().trim().min(2).max(100).optional(),
  financialAnalistRole: z.string().trim().optional(),
})

const idSchema = z.object({
  id: z.number().positive(),
})

const listSchema = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(20),
  search: z.string().trim().optional(),
})

/**
 * ----------------------------
 * Output Schemas
 * ----------------------------
 */
const financialAnalystBaseOutput = z.object({
  id: z.number(),
  financialAnalistName: z.string(),
  financialAnalistEmail: z.string(),
})

const financialAnalystDetailOutput = z.object({
  id: z.number(),
  financialAnalistName: z.string(),
  financialAnalistEmail: z.string(),
  financialAnalistPhone: z.string(),
  financialAnalistAddress: z.string().nullable().optional(),
  financialAnalistCity: z.string().nullable().optional(),
  financialAnalistState: z.string().nullable().optional(),
  financialAnalistCountry: z.string().nullable().optional(),
  financialAnalistRole: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.any(),
})

const listOutput = z.object({
  meta: z.object({
    total: z.number(),
    perPage: z.number(),
    currentPage: z.number(),
    lastPage: z.number(),
  }),
  data: z.array(
    z.object({
      id: z.number(),
      financialAnalistName: z.string(),
      financialAnalistEmail: z.string(),
      financialAnalistPhone: z.string(),
      financialAnalistCity: z.string().nullable().optional(),
      financialAnalistState: z.string().nullable().optional(),
      financialAnalistCountry: z.string().nullable().optional(),
      isActive: z.boolean(),
      createdAt: z.any(),
    })
  ),
})

const deleteOutput = z.object({
  success: z.boolean(),
  id: z.number(),
})

/**
 * ----------------------------
 * Router
 * ----------------------------
 */
export const financialAnalystRouter = router({
  create: protectedProcedure
    .input(createFinancialAnalystSchema)
    .output(financialAnalystBaseOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(FinancialAnalystService)
      const controller = new FinancialAnalystsController(service)
      return controller.store(input)
    }),

  list: protectedProcedure
    .input(listSchema)
    .output(listOutput)
    .query(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(FinancialAnalystService)
      const controller = new FinancialAnalystsController(service)
      return controller.index(input)
    }),

  getById: protectedProcedure
    .input(idSchema)
    .output(financialAnalystDetailOutput)
    .query(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(FinancialAnalystService)
      const controller = new FinancialAnalystsController(service)
      return controller.show(input)
    }),

  update: protectedProcedure
    .input(updateFinancialAnalystSchema)
    .output(financialAnalystBaseOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(FinancialAnalystService)
      const controller = new FinancialAnalystsController(service)
      return controller.update(input)
    }),

  delete: protectedProcedure
    .input(idSchema)
    .output(deleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(FinancialAnalystService)
      const controller = new FinancialAnalystsController(service)
      return controller.delete(input)
    }),

  restore: protectedProcedure
    .input(idSchema)
    .output(deleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(FinancialAnalystService)
      const controller = new FinancialAnalystsController(service)
      return controller.restore(input)
    }),
})
