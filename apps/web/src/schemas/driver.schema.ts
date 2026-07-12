import { z } from 'zod'

export const createDriverSchema = z.object({
  driverName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  driverEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  driverPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(180, 'Password is too long'),
  driverPhone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long'),
  driverLicenseNumber: z
    .string()
    .min(2, 'License number must be at least 2 characters')
    .max(50, 'License number is too long'),
  driverLicenseExpiryDate: z
    .string()
    .min(1, 'License expiry date is required'),
  driverAddress: z.string().trim().min(2, 'Address must be at least 2 characters').optional().or(z.literal('')),
  driverCity: z.string().trim().min(2, 'City must be at least 2 characters').optional().or(z.literal('')),
  driverState: z.string().trim().min(2, 'State must be at least 2 characters').optional().or(z.literal('')),
  driverCountry: z.string().trim().min(2, 'Country must be at least 2 characters').optional().or(z.literal('')),
})

export type CreateDriverInput = z.infer<typeof createDriverSchema>
