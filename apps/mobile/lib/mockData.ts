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

const CITIES = ['Srinagar', 'Jammu', 'Baramulla', 'Anantnag', 'Sopore', 'Pulwama', 'Kupwara', 'Budgam'];
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
  { make: 'Maruti Suzuki', model: 'Swift', bodyType: 'Hatchback', variant: 'ZXi+ DualJet', fuelType: 'Petrol', transmission: 'Manual', engineCc: 1197, yearRange: [2018, 2024], priceRange: [450000, 850000] },
  { make: 'Hyundai', model: 'Creta', bodyType: 'SUV', variant: 'SX', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 1497, yearRange: [2019, 2024], priceRange: [850000, 1600000] },
  { make: 'Mahindra', model: 'Scorpio N', bodyType: 'SUV', variant: 'Z8L', fuelType: 'Diesel', transmission: 'Automatic', engineCc: 2184, yearRange: [2022, 2024], priceRange: [1200000, 2200000] },
  { make: 'Tata', model: 'Nexon', bodyType: 'SUV', variant: 'XZ+', fuelType: 'Petrol', transmission: 'Manual', engineCc: 1199, yearRange: [2020, 2024], priceRange: [700000, 1300000] },
  { make: 'Toyota', model: 'Innova Crysta', bodyType: 'Van', variant: 'VX', fuelType: 'Diesel', transmission: 'Automatic', engineCc: 2393, yearRange: [2018, 2024], priceRange: [1500000, 2800000] },
  { make: 'Maruti Suzuki', model: 'Baleno', bodyType: 'Hatchback', variant: 'Alpha AMT', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 1197, yearRange: [2019, 2024], priceRange: [500000, 900000] },
  { make: 'Mahindra', model: 'Thar', bodyType: 'SUV', variant: 'LX Hard Top', fuelType: 'Diesel', transmission: 'Manual', engineCc: 2184, yearRange: [2020, 2024], priceRange: [1100000, 1800000] },
  { make: 'Hyundai', model: 'i20', bodyType: 'Hatchback', variant: 'Asta', fuelType: 'Petrol', transmission: 'Manual', engineCc: 1197, yearRange: [2019, 2024], priceRange: [550000, 1100000] },
  { make: 'Kia', model: 'Seltos', bodyType: 'SUV', variant: 'HTX+', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 1497, yearRange: [2020, 2024], priceRange: [900000, 1600000] },
  { make: 'Maruti Suzuki', model: 'Brezza', bodyType: 'SUV', variant: 'ZXi+', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 1462, yearRange: [2019, 2024], priceRange: [700000, 1200000] },
  { make: 'Toyota', model: 'Fortuner', bodyType: 'SUV', variant: '4x4 AT', fuelType: 'Diesel', transmission: 'Automatic', engineCc: 2755, yearRange: [2018, 2024], priceRange: [2500000, 4500000] },
  { make: 'Tata', model: 'Punch', bodyType: 'SUV', variant: 'Creative AMT', fuelType: 'Petrol', transmission: 'Automatic', engineCc: 1199, yearRange: [2021, 2024], priceRange: [550000, 950000] },
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
    price_currency: 'INR',
    negotiable: Math.random() > 0.4,
    city: randomFrom(CITIES),
    featured: index < 4,
    original_price: hasPriceDrop ? Math.round(price * 1.15 / 1000) * 1000 : null,
    condition: randomFrom(CONDITIONS),
    color: randomFrom(COLORS),
    num_owners: 1 + Math.floor(Math.random() * 3),
    description: `${year} ${car.make} ${car.model} ${car.variant} in excellent condition. Well maintained with full service history. Indian specs.`,
    views_count: Math.floor(Math.random() * 500),
    saves_count: Math.floor(Math.random() * 50),
    created_at: daysAgo(Math.floor(Math.random() * 30)),
    make: { id: makeId('make', CARS.indexOf(car)), name: car.make, logo_url: null },
    model: { id: makeId('model', CARS.indexOf(car)), name: car.model, body_type: car.bodyType },
    variant: { id: makeId('var', CARS.indexOf(car)), name: car.variant, fuel_type: car.fuelType, transmission: car.transmission, engine_cc: car.engineCc },
    seller: {
      id: makeId('user', index % 6),
      full_name: ['Faisal M.', 'Aaliya S.', 'Irfan B.', 'Nusrat W.', 'Tariq L.', 'Suhail D.'][index % 6],
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
 * Returns true when there's no Supabase data (empty arrays from queries),
 * or when the DB data still uses old non-INR currency.
 */
export function shouldUseMockData(data: unknown[] | undefined | null): boolean {
  if (!data || data.length === 0) return true;
  // Use mock data if DB records still have old currency
  const first = data[0] as Record<string, unknown> | undefined;
  if (first && 'price_currency' in first && first.price_currency !== 'INR') return true;
  return false;
}
