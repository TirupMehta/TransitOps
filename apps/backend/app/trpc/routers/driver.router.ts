// app/trpc/routers/driver.router.ts

import { z } from 'zod'
import { router, protectedProcedure } from '#trpc/trpc'
import DriverService from '#services/driver'
import DriversController from '#controllers/drivers_controller'

/**
 * ----------------------------
 * Input Schemas
 * ----------------------------
 */
const createDriverSchema = z.object({
  driverName: z.string().trim().min(2).max(100),
  driverEmail: z.string().trim().email(),
  driverPhone: z.string().trim().min(10).max(15),
  driverLicenseNumber: z.string().trim().min(2).max(50),
  driverLicenseExpiryDate: z.string().trim(),
  driverPassword: z.string().min(6).max(180),
  driverAddress: z.string().trim().min(2).max(255).optional(),
  driverCity: z.string().trim().min(2).max(100).optional(),
  driverState: z.string().trim().min(2).max(100).optional(),
  driverCountry: z.string().trim().min(2).max(100).optional(),
  driverRole: z.string().trim().optional(),
})

const updateDriverSchema = z.object({
  id: z.number().positive(),
  driverName: z.string().trim().min(2).max(100).optional(),
  driverEmail: z.string().trim().email().optional(),
  driverPhone: z.string().trim().min(10).max(15).optional(),
  driverLicenseNumber: z.string().trim().min(2).max(50).optional(),
  driverLicenseExpiryDate: z.string().trim().optional(),
  driverPassword: z.string().min(6).max(180).optional(),
  driverAddress: z.string().trim().min(2).max(255).optional(),
  driverCity: z.string().trim().min(2).max(100).optional(),
  driverState: z.string().trim().min(2).max(100).optional(),
  driverCountry: z.string().trim().min(2).max(100).optional(),
  driverRole: z.string().trim().optional(),
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
const driverBaseOutput = z.object({
  id: z.number(),
  driverName: z.string(),
  driverEmail: z.string(),
})

const driverDetailOutput = z.object({
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
      driverName: z.string(),
      driverEmail: z.string(),
      driverPhone: z.string(),
      driverLicenseNumber: z.string(),
      driverLicenseExpiryDate: z.string(),
      driverCity: z.string().nullable().optional(),
      driverState: z.string().nullable().optional(),
      driverCountry: z.string().nullable().optional(),
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
export const driverRouter = router({
  create: protectedProcedure
    .input(createDriverSchema)
    .output(driverBaseOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(DriverService)
      const controller = new DriversController(service)
      return controller.store(input)
    }),

  list: protectedProcedure
    .input(listSchema)
    .output(listOutput)
    .query(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(DriverService)
      const controller = new DriversController(service)
      return controller.index(input)
    }),

  getById: protectedProcedure
    .input(idSchema)
    .output(driverDetailOutput)
    .query(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(DriverService)
      const controller = new DriversController(service)
      return controller.show(input)
    }),

  update: protectedProcedure
    .input(updateDriverSchema)
    .output(driverBaseOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(DriverService)
      const controller = new DriversController(service)
      return controller.update(input)
    }),

  delete: protectedProcedure
    .input(idSchema)
    .output(deleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(DriverService)
      const controller = new DriversController(service)
      return controller.delete(input)
    }),

  restore: protectedProcedure
    .input(idSchema)
    .output(deleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(DriverService)
      const controller = new DriversController(service)
      return controller.restore(input)
    }),
})
