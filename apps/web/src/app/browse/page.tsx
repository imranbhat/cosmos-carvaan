"use client";

import { useEffect, useState, useCallback } from "react";
import CarCard, { type CarCardProps } from "@/components/CarCard";
import { supabase } from "@/lib/supabase";
import { SlidersHorizontal, X } from "lucide-react";

const mockListings: CarCardProps[] = [
  {
    id: "1",
    make: "Maruti Suzuki",
    model: "Swift",
    year: 2022,
    price: 685000,
    mileage: 32000,
    city: "Srinagar",
    fuelType: "Petrol",
    imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop",
    featured: true,
  },
  {
    id: "2",
    make: "Hyundai",
    model: "i20",
    year: 2023,
    price: 780000,
    mileage: 18000,
    city: "Jammu",
    fuelType: "Petrol",
    imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=600&fit=crop",
  },
  {
    id: "3",
    make: "Mahindra",
    model: "Scorpio N",
    year: 2021,
    price: 1450000,
    mileage: 45000,
    city: "Baramulla",
    fuelType: "Diesel",
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
    featured: true,
  },
  {
    id: "4",
    make: "Tata",
    model: "Nexon",
    year: 2022,
    price: 950000,
    mileage: 28000,
    city: "Srinagar",
    fuelType: "Petrol",
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop",
  },
  {
    id: "5",
    make: "Toyota",
    model: "Innova Crysta",
    year: 2023,
    price: 2150000,
    mileage: 12000,
    city: "Anantnag",
    fuelType: "Diesel",
    imageUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop",
    featured: true,
  },
  {
    id: "6",
    make: "Maruti Suzuki",
    model: "Baleno",
    year: 2021,
    price: 620000,
    mileage: 52000,
    city: "Sopore",
    fuelType: "Petrol",
    imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop",
  },
  {
    id: "7",
    make: "Hyundai",
    model: "Creta",
    year: 2023,
    price: 1250000,
    mileage: 15000,
    city: "Srinagar",
    fuelType: "Petrol",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
  },
  {
    id: "8",
    make: "Kia",
    model: "Seltos",
    year: 2022,
    price: 1180000,
    mileage: 22000,
    city: "Pulwama",
    fuelType: "Petrol",
    imageUrl: "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&h=600&fit=crop",
  },
  {
    id: "9",
    make: "Maruti Suzuki",
    model: "Brezza",
    year: 2021,
    price: 875000,
    mileage: 38000,
    city: "Kupwara",
    fuelType: "Petrol",
    imageUrl: "https://images.unsplash.com/photo-1610768764270-790fbec18178?w=800&h=600&fit=crop",
  },
  {
    id: "10",
    make: "Mahindra",
    model: "Thar",
    year: 2022,
    price: 1550000,
    mileage: 30000,
    city: "Jammu",
    fuelType: "Diesel",
    imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
  },
  {
    id: "11",
    make: "Toyota",
    model: "Fortuner",
    year: 2023,
    price: 3250000,
    mileage: 10000,
    city: "Budgam",
    fuelType: "Diesel",
    imageUrl: "https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&h=600&fit=crop",
  },
  {
    id: "12",
    make: "Tata",
    model: "Punch",
    year: 2021,
    price: 650000,
    mileage: 55000,
    city: "Srinagar",
    fuelType: "Petrol",
    imageUrl: "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&h=600&fit=crop",
  },
];

const makes = ["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Toyota", "Kia", "Honda", "Renault", "Nissan", "MG"];
const bodyTypes = ["Sedan", "SUV", "Hatchback", "Truck", "Coupe", "Van", "Convertible", "Wagon"];
const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"];
const transmissions = ["Automatic", "Manual"];

interface Filters {
  make: string;
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
}

const defaultFilters: Filters = {
  make: "",
  priceMin: "",
  priceMax: "",
  yearMin: "",
  yearMax: "",
  bodyType: "",
  fuelType: "",
  transmission: "",
};

