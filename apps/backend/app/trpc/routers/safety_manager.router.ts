// app/trpc/routers/safety_manager.router.ts

import { z } from 'zod'
import { router, protectedProcedure } from '#trpc/trpc'
import SafetyManagerService from '#services/safety_manager'
import SafetyManagersController from '#controllers/safety_managers_controller'

/**
 * ----------------------------
 * Input Schemas
 * ----------------------------
 */
const createSafetyManagerSchema = z.object({
  safetyOfficerName: z.string().trim().min(2).max(100),
  safetyOfficerEmail: z.string().trim().email(),
  safetyOfficerPhone: z.string().trim().min(10).max(15),
  safetyOfficerPassword: z.string().min(6).max(180),
  safetyOfficerAddress: z.string().trim().min(2).max(255).optional(),
  safetyOfficerCity: z.string().trim().min(2).max(100).optional(),
  safetyOfficerState: z.string().trim().min(2).max(100).optional(),
  safetyOfficerCountry: z.string().trim().min(2).max(100).optional(),
  safetyOfficerRole: z.string().trim().optional(),
})

const updateSafetyManagerSchema = z.object({
  id: z.number().positive(),
  safetyOfficerName: z.string().trim().min(2).max(100).optional(),
  safetyOfficerEmail: z.string().trim().email().optional(),
  safetyOfficerPhone: z.string().trim().min(10).max(15).optional(),
  safetyOfficerPassword: z.string().min(6).max(180).optional(),
  safetyOfficerAddress: z.string().trim().min(2).max(255).optional(),
  safetyOfficerCity: z.string().trim().min(2).max(100).optional(),
  safetyOfficerState: z.string().trim().min(2).max(100).optional(),
  safetyOfficerCountry: z.string().trim().min(2).max(100).optional(),
  safetyOfficerRole: z.string().trim().optional(),
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
const safetyManagerBaseOutput = z.object({
  id: z.number(),
  safetyOfficerName: z.string(),
  safetyOfficerEmail: z.string(),
})

const safetyManagerDetailOutput = z.object({
  id: z.number(),
  safetyOfficerName: z.string(),
  safetyOfficerEmail: z.string(),
  safetyOfficerPhone: z.string(),
  safetyOfficerAddress: z.string().nullable().optional(),
  safetyOfficerCity: z.string().nullable().optional(),
  safetyOfficerState: z.string().nullable().optional(),
  safetyOfficerCountry: z.string().nullable().optional(),
  safetyOfficerRole: z.string().nullable().optional(),
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
      safetyOfficerName: z.string(),
      safetyOfficerEmail: z.string(),
      safetyOfficerPhone: z.string(),
      safetyOfficerCity: z.string().nullable().optional(),
      safetyOfficerState: z.string().nullable().optional(),
      safetyOfficerCountry: z.string().nullable().optional(),
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
export const safetyManagerRouter = router({
  create: protectedProcedure
    .input(createSafetyManagerSchema)
    .output(safetyManagerBaseOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(SafetyManagerService)
      const controller = new SafetyManagersController(service)
      return controller.store(input)
    }),

  list: protectedProcedure
    .input(listSchema)
    .output(listOutput)
    .query(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(SafetyManagerService)
      const controller = new SafetyManagersController(service)
      return controller.index(input)
    }),

  getById: protectedProcedure
    .input(idSchema)
    .output(safetyManagerDetailOutput)
    .query(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(SafetyManagerService)
      const controller = new SafetyManagersController(service)
      return controller.show(input)
    }),

  update: protectedProcedure
    .input(updateSafetyManagerSchema)
    .output(safetyManagerBaseOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(SafetyManagerService)
      const controller = new SafetyManagersController(service)
      return controller.update(input)
    }),

  delete: protectedProcedure
    .input(idSchema)
    .output(deleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(SafetyManagerService)
      const controller = new SafetyManagersController(service)
      return controller.delete(input)
    }),

  restore: protectedProcedure
    .input(idSchema)
    .output(deleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(SafetyManagerService)
      const controller = new SafetyManagersController(service)
      return controller.restore(input)
    }),
})
