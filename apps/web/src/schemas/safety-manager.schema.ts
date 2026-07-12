import { z } from 'zod'

export const createSafetyManagerSchema = z.object({
  safetyOfficerName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  safetyOfficerEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  safetyOfficerPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(180, 'Password is too long'),
  safetyOfficerPhone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long'),
  safetyOfficerAddress: z.string().trim().min(2, 'Address must be at least 2 characters').optional().or(z.literal('')),
  safetyOfficerCity: z.string().trim().min(2, 'City must be at least 2 characters').optional().or(z.literal('')),
  safetyOfficerState: z.string().trim().min(2, 'State must be at least 2 characters').optional().or(z.literal('')),
  safetyOfficerCountry: z.string().trim().min(2, 'Country must be at least 2 characters').optional().or(z.literal('')),
})

export type CreateSafetyManagerInput = z.infer<typeof createSafetyManagerSchema>
