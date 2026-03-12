import { supabase } from './supabase';
import type { FilterState, SortOption } from '@/stores/filterStore';
import { config } from '@/constants/config';

const SORT_MAP: Record<SortOption, { column: string; ascending: boolean }> = {
  price_asc: { column: 'price', ascending: true },
  price_desc: { column: 'price', ascending: false },
  newest: { column: 'created_at', ascending: false },
  mileage: { column: 'mileage', ascending: true },
  year: { column: 'year', ascending: false },
};

export interface ListingsParams {
  filters: Partial<FilterState>;
  page?: number;
}

export async function fetchListings({ filters, page = 0 }: ListingsParams) {
  const pageSize = config.pageSize;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('listings')
    .select(`
      id, year, mileage, price, price_currency, negotiable, color, city,
      description, condition, num_owners, inspection_status, status,
      featured, views_count, saves_count, original_price, price_dropped_at,
      created_at,
      seller:profiles!seller_id(id, full_name, avatar_url, rating_avg),
      make:car_makes!make_id(id, name, logo_url),
      model:car_models!model_id(id, name, body_type),
      variant:car_variants!variant_id(id, name, fuel_type, transmission),
      photos:listing_photos(id, url, thumbnail_url, position, is_primary)
    `)
    .eq('status', 'active');

  // Apply filters
  if (filters.makes?.length) {
    query = query.in('make_id', filters.makes);
  }
  if (filters.models?.length) {
    query = query.in('model_id', filters.models);
  }
  if (filters.yearRange) {
    query = query.gte('year', filters.yearRange[0]).lte('year', filters.yearRange[1]);
  }
  if (filters.priceRange) {
    if (filters.priceRange[0] > 0) query = query.gte('price', filters.priceRange[0]);
    if (filters.priceRange[1] < 1_000_000) query = query.lte('price', filters.priceRange[1]);
  }
  if (filters.mileageRange) {
    if (filters.mileageRange[0] > 0) query = query.gte('mileage', filters.mileageRange[0]);
    if (filters.mileageRange[1] < 300_000) query = query.lte('mileage', filters.mileageRange[1]);
  }
  if (filters.city) {
    query = query.eq('city', filters.city);
  }
  if (filters.numOwners) {
    query = query.lte('num_owners', filters.numOwners);
  }
  if (filters.inspectionStatus) {
    query = query.eq('inspection_status', filters.inspectionStatus);
  }
  if (filters.query) {
    query = query.textSearch('search_vector', filters.query, { type: 'websearch' });
  }

  // Sort
  const sort = SORT_MAP[filters.sortBy ?? 'newest'];
  query = query
    .order('featured', { ascending: false })
    .order(sort.column, { ascending: sort.ascending })
    .range(from, to);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchListingById(id: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles!seller_id(id, full_name, avatar_url, rating_avg, rating_count, city, created_at),
      make:car_makes!make_id(id, name, logo_url),
      model:car_models!model_id(id, name, body_type),
      variant:car_variants!variant_id(id, name, engine_cc, fuel_type, transmission),
      photos:listing_photos(id, url, thumbnail_url, position, is_primary)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  // Increment view count (fire and forget)
  supabase.rpc('increment_views', { listing_id: id }).then(() => {});

  return data;
}

export async function fetchSimilarListings(id: string, makeId: string, price: number) {
  const priceMin = Math.floor(price * 0.7);
  const priceMax = Math.ceil(price * 1.3);

  const { data, error } = await supabase
    .from('listings')
    .select(`
      id, year, mileage, price, price_currency, negotiable, city,
      featured, created_at,
      make:car_makes!make_id(id, name),
      model:car_models!model_id(id, name),
      photos:listing_photos(url, thumbnail_url, is_primary)
    `)
    .eq('status', 'active')
    .neq('id', id)
    .or(`make_id.eq.${makeId},and(price.gte.${priceMin},price.lte.${priceMax})`)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}

export async function fetchFeaturedListings() {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id, year, mileage, price, price_currency, negotiable, city,
      featured, original_price, created_at,
      make:car_makes!make_id(id, name),
      model:car_models!model_id(id, name),
      variant:car_variants!variant_id(fuel_type, transmission),
      photos:listing_photos(url, thumbnail_url, is_primary)
    `)
    .eq('status', 'active')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}

export async function fetchMakes() {
  const { data, error } = await supabase
    .from('car_makes')
    .select('id, name, logo_url, is_popular')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchModels(makeId: string) {
  const { data, error } = await supabase
    .from('car_models')
    .select('id, name, body_type, year_start, year_end, is_popular')
    .eq('make_id', makeId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchVariants(modelId: string) {
  const { data, error } = await supabase
    .from('car_variants')
    .select('id, name, engine_cc, fuel_type, transmission')
    .eq('model_id', modelId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function toggleSaveCar(listingId: string, userId: string) {
  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_cars')
    .select('id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('saved_cars')
      .delete()
      .eq('id', existing.id);
    if (error) throw error;
    return false; // unsaved
  } else {
    const { error } = await supabase
      .from('saved_cars')
      .insert({ user_id: userId, listing_id: listingId });
    if (error) throw error;
    return true; // saved
  }
}

export async function fetchSavedCarIds(userId: string) {
  const { data, error } = await supabase
    .from('saved_cars')
    .select('listing_id')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).map((d) => d.listing_id);
}
