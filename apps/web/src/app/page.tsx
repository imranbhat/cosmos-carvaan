import Link from "next/link";
import CarCard from "@/components/CarCard";
import { Search, ShieldCheck, Car, ThumbsUp, Users, ClipboardCheck, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

async function getFeaturedListings() {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      year,
      price,
      mileage,
      city,
      featured,
      car_makes!inner(name),
      car_models!inner(name),
      car_variants(fuel_type),
      listing_photos(url, thumbnail_url, is_primary)
    `)
    .eq("status", "active")
    .eq("featured", true)
    .order("views_count", { ascending: false })
    .limit(6);

  if (error || !data || data.length === 0) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((item: any) => {
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
      imageUrl: primary?.thumbnail_url ?? primary?.url ?? "https://placehold.co/800x600/e2e8f0/475569.png?text=No+Image",
      featured: item.featured,
    };
  });
}

const steps = [
  {
    icon: Search,
    title: "Browse",
    description: "Search thousands of verified listings. Filter by make, model, price, and more.",
  },
  {
    icon: ClipboardCheck,
    title: "Inspect",
    description: "Every car undergoes a 130-point inspection. Full history report included.",
  },
  {
    icon: Car,
    title: "Drive",
    description: "Book a test drive, finalize the deal, and drive away with confidence.",
  },
];

const stats = [
  { value: "1,000+", label: "Cars Listed", icon: Car },
  { value: "500+", label: "Happy Buyers", icon: Users },
  { value: "130", label: "Point Inspection", icon: ShieldCheck },
  { value: "4.8", label: "Average Rating", icon: ThumbsUp },
];

export default async function Home() {
  const featuredListings = await getFeaturedListings();

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-primary-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light opacity-90" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Find Your Perfect Car
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
              Kashmir&apos;s most trusted used car marketplace. Every vehicle inspected, every deal transparent.
            </p>

            <div className="mt-8 max-w-2xl mx-auto">
              <Link
                href="/browse"
                className="flex items-center gap-3 bg-white rounded-xl px-6 py-4 shadow-lg hover:shadow-xl transition-shadow"
              >
                <Search className="h-5 w-5 text-text-tertiary" />
                <span className="text-text-tertiary text-left flex-1">
                  Search by make, model, or keyword...
                </span>
                <span className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                  Search
                </span>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {["Maruti Suzuki", "Hyundai", "Mahindra", "Tata", "Toyota"].map((make) => (
                <Link
                  key={make}
                  href={`/browse?make=${make.toLowerCase()}`}
                  className="text-sm text-white/70 hover:text-white border border-white/20 rounded-full px-4 py-1.5 hover:border-white/40 transition-colors"
                >
                  {make}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text">
              Featured Cars
            </h2>
            <p className="mt-1 text-text-secondary">
              Hand-picked vehicles with the best value
            </p>
          </div>
          <Link
            href="/browse"
            className="hidden sm:flex items-center gap-1.5 text-primary font-semibold hover:text-primary-dark transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredListings && featuredListings.map((car) => (
            <CarCard key={car.id} {...car} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-primary font-semibold"
          >
            View All Cars
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text">
              How It Works
            </h2>
            <p className="mt-2 text-text-secondary max-w-xl mx-auto">
              Buying a used car has never been easier. Three simple steps to your next ride.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-sm font-semibold text-primary mb-1">
                  Step {index + 1}
                </div>
                <h3 className="text-xl font-bold text-text mb-2">
                  {step.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center bg-surface rounded-xl border border-border p-6"
            >
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-text">{stat.value}</div>
              <div className="mt-1 text-sm text-text-secondary">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seller CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Ready to Sell Your Car?
              </h2>
              <p className="mt-2 text-white/80 max-w-lg">
                List your car on Carvaan and reach thousands of verified buyers.
                Free listing, no hidden fees.
              </p>
            </div>
            <Link
              href="#"
              className="shrink-0 bg-white text-primary font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              List Your Car - It&apos;s Free
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
