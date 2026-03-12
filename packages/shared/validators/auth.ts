import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(8, 'Phone number too short')
  .max(15, 'Phone number too long')
  .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format');

export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits');

export const onboardingSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  city: z.string().min(1, 'Please select a city'),
  role: z.enum(['buyer', 'seller', 'both']),
});

export type PhoneInput = z.infer<typeof phoneSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
