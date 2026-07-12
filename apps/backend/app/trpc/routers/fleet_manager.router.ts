// app/trpc/routers/fleet_manager.router.ts

import { z } from 'zod'
import { router, protectedProcedure } from '#trpc/trpc'
import FleetManagerService from '#services/fleet_manager'
import FleetManagersController from '#controllers/fleet_managers_controller'

/**
 * ----------------------------
 * Input Schemas
 * ----------------------------
 */
const createFleetManagerSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(6).max(180),
  phoneNumber: z.string().trim().min(10).max(15),
  address: z.string().trim().min(2).max(255).optional(),
  city: z.string().trim().min(2).max(100).optional(),
  state: z.string().trim().min(2).max(100).optional(),
  country: z.string().trim().min(2).max(100).optional(),
  role: z.string().trim().optional(),
})

const updateFleetManagerSchema = z.object({
  id: z.number().positive(),
  fullName: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().optional(),
  password: z.string().min(6).max(180).optional(),
  phoneNumber: z.string().trim().min(10).max(15).optional(),
  address: z.string().trim().min(2).max(255).optional(),
  city: z.string().trim().min(2).max(100).optional(),
  state: z.string().trim().min(2).max(100).optional(),
  country: z.string().trim().min(2).max(100).optional(),
  role: z.string().trim().optional(),
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
const fleetManagerBaseOutput = z.object({
  id: z.number(),
  fullName: z.string(),
  email: z.string(),
})

const fleetManagerDetailOutput = z.object({
  id: z.number(),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  createdAt: z.any(), // Luxon DateTime — keep loose or use z.string() if serialized
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
      fullName: z.string(),
      email: z.string(),
      phoneNumber: z.string(),
      city: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
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
export const fleetManagerRouter = router({
  create: protectedProcedure
    .input(createFleetManagerSchema)
    .output(fleetManagerBaseOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(FleetManagerService)
      const controller = new FleetManagersController(service)
      return controller.store(input)
    }),

  list: protectedProcedure
    .input(listSchema)
    .output(listOutput)
    .query(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(FleetManagerService)
      const controller = new FleetManagersController(service)
      return controller.index(input)
    }),

  getById: protectedProcedure
    .input(idSchema)
    .output(fleetManagerDetailOutput)
    .query(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(FleetManagerService)
      const controller = new FleetManagersController(service)
      return controller.show(input)
    }),

  update: protectedProcedure
    .input(updateFleetManagerSchema)
    .output(fleetManagerBaseOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(FleetManagerService)
      const controller = new FleetManagersController(service)
      return controller.update(input)
    }),

  delete: protectedProcedure
    .input(idSchema)
    .output(deleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(FleetManagerService)
      const controller = new FleetManagersController(service)
      return controller.delete(input)
    }),

  restore: protectedProcedure
    .input(idSchema)
    .output(deleteOutput)
    .mutation(async ({ input, ctx }) => {
      const service = await ctx.containerResolver.make(FleetManagerService)
      const controller = new FleetManagersController(service)
      return controller.restore(input)
    }),
})