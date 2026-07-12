import { z } from 'zod'

export const createFinancialAnalystSchema = z.object({
  financialAnalistName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  financialAnalistEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  financialAnalistPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(180, 'Password is too long'),
  financialAnalistPhone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long'),
  financialAnalistAddress: z.string().trim().min(2, 'Address must be at least 2 characters').optional().or(z.literal('')),
  financialAnalistCity: z.string().trim().min(2, 'City must be at least 2 characters').optional().or(z.literal('')),
  financialAnalistState: z.string().trim().min(2, 'State must be at least 2 characters').optional().or(z.literal('')),
  financialAnalistCountry: z.string().trim().min(2, 'Country must be at least 2 characters').optional().or(z.literal('')),
})

export type CreateFinancialAnalystInput = z.infer<typeof createFinancialAnalystSchema>
