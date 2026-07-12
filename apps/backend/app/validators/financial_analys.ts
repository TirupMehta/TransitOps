import vine from '@vinejs/vine'

export const createFinancialAnalystValidator = vine.compile(
  vine.object({
    financialAnalistName: vine.string().trim().minLength(2).maxLength(100),
    financialAnalistEmail: vine.string().trim().email(),
    financialAnalistPhone: vine.string().trim().minLength(10).maxLength(15),
    financialAnalistPassword: vine.string().minLength(6).maxLength(180),
    financialAnalistAddress: vine.string().trim().minLength(2).maxLength(255).optional(),
    financialAnalistCity: vine.string().trim().minLength(2).maxLength(100).optional(),
    financialAnalistState: vine.string().trim().minLength(2).maxLength(100).optional(),
    financialAnalistCountry: vine.string().trim().minLength(2).maxLength(100).optional(),
    financialAnalistRole: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
  })
)

export const updateFinancialAnalystValidator = vine.compile(
  vine.object({
    financialAnalistName: vine.string().trim().minLength(2).maxLength(100).optional(),
    financialAnalistEmail: vine.string().trim().email().optional(),
    financialAnalistPhone: vine.string().trim().minLength(10).maxLength(15).optional(),
    financialAnalistPassword: vine.string().minLength(6).maxLength(180).optional(),
    financialAnalistAddress: vine.string().trim().minLength(2).maxLength(255).optional(),
    financialAnalistCity: vine.string().trim().minLength(2).maxLength(100).optional(),
    financialAnalistState: vine.string().trim().minLength(2).maxLength(100).optional(),
    financialAnalistCountry: vine.string().trim().minLength(2).maxLength(100).optional(),
    financialAnalistRole: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
  })
)

export const financialAnalystIdParamValidator = vine.compile(
  vine.object({
    id: vine.number().positive(),
  })
)