export default function BrowsePage() {
  const [listings, setListings] = useState<CarCardProps[]>(mockListings);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("listings")
        .select(`
          id,
          year,
          price,
          mileage,
          city,
          status,
          featured,
          car_makes!inner(name),
          car_models!inner(name, body_type),
          car_variants(fuel_type, transmission),
          listing_photos(url, thumbnail_url, is_primary)
        `)
        .eq("status", "active")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters.make) {
        query = query.eq("car_makes.name", filters.make);
      }
      if (filters.priceMin) {
        query = query.gte("price", parseInt(filters.priceMin));
      }
      if (filters.priceMax) {
        query = query.lte("price", parseInt(filters.priceMax));
      }
      if (filters.yearMin) {
        query = query.gte("year", parseInt(filters.yearMin));
      }
      if (filters.yearMax) {
        query = query.lte("year", parseInt(filters.yearMax));
      }
      if (filters.bodyType) {
        query = query.eq("car_models.body_type", filters.bodyType.toLowerCase());
      }
      if (filters.fuelType) {
        query = query.eq("car_variants.fuel_type", filters.fuelType.toLowerCase());
      }
      if (filters.transmission) {
        query = query.eq("car_variants.transmission", filters.transmission.toLowerCase());
      }

      const { data, error } = await query.limit(24);

      if (error || !data || data.length === 0) {
        // Fall back to mock data, applying client-side filters
        let filtered = [...mockListings];
        if (filters.make) {
          filtered = filtered.filter((c) => c.make === filters.make);
        }
        if (filters.priceMin) {
          filtered = filtered.filter((c) => c.price >= parseInt(filters.priceMin));
        }
        if (filters.priceMax) {
          filtered = filtered.filter((c) => c.price <= parseInt(filters.priceMax));
        }
        if (filters.yearMin) {
          filtered = filtered.filter((c) => c.year >= parseInt(filters.yearMin));
        }
        if (filters.yearMax) {
          filtered = filtered.filter((c) => c.year <= parseInt(filters.yearMax));
        }
        if (filters.fuelType) {
          filtered = filtered.filter((c) => c.fuelType === filters.fuelType);
        }
        setListings(filtered);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: CarCardProps[] = data.map((item: any) => {
          const photos = item.listing_photos ?? [];
          const primary = photos.find((p: any) => p.is_primary) ?? photos[0];
          return {
            id: item.id,
            make: item.car_makes?.name ?? "Unknown",
            model: item.car_models?.name ?? "Unknown",
            year: item.year,
            price: item.price,
            mileage: item.mileage,
            city: item.city ?? "Srinagar",
            fuelType: item.car_variants?.fuel_type ?? "Petrol",
            imageUrl:
              primary?.thumbnail_url ??
              primary?.url ??
              "https://placehold.co/800x600/e2e8f0/475569.png?text=No+Image",
            featured: item.featured,
          };
        });
        setListings(mapped);
      }
    } catch {
      // On any error, use mock data with client-side filters
      let filtered = [...mockListings];
      if (filters.make) {
        filtered = filtered.filter((c) => c.make === filters.make);
      }
      if (filters.fuelType) {
        filtered = filtered.filter((c) => c.fuelType === filters.fuelType);
      }
      setListings(filtered);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Make */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">Make</label>
        <select
          value={filters.make}
          onChange={(e) => updateFilter("make", e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Makes</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">Price Range (₹)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => updateFilter("priceMin", e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => updateFilter("priceMax", e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Year Range */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">Year Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="From"
            value={filters.yearMin}
            onChange={(e) => updateFilter("yearMin", e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="number"
            placeholder="To"
            value={filters.yearMax}
            onChange={(e) => updateFilter("yearMax", e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Body Type */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">Body Type</label>
        <select
          value={filters.bodyType}
          onChange={(e) => updateFilter("bodyType", e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Types</option>
          {bodyTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Fuel Type */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">Fuel Type</label>
        <select
          value={filters.fuelType}
          onChange={(e) => updateFilter("fuelType", e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Fuel Types</option>
          {fuelTypes.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Transmission */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">Transmission</label>
        <select
          value={filters.transmission}
          onChange={(e) => updateFilter("transmission", e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All</option>
          {transmissions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            Browse Cars
          </h1>
          <p className="mt-1 text-text-secondary text-sm">
            {loading ? "Loading..." : `${listings.length} cars found`}
          </p>
        </div>
        <button
          className="lg:hidden flex items-center gap-2 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-text hover:bg-bg transition-colors"
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 bg-surface rounded-xl border border-border p-5">
            {filterPanel}
          </div>
        </aside>

        {/* Mobile Filter Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-surface overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-bold text-text">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 text-text-secondary hover:text-text"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5">{filterPanel}</div>
              <div className="sticky bottom-0 p-4 bg-surface border-t border-border">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Show {listings.length} Results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-surface rounded-xl border border-border overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-secondary text-lg">
                No cars found matching your filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-primary font-semibold hover:text-primary-dark"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((car) => (
                <CarCard key={car.id} {...car} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
