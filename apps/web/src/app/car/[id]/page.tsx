import Image from "next/image";
import Link from "next/link";
import CarCard from "@/components/CarCard";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  Gauge,
  Fuel,
  Cog,
  Palette,
  Users,
  ShieldCheck,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CarDetail {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  mileage: number;
  city: string;
  fuelType: string;
  transmission: string;
  engineCc: number;
  color: string;
  numOwners: number;
  condition: string;
  description: string;
  negotiable: boolean;
  inspectionStatus: string;
  photos: { url: string; thumbnailUrl: string; isPrimary: boolean }[];
  seller: {
    name: string;
    avatarUrl: string;
    rating: number;
    ratingCount: number;
    memberSince: string;
  };
}

const mockCar: CarDetail = {
  id: "1",
  make: "Maruti Suzuki",
  model: "Swift",
  variant: "ZXi+ 1.2L DualJet",
  year: 2022,
  price: 685000,
  mileage: 32000,
  city: "Srinagar",
  fuelType: "Petrol",
  transmission: "Manual",
  engineCc: 1197,
  color: "Pearl White",
  numOwners: 1,
  condition: "Excellent",
  description:
    "Well-maintained 2022 Maruti Suzuki Swift ZXi+ with full service history from Kashmir Motors, Srinagar. Single owner, accident-free. Comes with extended warranty until 2025. Features include touchscreen infotainment, reverse camera, LED projector headlamps, cruise control, and premium audio system. All four tires recently replaced. Perfect city car in immaculate condition. Driven mostly on Srinagar-Jammu highway.",
  negotiable: true,
  inspectionStatus: "passed",
  photos: [
    {
      url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&h=800&fit=crop",
      thumbnailUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=300&h=200&fit=crop",
      isPrimary: true,
    },
    {
      url: "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=1200&h=800&fit=crop",
      thumbnailUrl: "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=300&h=200&fit=crop",
      isPrimary: false,
    },
    {
      url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&h=800&fit=crop",
      thumbnailUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=300&h=200&fit=crop",
      isPrimary: false,
    },
    {
      url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=800&fit=crop",
      thumbnailUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&h=200&fit=crop",
      isPrimary: false,
    },
  ],
  seller: {
    name: "Faisal Mir",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 4.8,
    ratingCount: 23,
    memberSince: "2023",
  },
};

const similarListings = [
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
    id: "9",
    make: "Maruti Suzuki",
    model: "Baleno",
    year: 2021,
    price: 620000,
    mileage: 38000,
    city: "Anantnag",
    fuelType: "Petrol",
    imageUrl: "https://images.unsplash.com/photo-1610768764270-790fbec18178?w=800&h=600&fit=crop",
  },
];

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

function formatMileage(km: number): string {
  return `${km.toLocaleString("en-US")} km`;
}

