import vine from '@vinejs/vine'

export const createDriverValidator = vine.compile(
  vine.object({
    driverName: vine.string().trim().minLength(2).maxLength(100),
    driverEmail: vine.string().trim().email(),
    driverPhone: vine.string().trim().minLength(10).maxLength(15),
    driverPassword: vine.string().minLength(6).maxLength(180),
    driverLicenseNumber: vine.string().trim().minLength(4).maxLength(50),
    driverLicenseExpiryDate: vine.string().trim(),
    driverAddress: vine.string().trim().minLength(2).maxLength(255).optional(),
    driverCity: vine.string().trim().minLength(2).maxLength(100).optional(),
    driverState: vine.string().trim().minLength(2).maxLength(100).optional(),
    driverCountry: vine.string().trim().minLength(2).maxLength(100).optional(),
    driverRole: vine.string().trim().optional(),
  })
)

export const updateDriverValidator = vine.compile(
  vine.object({
    driverName: vine.string().trim().minLength(2).maxLength(100).optional(),
    driverEmail: vine.string().trim().email().optional(),
    driverPhone: vine.string().trim().minLength(10).maxLength(15).optional(),
    driverPassword: vine.string().minLength(6).maxLength(180).optional(),
    driverLicenseNumber: vine.string().trim().minLength(4).maxLength(50).optional(),
    driverLicenseExpiryDate: vine.string().trim().optional(),
    driverAddress: vine.string().trim().minLength(2).maxLength(255).optional(),
    driverCity: vine.string().trim().minLength(2).maxLength(100).optional(),
    driverState: vine.string().trim().minLength(2).maxLength(100).optional(),
    driverCountry: vine.string().trim().minLength(2).maxLength(100).optional(),
    driverRole: vine.string().trim().optional(),
  })
)

export const driverIdParamValidator = vine.compile(
  vine.object({
    id: vine.number().positive(),
  })
)