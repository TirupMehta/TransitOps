import { z } from 'zod'

export const createFleetManagerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(180, 'Password is too long'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long'),
  address: z.string().trim().min(2, 'Address must be at least 2 characters').optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City must be at least 2 characters').optional().or(z.literal('')),
  state: z.string().trim().min(2, 'State must be at least 2 characters').optional().or(z.literal('')),
  country: z.string().trim().min(2, 'Country must be at least 2 characters').optional().or(z.literal('')),
})

export type CreateFleetManagerInput = z.infer<typeof createFleetManagerSchema>
