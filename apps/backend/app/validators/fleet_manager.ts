import vine from '@vinejs/vine'

/**
 * Validator to create a new Fleet Manager
 */
export const createFleetManagerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100),
    email: vine.string().trim().email(),
    password: vine.string().minLength(6).maxLength(180),
    phoneNumber: vine.string().trim().minLength(10).maxLength(15),
    address: vine.string().trim().minLength(2).maxLength(255).optional(),
    city: vine.string().trim().minLength(2).maxLength(100).optional(),
    state: vine.string().trim().minLength(2).maxLength(100).optional(),
    country: vine.string().trim().minLength(2).maxLength(100).optional(),
    role: vine.string().trim().optional(),
  })
)

/**
 * Validator to update an existing Fleet Manager
 */
export const updateFleetManagerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(100).optional(),
    email: vine.string().trim().email().optional(),
    password: vine.string().minLength(6).maxLength(180).optional(),
    phoneNumber: vine.string().trim().minLength(10).maxLength(15).optional(),
    address: vine.string().trim().minLength(2).maxLength(255).optional(),
    city: vine.string().trim().minLength(2).maxLength(100).optional(),
    state: vine.string().trim().minLength(2).maxLength(100).optional(),
    country: vine.string().trim().minLength(2).maxLength(100).optional(),
    role: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
  })
)

/**
 * Validator for route param: Fleet Manager ID
 */
export const fleetManagerIdParamValidator = vine.compile(
  vine.object({
    id: vine.number().positive(),
  })
)
