"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Car,
  CheckCircle,
  Clock,
  Eye,
  Heart,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface ListingSummary {
  id: string;
  year: number;
  price: number;
  status: string;
  city: string;
  make_name: string;
  model_name: string;
  image_url: string;
}

interface Stats {
  total: number;
  active: number;
  pending: number;
  sold: number;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-success/10", text: "text-success", label: "Active" },
  pending_review: { bg: "bg-accent/10", text: "text-accent-dark", label: "Pending" },
  sold: { bg: "bg-primary/10", text: "text-primary", label: "Sold" },
  rejected: { bg: "bg-error/10", text: "text-error", label: "Rejected" },
  draft: { bg: "bg-border", text: "text-text-tertiary", label: "Draft" },
};

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function DashboardPage() {
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [savedCars, setSavedCars] = useState<ListingSummary[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, pending: 0, sold: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();
      if (!user) return;

      // Fetch user listings
      const { data: listingsData } = await supabaseBrowser
        .from("listings")
        .select(
          `id, year, price, status, city,
           car_makes!inner(name),
           car_models!inner(name),
           listing_photos(url, thumbnail_url, is_primary)`
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);

      if (listingsData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = listingsData.map((item: any) => {
          const photos = item.listing_photos ?? [];
          const primary = photos.find((p: any) => p.is_primary) ?? photos[0];
          return {
            id: item.id,
            year: item.year,
            price: item.price,
            status: item.status,
            city: item.city ?? "Srinagar",
            make_name: item.car_makes?.name ?? "Unknown",
            model_name: item.car_models?.name ?? "Unknown",
            image_url:
              primary?.thumbnail_url ??
              primary?.url ??
              "https://placehold.co/400x300/e2e8f0/475569.png?text=No+Image",
          };
        });
        setListings(mapped);

        // Compute stats from all listings
        const { count: totalCount } = await supabaseBrowser
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);
        const { count: activeCount } = await supabaseBrowser
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "active");
        const { count: pendingCount } = await supabaseBrowser
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "pending_review");
        const { count: soldCount } = await supabaseBrowser
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "sold");

        setStats({
          total: totalCount ?? 0,
          active: activeCount ?? 0,
          pending: pendingCount ?? 0,
          sold: soldCount ?? 0,
        });
      }

      // Fetch saved cars
      const { data: savedData } = await supabaseBrowser
        .from("saved_listings")
        .select(
          `listing_id,
           listings!inner(
             id, year, price, status, city,
             car_makes!inner(name),
             car_models!inner(name),
             listing_photos(url, thumbnail_url, is_primary)
           )`
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4);

      if (savedData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedSaved = savedData.map((item: any) => {
          const listing = item.listings;
          const photos = listing?.listing_photos ?? [];
          const primary = photos.find((p: any) => p.is_primary) ?? photos[0];
          return {
            id: listing?.id,
            year: listing?.year,
            price: listing?.price,
            status: listing?.status,
            city: listing?.city ?? "Srinagar",
            make_name: listing?.car_makes?.name ?? "Unknown",
            model_name: listing?.car_models?.name ?? "Unknown",
            image_url:
              primary?.thumbnail_url ??
              primary?.url ??
              "https://placehold.co/400x300/e2e8f0/475569.png?text=No+Image",
          };
        });
        setSavedCars(mappedSaved);
      }

      setLoading(false);
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-text-secondary">Manage your listings and saved cars</p>
        </div>
        <Link
          href="/sell"
          className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Sell a Car
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Car} label="Total Listings" value={stats.total} />
        <StatCard icon={CheckCircle} label="Active" value={stats.active} color="text-success" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="text-accent-dark" />
        <StatCard icon={Eye} label="Sold" value={stats.sold} color="text-primary" />
      </div>

      {/* My Listings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text">My Listings</h2>
          <Link
            href="/dashboard/listings"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {listings.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No listings yet"
            description="List your first car and reach thousands of buyers."
            actionLabel="Sell a Car"
            actionHref="/sell"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* Saved Cars */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text">Saved Cars</h2>
          <Link
            href="/dashboard/saved"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {savedCars.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No saved cars"
            description="Browse cars and save your favourites here."
            actionLabel="Browse Cars"
            actionHref="/browse"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {savedCars.map((car) => (
              <ListingCard key={car.id} listing={car} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <Icon className={`h-6 w-6 mb-2 ${color ?? "text-text-tertiary"}`} />
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  );
}

function ListingCard({ listing }: { listing: ListingSummary }) {
  const style = STATUS_STYLES[listing.status] ?? STATUS_STYLES.draft;

  return (
    <Link
      href={`/car/${listing.id}`}
      className="block bg-surface rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        <Image
          src={listing.image_url}
          alt={`${listing.year} ${listing.make_name} ${listing.model_name}`}
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span
          className={`absolute top-2 right-2 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${style.bg} ${style.text}`}
        >
          {style.label}
        </span>
      </div>
      <div className="p-3">
        <p className="font-semibold text-text text-sm truncate">
          {listing.year} {listing.make_name} {listing.model_name}
        </p>
        <p className="text-primary font-bold">{formatPrice(listing.price)}</p>
      </div>
    </Link>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="text-center py-12 bg-surface rounded-xl border border-border">
      <Icon className="h-10 w-10 text-text-tertiary mx-auto mb-3" />
      <p className="font-semibold text-text">{title}</p>
      <p className="text-sm text-text-secondary mt-1 max-w-xs mx-auto">
        {description}
      </p>
      <Link
        href={actionHref}
        className="inline-flex items-center gap-2 mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm text-white font-semibold hover:bg-primary-dark transition-colors"
      >
        <Plus className="h-4 w-4" />
        {actionLabel}
      </Link>
    </div>
  );
}
