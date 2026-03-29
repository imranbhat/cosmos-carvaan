"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Loader2, Trash2, MapPin } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface SavedCar {
  saved_id: string;
  id: string;
  year: number;
  price: number;
  city: string;
  mileage: number;
  make_name: string;
  model_name: string;
  fuel_type: string;
  image_url: string;
}

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function SavedCarsPage() {
  const [cars, setCars] = useState<SavedCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetchSaved();
  }, []);

  async function fetchSaved() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();
    if (!user) return;

    const { data } = await supabaseBrowser
      .from("saved_listings")
      .select(
        `id,
         listings!inner(
           id, year, price, city, mileage,
           car_makes!inner(name),
           car_models!inner(name),
           car_variants(fuel_type),
           listing_photos(url, thumbnail_url, is_primary)
         )`
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCars(
        data.map((item: any) => {
          const listing = item.listings;
          const photos = listing?.listing_photos ?? [];
          const primary = photos.find((p: any) => p.is_primary) ?? photos[0];
          return {
            saved_id: item.id,
            id: listing?.id,
            year: listing?.year,
            price: listing?.price,
            city: listing?.city ?? "Srinagar",
            mileage: listing?.mileage ?? 0,
            make_name: listing?.car_makes?.name ?? "Unknown",
            model_name: listing?.car_models?.name ?? "Unknown",
            fuel_type: listing?.car_variants?.fuel_type ?? "Petrol",
            image_url:
              primary?.thumbnail_url ??
              primary?.url ??
              "https://placehold.co/400x300/e2e8f0/475569.png?text=No+Image",
          };
        })
      );
    }
    setLoading(false);
  }

  async function handleRemove(savedId: string) {
    setRemoving(savedId);
    await supabaseBrowser.from("saved_listings").delete().eq("id", savedId);
    setCars((prev) => prev.filter((c) => c.saved_id !== savedId));
    setRemoving(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Saved Cars</h1>
        <p className="text-text-secondary">Cars you have saved for later</p>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <Heart className="h-10 w-10 text-text-tertiary mx-auto mb-3" />
          <p className="font-semibold text-text">No saved cars</p>
          <p className="text-sm text-text-secondary mt-1 max-w-xs mx-auto">
            When you find a car you like, save it here to compare later.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm text-white font-semibold hover:bg-primary-dark transition-colors"
          >
            Browse Cars
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cars.map((car) => (
            <div
              key={car.saved_id}
              className={`bg-surface rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow ${
                removing === car.saved_id ? "opacity-50" : ""
              }`}
            >
              <Link href={`/car/${car.id}`}>
                <div className="relative aspect-[4/3] bg-gray-100">
                  <Image
                    src={car.image_url}
                    alt={`${car.year} ${car.make_name} ${car.model_name}`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/car/${car.id}`}>
                  <h3 className="font-semibold text-text hover:text-primary transition-colors">
                    {car.year} {car.make_name} {car.model_name}
                  </h3>
                  <p className="mt-1 text-lg font-bold text-primary">
                    {formatPrice(car.price)}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-sm text-text-secondary">
                    <span>{car.mileage.toLocaleString("en-IN")} km</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {car.city}
                    </span>
                    <span>{car.fuel_type}</span>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(car.saved_id)}
                  disabled={removing === car.saved_id}
                  className="mt-3 flex items-center gap-1.5 text-sm text-error hover:text-error/80 font-medium transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
