import Image from "next/image";
import Link from "next/link";
import { Fuel, Gauge, MapPin } from "lucide-react";

export interface CarCardProps {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  city: string;
  fuelType: string;
  imageUrl: string;
  featured?: boolean;
}

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

function formatMileage(km: number): string {
  if (km >= 1000) {
    return `${(km / 1000).toFixed(0)}k km`;
  }
  return `${km} km`;
}

export default function CarCard({
  id,
  make,
  model,
  year,
  price,
  mileage,
  city,
  fuelType,
  imageUrl,
  featured,
}: CarCardProps) {
  return (
    <Link
      href={`/car/${id}`}
      className="group block bg-surface rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={`${year} ${make} ${model}`}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {featured && (
          <span className="absolute top-3 left-3 bg-accent text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-text text-lg leading-tight">
          {year} {make} {model}
        </h3>

        <p className="mt-1.5 text-xl font-bold text-primary">
          {formatPrice(price)}
        </p>

        <div className="mt-3 flex items-center gap-4 text-sm text-text-secondary">
          <span className="flex items-center gap-1">
            <Gauge className="h-4 w-4" />
            {formatMileage(mileage)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {city}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="h-4 w-4" />
            {fuelType}
          </span>
        </div>
      </div>
    </Link>
  );
}
