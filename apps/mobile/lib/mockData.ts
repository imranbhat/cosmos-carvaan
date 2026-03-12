/**
 * Mock data for Carvaan - used when Supabase has no data yet.
 * Uses high-quality Unsplash car images.
 */

const UNSPLASH_CARS = [
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', // BMW M4 white
  'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80', // Mercedes AMG GT red
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80', // Red sports car
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80', // Audi R8 dark
  'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80', // Porsche 911 yellow
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80', // BMW M5 blue
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80', // BMW 3 Series grey
  'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&q=80', // Range Rover white
  'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80', // Toyota Land Cruiser
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80', // Corvette yellow
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80', // Mercedes sedan
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80', // Lambo side
];

const THUMBNAILS = UNSPLASH_CARS.map(url => url.replace('w=800', 'w=400'));

export interface MockListing {
  id: string;
  year: number;
  mileage: number;
  price: number;
  price_currency: string;
  negotiable: boolean;
  city: string;
  featured: boolean;
  original_price: number | null;
  condition: string;
  color: string;
  num_owners: number;
  description: string;
  views_count: number;
  saves_count: number;
  created_at: string;
  make: { id: string; name: string; logo_url: string | null };
  model: { id: string; name: string; body_type: string };
  variant: { id: string; name: string; fuel_type: string; transmission: string; engine_cc: number };
  seller: { id: string; full_name: string; avatar_url: string | null; rating_avg: number; rating_count: number; city: string; created_at: string };
  photos: { id: string; url: string; thumbnail_url: string; position: number; is_primary: boolean }[];
}

const CITIES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'];
const CONDITIONS = ['Excellent', 'Good', 'Fair'];
const COLORS = ['White', 'Black', 'Silver', 'Blue', 'Red', 'Grey'];

function makeId(prefix: string, i: number) {
  return `${prefix}-${String(i).padStart(4, '0')}`;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const CARS: Array<{
  make: string;
  model: string;
  bodyType: string;
  variant: string;
  fuelType: string;
  transmission: string;
  engineCc: number;
  yearRange: [number, number];
  priceRange: [number, number];
}> = [
  { make: 'Toyota', model: 'Land Cruiser', bodyType: 'SUV', variant: 'GXR V8', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 4600, yearRange: [2018, 2024], priceRange: [120000, 280000] },
  { make: 'BMW', model: 'X5', bodyType: 'SUV', variant: 'xDrive40i', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 3000, yearRange: [2019, 2024], priceRange: [150000, 320000] },
  { make: 'Mercedes-Benz', model: 'E-Class', bodyType: 'Sedan', variant: 'E300', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 2000, yearRange: [2020, 2024], priceRange: [140000, 260000] },
  { make: 'Nissan', model: 'Patrol', bodyType: 'SUV', variant: 'Platinum V8', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 5600, yearRange: [2017, 2024], priceRange: [100000, 340000] },
  { make: 'Porsche', model: 'Cayenne', bodyType: 'SUV', variant: 'S', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 2900, yearRange: [2019, 2024], priceRange: [200000, 450000] },
  { make: 'Audi', model: 'Q7', bodyType: 'SUV', variant: '55 TFSI', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 3000, yearRange: [2019, 2024], priceRange: [140000, 280000] },
  { make: 'Range Rover', model: 'Vogue', bodyType: 'SUV', variant: 'SE V6', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 3000, yearRange: [2018, 2024], priceRange: [200000, 550000] },
  { make: 'Lexus', model: 'LX 570', bodyType: 'SUV', variant: 'Sport', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 5700, yearRange: [2018, 2023], priceRange: [170000, 380000] },
  { make: 'Honda', model: 'Accord', bodyType: 'Sedan', variant: '2.0 Sport', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 2000, yearRange: [2019, 2024], priceRange: [55000, 110000] },
  { make: 'Toyota', model: 'Camry', bodyType: 'Sedan', variant: 'SE', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 2500, yearRange: [2019, 2024], priceRange: [50000, 100000] },
  { make: 'Mercedes-Benz', model: 'G-Class', bodyType: 'SUV', variant: 'G63 AMG', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 4000, yearRange: [2019, 2024], priceRange: [450000, 850000] },
  { make: 'BMW', model: '5 Series', bodyType: 'Sedan', variant: '530i M Sport', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 2000, yearRange: [2020, 2024], priceRange: [160000, 280000] },
];

function generateListing(index: number): MockListing {
  const car = CARS[index % CARS.length];
  const year = car.yearRange[0] + Math.floor(Math.random() * (car.yearRange[1] - car.yearRange[0] + 1));
  const price = Math.round(
    (car.priceRange[0] + Math.random() * (car.priceRange[1] - car.priceRange[0])) / 1000
  ) * 1000;
  const mileage = Math.round((1000 + Math.random() * 120000) / 500) * 500;
  const hasPriceDrop = index % 5 === 0;
  const imgIdx = index % UNSPLASH_CARS.length;

  // Create 3-4 photos per listing
  const photoCount = 3 + Math.floor(Math.random() * 2);
  const photos = Array.from({ length: photoCount }, (_, pi) => {
    const photoImgIdx = (imgIdx + pi) % UNSPLASH_CARS.length;
    return {
      id: makeId('photo', index * 10 + pi),
      url: UNSPLASH_CARS[photoImgIdx],
      thumbnail_url: THUMBNAILS[photoImgIdx],
      position: pi,
      is_primary: pi === 0,
    };
  });

  return {
    id: makeId('lst', index),
    year,
    mileage,
    price,
    price_currency: 'AED',
    negotiable: Math.random() > 0.4,
    city: randomFrom(CITIES),
    featured: index < 4,
    original_price: hasPriceDrop ? Math.round(price * 1.15 / 1000) * 1000 : null,
    condition: randomFrom(CONDITIONS),
    color: randomFrom(COLORS),
    num_owners: 1 + Math.floor(Math.random() * 3),
    description: `${year} ${car.make} ${car.model} ${car.variant} in excellent condition. Well maintained with full service history. GCC specs.`,
    views_count: Math.floor(Math.random() * 500),
    saves_count: Math.floor(Math.random() * 50),
    created_at: daysAgo(Math.floor(Math.random() * 30)),
    make: { id: makeId('make', CARS.indexOf(car)), name: car.make, logo_url: null },
    model: { id: makeId('model', CARS.indexOf(car)), name: car.model, body_type: car.bodyType },
    variant: { id: makeId('var', CARS.indexOf(car)), name: car.variant, fuel_type: car.fuelType, transmission: car.transmission, engine_cc: car.engineCc },
    seller: {
      id: makeId('user', index % 6),
      full_name: ['Ahmed K.', 'Sara M.', 'Khalid R.', 'Fatima A.', 'Omar N.', 'Layla H.'][index % 6],
      avatar_url: null,
      rating_avg: 3.5 + Math.random() * 1.5,
      rating_count: 5 + Math.floor(Math.random() * 45),
      city: randomFrom(CITIES),
      created_at: daysAgo(90 + Math.floor(Math.random() * 365)),
    },
    photos,
  };
}

// Pre-generate 12 listings
export const MOCK_LISTINGS: MockListing[] = Array.from({ length: 12 }, (_, i) => generateListing(i));
export const MOCK_FEATURED: MockListing[] = MOCK_LISTINGS.filter(l => l.featured);

/**
 * Check if we should use mock data.
 * Returns true when there's no Supabase data (empty arrays from queries).
 */
export function shouldUseMockData(data: unknown[] | undefined | null): boolean {
  return !data || data.length === 0;
}
