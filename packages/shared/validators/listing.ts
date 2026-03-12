import { z } from 'zod';

export const listingStep1Schema = z.object({
  makeId: z.string().uuid('Please select a make'),
  modelId: z.string().uuid('Please select a model'),
  variantId: z.string().uuid().optional(),
  year: z.number().min(1990).max(new Date().getFullYear() + 1),
});

export const listingStep2Schema = z.object({
  mileage: z.number().min(0, 'Mileage cannot be negative'),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  color: z.string().min(1, 'Please select a color'),
  numOwners: z.number().min(1).max(10),
  description: z.string().max(2000).optional(),
});

export const listingStep3Schema = z.object({
  photos: z
    .array(z.object({ uri: z.string(), position: z.number() }))
    .min(6, 'Please upload at least 6 photos')
    .max(20),
});

export const listingStep4Schema = z.object({
  price: z.number().positive('Price must be greater than 0'),
  negotiable: z.boolean(),
});

export const createListingSchema = listingStep1Schema
  .merge(listingStep2Schema.omit({ description: true }))
  .merge(listingStep4Schema)
  .extend({
    description: z.string().max(2000).optional(),
    city: z.string().min(1),
    photoKeys: z.array(z.string()).min(6).max(20),
  });

export type ListingStep1 = z.infer<typeof listingStep1Schema>;
export type ListingStep2 = z.infer<typeof listingStep2Schema>;
export type ListingStep3 = z.infer<typeof listingStep3Schema>;
export type ListingStep4 = z.infer<typeof listingStep4Schema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
