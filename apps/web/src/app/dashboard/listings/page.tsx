"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Car,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Eye,
  MoreVertical,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface Listing {
  id: string;
  year: number;
  price: number;
  status: string;
  city: string;
  mileage: number;
  views_count: number;
  created_at: string;
  make_name: string;
  model_name: string;
  image_url: string;
}

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending_review", label: "Pending" },
  { key: "sold", label: "Sold" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-success/10", text: "text-success", label: "Active" },
  pending_review: { bg: "bg-accent/10", text: "text-accent-dark", label: "Pending Review" },
  sold: { bg: "bg-primary/10", text: "text-primary", label: "Sold" },
  rejected: { bg: "bg-error/10", text: "text-error", label: "Rejected" },
  draft: { bg: "bg-border", text: "text-text-tertiary", label: "Draft" },
};

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();
    if (!user) return;

    const { data } = await supabaseBrowser
      .from("listings")
      .select(
        `id, year, price, status, city, mileage, views_count, created_at,
         car_makes!inner(name),
         car_models!inner(name),
         listing_photos(url, thumbnail_url, is_primary)`
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setListings(
        data.map((item: any) => {
          const photos = item.listing_photos ?? [];
          const primary = photos.find((p: any) => p.is_primary) ?? photos[0];
          return {
            id: item.id,
            year: item.year,
            price: item.price,
            status: item.status,
            city: item.city ?? "Srinagar",
            mileage: item.mileage,
            views_count: item.views_count ?? 0,
            created_at: item.created_at,
            make_name: item.car_makes?.name ?? "Unknown",
            model_name: item.car_models?.name ?? "Unknown",
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

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setDeleting(id);
    setMenuOpenId(null);

    await supabaseBrowser.from("listing_photos").delete().eq("listing_id", id);
    await supabaseBrowser.from("listings").delete().eq("id", id);

    setListings((prev) => prev.filter((l) => l.id !== id));
    setDeleting(null);
  }

  const filtered =
    activeTab === "all"
      ? listings
      : listings.filter((l) => l.status === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">My Listings</h1>
          <p className="text-text-secondary">
            Manage all your car listings
          </p>
        </div>
        <Link
          href="/sell"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg rounded-xl p-1 overflow-x-auto">
        {TABS.map((tab) => {
          const count =
            tab.key === "all"
              ? listings.length
              : listings.filter((l) => l.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-surface text-primary shadow-sm"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "bg-border text-text-tertiary"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <Car className="h-10 w-10 text-text-tertiary mx-auto mb-3" />
          <p className="font-semibold text-text">No listings found</p>
          <p className="text-sm text-text-secondary mt-1">
            {activeTab === "all"
              ? "You haven't listed any cars yet."
              : `No ${activeTab.replace("_", " ")} listings.`}
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-bg/50">
                  <th className="px-5 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    Listed
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((listing) => {
                  const style =
                    STATUS_STYLES[listing.status] ?? STATUS_STYLES.draft;
                  return (
                    <tr
                      key={listing.id}
                      className={`hover:bg-bg/50 transition-colors ${
                        deleting === listing.id ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <Image
                              src={listing.image_url}
                              alt={`${listing.year} ${listing.make_name}`}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-text text-sm">
                              {listing.year} {listing.make_name}{" "}
                              {listing.model_name}
                            </p>
                            <p className="text-xs text-text-tertiary">
                              {listing.city} &middot;{" "}
                              {listing.mileage.toLocaleString("en-IN")} km
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-text">
                        {formatPrice(listing.price)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full ${style.bg} ${style.text}`}
                        >
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {listing.views_count}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary">
                        {formatDate(listing.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setMenuOpenId(
                                menuOpenId === listing.id ? null : listing.id
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-bg transition-colors"
                          >
                            <MoreVertical className="h-4 w-4 text-text-tertiary" />
                          </button>
                          {menuOpenId === listing.id && (
                            <div className="absolute right-0 top-8 z-10 bg-surface rounded-xl border border-border shadow-lg py-1 w-36">
                              <Link
                                href={`/car/${listing.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text hover:bg-bg transition-colors"
                                onClick={() => setMenuOpenId(null)}
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                              <button
                                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text hover:bg-bg transition-colors w-full"
                                onClick={() => setMenuOpenId(null)}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                className="flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors w-full"
                                onClick={() => handleDelete(listing.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-border">
            {filtered.map((listing) => {
              const style =
                STATUS_STYLES[listing.status] ?? STATUS_STYLES.draft;
              return (
                <div
                  key={listing.id}
                  className={`flex items-center gap-3 p-4 ${
                    deleting === listing.id ? "opacity-50" : ""
                  }`}
                >
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={listing.image_url}
                      alt={`${listing.year} ${listing.make_name}`}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text text-sm truncate">
                      {listing.year} {listing.make_name} {listing.model_name}
                    </p>
                    <p className="text-primary font-semibold text-sm">
                      {formatPrice(listing.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
                      >
                        {style.label}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {formatDate(listing.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link
                      href={`/car/${listing.id}`}
                      className="p-2 rounded-lg hover:bg-bg transition-colors"
                    >
                      <Eye className="h-4 w-4 text-text-tertiary" />
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="p-2 rounded-lg hover:bg-error/5 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-error" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
