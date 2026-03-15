"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Star,
  MapPin,
  Gauge,
  Fuel,
  User,
  Phone,
  Calendar,
  Eye,
  Loader2,
  Settings,
  Palette,
  Users,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { getListing, updateListingStatus, toggleFeatured } from "../actions";

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    if (id) {
      getListing(id).then((data) => {
        setListing(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleStatusChange = async (status: string) => {
    setActionLoading(true);
    const result = await updateListingStatus(id, status);
    if (result.success) {
      setListing((prev: any) => ({ ...prev, status }));
    }
    setActionLoading(false);
  };

  const handleToggleFeatured = async () => {
    setActionLoading(true);
    const result = await toggleFeatured(id, !listing.featured);
    if (result.success) {
      setListing((prev: any) => ({ ...prev, featured: !prev.featured }));
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-admin-text-secondary">Listing not found</p>
        <button onClick={() => router.back()} className="text-sm text-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const photos = (listing.listing_photos ?? []).sort((a: any, b: any) => a.position - b.position);
  const variant = listing.car_variants;
  const seller = listing.profiles;
  const title = `${listing.year} ${listing.car_makes?.name ?? ""} ${listing.car_models?.name ?? ""}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 text-admin-text-secondary hover:bg-admin-bg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-admin-text">{title}</h1>
            <p className="text-sm text-admin-text-tertiary">
              Listed {listing.created_at ? new Date(listing.created_at).toLocaleDateString("en-IN") : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={listing.status} />
          {listing.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
              <Star className="h-3 w-3 fill-accent" /> Featured
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-admin-border bg-surface p-4">
        {actionLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <>
            {listing.status === "pending_review" && (
              <>
                <button
                  onClick={() => handleStatusChange("active")}
                  className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white hover:bg-success/90"
                >
                  <CheckCircle className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => handleStatusChange("rejected")}
                  className="inline-flex items-center gap-2 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white hover:bg-error/90"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </>
            )}
            {listing.status === "active" && (
              <button
                onClick={() => handleStatusChange("sold")}
                className="inline-flex items-center gap-2 rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-text hover:bg-admin-bg"
              >
                Mark as Sold
              </button>
            )}
            {listing.status === "rejected" && (
              <button
                onClick={() => handleStatusChange("active")}
                className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white hover:bg-success/90"
              >
                <CheckCircle className="h-4 w-4" /> Re-approve
              </button>
            )}
            <button
              onClick={handleToggleFeatured}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium ${
                listing.featured
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-admin-border text-admin-text hover:bg-admin-bg"
              }`}
            >
              <Star className={`h-4 w-4 ${listing.featured ? "fill-accent" : ""}`} />
              {listing.featured ? "Unfeature" : "Feature"}
            </button>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Photos */}
        <div className="lg:col-span-2 space-y-3">
          <div className="overflow-hidden rounded-xl border border-admin-border bg-surface">
            {photos.length > 0 ? (
              <img
                src={photos[selectedPhoto]?.url}
                alt={title}
                className="h-80 w-full object-cover"
              />
            ) : (
              <div className="flex h-80 items-center justify-center bg-admin-bg text-admin-text-tertiary">
                No photos
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {photos.map((photo: any, i: number) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(i)}
                  className={`flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === selectedPhoto ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={photo.url} alt={`Photo ${i + 1}`} className="h-16 w-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details sidebar */}
        <div className="space-y-4">
          {/* Price */}
          <div className="rounded-xl border border-admin-border bg-surface p-4">
            <p className="text-sm text-admin-text-tertiary">Price</p>
            <p className="text-2xl font-bold text-primary">{formatPrice(listing.price)}</p>
            {listing.negotiable && (
              <span className="mt-1 inline-block rounded-full bg-admin-bg px-2 py-0.5 text-xs text-admin-text-secondary">
                Negotiable
              </span>
            )}
          </div>

          {/* Specs */}
          <div className="rounded-xl border border-admin-border bg-surface p-4 space-y-3">
            <h3 className="text-sm font-semibold text-admin-text">Specifications</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-admin-text-secondary">
                  <Calendar className="h-4 w-4" /> Year
                </span>
                <span className="font-medium text-admin-text">{listing.year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-admin-text-secondary">
                  <Gauge className="h-4 w-4" /> Mileage
                </span>
                <span className="font-medium text-admin-text">{listing.mileage?.toLocaleString("en-IN")} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-admin-text-secondary">
                  <Settings className="h-4 w-4" /> Condition
                </span>
                <span className="font-medium text-admin-text capitalize">{listing.condition ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-admin-text-secondary">
                  <Palette className="h-4 w-4" /> Color
                </span>
                <span className="font-medium text-admin-text capitalize">{listing.color ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-admin-text-secondary">
                  <Users className="h-4 w-4" /> Owners
                </span>
                <span className="font-medium text-admin-text">{listing.num_owners ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-admin-text-secondary">
                  <MapPin className="h-4 w-4" /> City
                </span>
                <span className="font-medium text-admin-text">{listing.city ?? "—"}</span>
              </div>
              {variant && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-admin-text-secondary">
                      <Fuel className="h-4 w-4" /> Fuel
                    </span>
                    <span className="font-medium text-admin-text capitalize">{variant.fuel_type ?? "—"}</span>
                  </div>
                  {variant.transmission && (
                    <div className="flex items-center justify-between">
                      <span className="text-admin-text-secondary">Transmission</span>
                      <span className="font-medium text-admin-text capitalize">{variant.transmission}</span>
                    </div>
                  )}

                </>
              )}
            </div>
          </div>

          {/* Seller */}
          {seller && (
            <div className="rounded-xl border border-admin-border bg-surface p-4 space-y-3">
              <h3 className="text-sm font-semibold text-admin-text">Seller</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                  {seller.full_name?.[0] ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-medium text-admin-text">{seller.full_name}</p>
                  {seller.phone && (
                    <p className="flex items-center gap-1 text-xs text-admin-text-tertiary">
                      <Phone className="h-3 w-3" /> {seller.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="rounded-xl border border-admin-border bg-surface p-4 space-y-2">
            <h3 className="text-sm font-semibold text-admin-text">Stats</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-admin-text-secondary">
                <Eye className="h-4 w-4" /> Views
              </span>
              <span className="font-medium text-admin-text">{listing.views_count ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {listing.description && (
        <div className="rounded-xl border border-admin-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold text-admin-text">Description</h3>
          <p className="text-sm text-admin-text-secondary whitespace-pre-wrap">{listing.description}</p>
        </div>
      )}
    </div>
  );
}