async function getCarDetail(id: string): Promise<CarDetail> {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select(`
        id, year, price, mileage, city, color, description, condition,
        num_owners, negotiable, inspection_status,
        car_makes!inner(name),
        car_models!inner(name),
        car_variants(name, engine_cc, fuel_type, transmission),
        listing_photos(url, thumbnail_url, is_primary, position),
        profiles!seller_id(full_name, avatar_url, rating_avg, rating_count, created_at)
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return { ...mockCar, id };
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const d = data as any;
    const photos = (d.listing_photos ?? [])
      .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
      .map((p: any) => ({
        url: p.url,
        thumbnailUrl: p.thumbnail_url ?? p.url,
        isPrimary: p.is_primary,
      }));

    return {
      id: d.id,
      make: d.car_makes?.name ?? "Unknown",
      model: d.car_models?.name ?? "Unknown",
      variant: d.car_variants?.name ?? "",
      year: d.year,
      price: d.price,
      mileage: d.mileage,
      city: d.city ?? "Srinagar",
      fuelType: d.car_variants?.fuel_type ?? "Petrol",
      transmission: d.car_variants?.transmission ?? "Automatic",
      engineCc: d.car_variants?.engine_cc ?? 0,
      color: d.color ?? "Not specified",
      numOwners: d.num_owners ?? 1,
      condition: d.condition ?? "Good",
      description: d.description ?? "",
      negotiable: d.negotiable ?? false,
      inspectionStatus: d.inspection_status ?? "pending",
      photos:
        photos.length > 0
          ? photos
          : [
              {
                url: "https://placehold.co/1200x800/e2e8f0/475569.png?text=No+Image",
                thumbnailUrl: "https://placehold.co/300x200/e2e8f0/475569.png?text=No+Image",
                isPrimary: true,
              },
            ],
      seller: {
        name: d.profiles?.full_name ?? "Seller",
        avatarUrl:
          d.profiles?.avatar_url ??
          "https://placehold.co/100x100/6B3A2A/ffffff?text=S",
        rating: d.profiles?.rating_avg ?? 0,
        ratingCount: d.profiles?.rating_count ?? 0,
        memberSince: d.profiles?.created_at
          ? new Date(d.profiles.created_at).getFullYear().toString()
          : "2024",
      },
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */
  } catch {
    return { ...mockCar, id };
  }
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCarDetail(id);

  const specs = [
    { icon: Calendar, label: "Year", value: car.year.toString() },
    { icon: Gauge, label: "Mileage", value: formatMileage(car.mileage) },
    { icon: Fuel, label: "Fuel Type", value: car.fuelType },
    { icon: Cog, label: "Transmission", value: car.transmission },
    {
      icon: Cog,
      label: "Engine",
      value: car.engineCc ? `${(car.engineCc / 1000).toFixed(1)}L` : "N/A",
    },
    { icon: Palette, label: "Color", value: car.color },
    { icon: Users, label: "Owners", value: car.numOwners.toString() },
    {
      icon: ShieldCheck,
      label: "Inspection",
      value:
        car.inspectionStatus === "passed"
          ? "Passed"
          : car.inspectionStatus === "failed"
            ? "Failed"
            : "Pending",
    },
  ];

  const primaryPhoto =
    car.photos.find((p) => p.isPrimary) ?? car.photos[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <Link
        href="/browse"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Photos & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={primaryPhoto.url}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              {car.photos.length > 1 && (
                <>
                  <button className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              {car.inspectionStatus === "passed" && (
                <span className="absolute top-3 left-3 bg-success text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Inspected
                </span>
              )}
            </div>

            {car.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {car.photos.map((photo, index) => (
                  <div
                    key={index}
                    className={`relative w-24 h-18 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer ${
                      index === 0
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <Image
                      src={photo.thumbnailUrl}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price (mobile) */}
          <div className="lg:hidden">
            <h1 className="text-2xl font-bold text-text">
              {car.year} {car.make} {car.model}
            </h1>
            {car.variant && (
              <p className="text-text-secondary mt-0.5">{car.variant}</p>
            )}
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(car.price)}
              </span>
              {car.negotiable && (
                <span className="text-sm text-text-tertiary">Negotiable</span>
              )}
            </div>
          </div>

          {/* Specs Grid */}
          <div>
            <h2 className="text-lg font-bold text-text mb-4">Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="bg-surface rounded-lg border border-border p-3.5"
                >
                  <spec.icon className="h-5 w-5 text-primary mb-1.5" />
                  <p className="text-xs text-text-tertiary">{spec.label}</p>
                  <p className="text-sm font-semibold text-text mt-0.5">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div>
              <h2 className="text-lg font-bold text-text mb-3">Description</h2>
              <p className="text-text-secondary leading-relaxed">
                {car.description}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="space-y-5">
          {/* Price Card (desktop) */}
          <div className="hidden lg:block bg-surface rounded-xl border border-border p-6 sticky top-24">
            <h1 className="text-xl font-bold text-text">
              {car.year} {car.make} {car.model}
            </h1>
            {car.variant && (
              <p className="text-sm text-text-secondary mt-0.5">
                {car.variant}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
              <MapPin className="h-4 w-4" />
              {car.city}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(car.price)}
                </span>
              </div>
              {car.negotiable && (
                <p className="text-sm text-text-tertiary mt-1">
                  Price is negotiable
                </p>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <button className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                Show Phone Number
              </button>
              <button className="w-full bg-surface text-primary font-semibold py-3 rounded-xl border-2 border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Send Message
              </button>
            </div>

            {/* Seller Info */}
            <div className="mt-6 pt-5 border-t border-border">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                Seller
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/10">
                  <Image
                    src={car.seller.avatarUrl}
                    alt={car.seller.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <p className="font-semibold text-text">{car.seller.name}</p>
                  {car.seller.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                      <span>
                        {car.seller.rating} ({car.seller.ratingCount} reviews)
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-text-tertiary">
                    Member since {car.seller.memberSince}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile CTA (fixed bottom) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-4 py-3 z-40 flex gap-3">
            <button className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              Call
            </button>
            <button className="flex-1 bg-surface text-primary font-semibold py-3 rounded-xl border-2 border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Message
            </button>
          </div>

          {/* Seller Info (mobile) */}
          <div className="lg:hidden bg-surface rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">
              Seller
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/10">
                <Image
                  src={car.seller.avatarUrl}
                  alt={car.seller.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <p className="font-semibold text-text">{car.seller.name}</p>
                {car.seller.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    <span>
                      {car.seller.rating} ({car.seller.ratingCount} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Listings */}
      <section className="mt-16 mb-20 lg:mb-8">
        <h2 className="text-2xl font-bold text-text mb-6">Similar Cars</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {similarListings.map((car) => (
            <CarCard key={car.id} {...car} />
          ))}
        </div>
      </section>
    </div>
  );
}
