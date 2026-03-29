import {
  listingStep1Schema,
  listingStep2Schema,
  listingStep3Schema,
  listingStep4Schema,
  createListingSchema,
} from '../../lib/validators/listing';

// Helper to generate a valid UUID
const uuid = () => '550e8400-e29b-41d4-a716-446655440000';

describe('listingStep1Schema', () => {
  const validStep1 = {
    makeId: uuid(),
    modelId: uuid(),
    year: 2022,
  };

  it('should accept valid step 1 data', () => {
    const result = listingStep1Schema.safeParse(validStep1);
    expect(result.success).toBe(true);
  });

  it('should accept optional variantId', () => {
    const result = listingStep1Schema.safeParse({ ...validStep1, variantId: uuid() });
    expect(result.success).toBe(true);
  });

  it('should reject missing makeId', () => {
    const result = listingStep1Schema.safeParse({ modelId: uuid(), year: 2022 });
    expect(result.success).toBe(false);
  });

  it('should reject missing modelId', () => {
    const result = listingStep1Schema.safeParse({ makeId: uuid(), year: 2022 });
    expect(result.success).toBe(false);
  });

  it('should reject non-UUID makeId', () => {
    const result = listingStep1Schema.safeParse({ ...validStep1, makeId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('should reject year before 1990', () => {
    const result = listingStep1Schema.safeParse({ ...validStep1, year: 1989 });
    expect(result.success).toBe(false);
  });

  it('should reject year too far in the future', () => {
    const result = listingStep1Schema.safeParse({ ...validStep1, year: new Date().getFullYear() + 2 });
    expect(result.success).toBe(false);
  });

  it('should accept current year + 1', () => {
    const result = listingStep1Schema.safeParse({ ...validStep1, year: new Date().getFullYear() + 1 });
    expect(result.success).toBe(true);
  });
});

describe('listingStep2Schema', () => {
  const validStep2 = {
    mileage: 45000,
    condition: 'good' as const,
    color: 'White',
    numOwners: 1,
  };

  it('should accept valid step 2 data', () => {
    const result = listingStep2Schema.safeParse(validStep2);
    expect(result.success).toBe(true);
  });

  it('should accept optional description', () => {
    const result = listingStep2Schema.safeParse({ ...validStep2, description: 'Great car' });
    expect(result.success).toBe(true);
  });

  it('should reject negative mileage', () => {
    const result = listingStep2Schema.safeParse({ ...validStep2, mileage: -100 });
    expect(result.success).toBe(false);
  });

  it('should accept zero mileage', () => {
    const result = listingStep2Schema.safeParse({ ...validStep2, mileage: 0 });
    expect(result.success).toBe(true);
  });

  it('should reject invalid condition', () => {
    const result = listingStep2Schema.safeParse({ ...validStep2, condition: 'broken' });
    expect(result.success).toBe(false);
  });

  it('should accept all valid conditions', () => {
    for (const condition of ['excellent', 'good', 'fair', 'poor']) {
      const result = listingStep2Schema.safeParse({ ...validStep2, condition });
      expect(result.success).toBe(true);
    }
  });

  it('should reject empty color', () => {
    const result = listingStep2Schema.safeParse({ ...validStep2, color: '' });
    expect(result.success).toBe(false);
  });

  it('should reject numOwners less than 1', () => {
    const result = listingStep2Schema.safeParse({ ...validStep2, numOwners: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject numOwners greater than 10', () => {
    const result = listingStep2Schema.safeParse({ ...validStep2, numOwners: 11 });
    expect(result.success).toBe(false);
  });

  it('should reject description over 2000 characters', () => {
    const result = listingStep2Schema.safeParse({
      ...validStep2,
      description: 'a'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe('listingStep3Schema', () => {
  const makePhoto = (position: number) => ({
    uri: `file:///photo${position}.jpg`,
    position,
  });

  it('should accept 6 photos (minimum)', () => {
    const photos = Array.from({ length: 6 }, (_, i) => makePhoto(i));
    const result = listingStep3Schema.safeParse({ photos });
    expect(result.success).toBe(true);
  });

  it('should accept 20 photos (maximum)', () => {
    const photos = Array.from({ length: 20 }, (_, i) => makePhoto(i));
    const result = listingStep3Schema.safeParse({ photos });
    expect(result.success).toBe(true);
  });

  it('should reject fewer than 6 photos', () => {
    const photos = Array.from({ length: 5 }, (_, i) => makePhoto(i));
    const result = listingStep3Schema.safeParse({ photos });
    expect(result.success).toBe(false);
  });

  it('should reject more than 20 photos', () => {
    const photos = Array.from({ length: 21 }, (_, i) => makePhoto(i));
    const result = listingStep3Schema.safeParse({ photos });
    expect(result.success).toBe(false);
  });

  it('should reject empty photos array', () => {
    const result = listingStep3Schema.safeParse({ photos: [] });
    expect(result.success).toBe(false);
  });
});

describe('listingStep4Schema', () => {
  it('should accept valid price and negotiable', () => {
    const result = listingStep4Schema.safeParse({ price: 500000, negotiable: true });
    expect(result.success).toBe(true);
  });

  it('should accept non-negotiable price', () => {
    const result = listingStep4Schema.safeParse({ price: 500000, negotiable: false });
    expect(result.success).toBe(true);
  });

  it('should reject zero price', () => {
    const result = listingStep4Schema.safeParse({ price: 0, negotiable: true });
    expect(result.success).toBe(false);
  });

  it('should reject negative price', () => {
    const result = listingStep4Schema.safeParse({ price: -10000, negotiable: true });
    expect(result.success).toBe(false);
  });

  it('should reject missing negotiable', () => {
    const result = listingStep4Schema.safeParse({ price: 500000 });
    expect(result.success).toBe(false);
  });
});

describe('createListingSchema', () => {
  const validListing = {
    makeId: uuid(),
    modelId: uuid(),
    year: 2022,
    mileage: 45000,
    condition: 'good' as const,
    color: 'White',
    numOwners: 1,
    price: 500000,
    negotiable: true,
    city: 'Srinagar',
    photoKeys: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg', 'photo6.jpg'],
  };

  it('should accept a valid complete listing', () => {
    const result = createListingSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });

  it('should accept with optional description', () => {
    const result = createListingSchema.safeParse({ ...validListing, description: 'Well maintained' });
    expect(result.success).toBe(true);
  });

  it('should reject missing city', () => {
    const { city, ...withoutCity } = validListing;
    const result = createListingSchema.safeParse(withoutCity);
    expect(result.success).toBe(false);
  });

  it('should reject fewer than 6 photo keys', () => {
    const result = createListingSchema.safeParse({ ...validListing, photoKeys: ['a.jpg'] });
    expect(result.success).toBe(false);
  });

  it('should reject more than 20 photo keys', () => {
    const photoKeys = Array.from({ length: 21 }, (_, i) => `photo${i}.jpg`);
    const result = createListingSchema.safeParse({ ...validListing, photoKeys });
    expect(result.success).toBe(false);
  });

  it('should reject empty city string', () => {
    const result = createListingSchema.safeParse({ ...validListing, city: '' });
    expect(result.success).toBe(false);
  });
});
