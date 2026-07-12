import vine from '@vinejs/vine'

export const createSafetyOfficerValidator = vine.compile(
  vine.object({
    safetyOfficerName: vine.string().trim().minLength(2).maxLength(100),
    safetyOfficerEmail: vine.string().trim().email(),
    safetyOfficerPhone: vine.string().trim().minLength(10).maxLength(15),
    safetyOfficerPassword: vine.string().minLength(6).maxLength(180),
    safetyOfficerAddress: vine.string().trim().minLength(2).maxLength(255).optional(),
    safetyOfficerCity: vine.string().trim().minLength(2).maxLength(100).optional(),
    safetyOfficerState: vine.string().trim().minLength(2).maxLength(100).optional(),
    safetyOfficerCountry: vine.string().trim().minLength(2).maxLength(100).optional(),
    safetyOfficerRole: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
  })
)

export const updateSafetyOfficerValidator = vine.compile(
  vine.object({
    safetyOfficerName: vine.string().trim().minLength(2).maxLength(100).optional(),
    safetyOfficerEmail: vine.string().trim().email().optional(),
    safetyOfficerPhone: vine.string().trim().minLength(10).maxLength(15).optional(),
    safetyOfficerPassword: vine.string().minLength(6).maxLength(180).optional(),
    safetyOfficerAddress: vine.string().trim().minLength(2).maxLength(255).optional(),
    safetyOfficerCity: vine.string().trim().minLength(2).maxLength(100).optional(),
    safetyOfficerState: vine.string().trim().minLength(2).maxLength(100).optional(),
    safetyOfficerCountry: vine.string().trim().minLength(2).maxLength(100).optional(),
    safetyOfficerRole: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
  })
)

export const safetyOfficerIdParamValidator = vine.compile(
  vine.object({
    id: vine.number().positive(),
  })
)