"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  Loader2,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { getListings, updateListingStatus, toggleFeatured } from "./actions";

type ListingStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "sold"
  | "expired"
  | "rejected";

interface Listing {
  id: string;
  photo: string;
  car: string;
  seller: string;
  price: number;
  status: ListingStatus;
  views: number;
  date: string;
  featured: boolean;
}

const tabs = [
  { key: "all", label: "All" },
  { key: "pending_review", label: "Pending Review" },
  { key: "active", label: "Active" },
  { key: "sold", label: "Sold" },
  { key: "rejected", label: "Rejected" },
] as const;

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function ListingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    getListings().then((data) => {
      setListings(data as Listing[]);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (id: string, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoading(id);
    const result = await updateListingStatus(id, status);
    if (result.success) {
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: status as ListingStatus } : l))
      );
    }
    setActionLoading(null);
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoading(id);
    const result = await toggleFeatured(id, !currentFeatured);
    if (result.success) {
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, featured: !currentFeatured } : l))
      );
    }
    setActionLoading(null);
  };

  const filtered = listings.filter((l) => {
    const matchesTab = activeTab === "all" || l.status === activeTab;
    const matchesSearch =
      search === "" ||
      l.car.toLowerCase().includes(search.toLowerCase()) ||
      l.seller.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts: Record<string, number> = {
    all: listings.length,
    pending_review: listings.filter((l) => l.status === "pending_review").length,
    active: listings.filter((l) => l.status === "active").length,
    sold: listings.filter((l) => l.status === "sold").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings by car or seller..."
            className="w-full rounded-lg border border-admin-border bg-surface py-2.5 pl-10 pr-4 text-sm text-admin-text placeholder:text-admin-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-admin-bg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-surface text-admin-text shadow-sm"
                : "text-admin-text-secondary hover:text-admin-text"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-admin-text-tertiary">
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="rounded-xl border border-admin-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-admin-border bg-admin-bg/50">
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">Photo</th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">Car</th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">Seller</th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">Price</th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">Status</th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">Views</th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">Date</th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {filtered.map((listing) => (
                  <tr
                    key={listing.id}
                    onClick={() => router.push(`/dashboard/listings/${listing.id}`)}
                    className="cursor-pointer transition-colors hover:bg-admin-bg/30"
                  >
                    <td className="px-6 py-3.5">
                      {listing.photo ? (
                        <img src={listing.photo} alt={listing.car} className="h-10 w-14 rounded-md object-cover" />
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded-md bg-admin-bg text-xs text-admin-text-tertiary">No img</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-admin-text">{listing.car}</span>
                        {listing.featured && <Star className="h-3.5 w-3.5 fill-accent text-accent" />}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-admin-text-secondary">{listing.seller}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 font-medium text-admin-text">{formatPrice(listing.price)}</td>
                    <td className="whitespace-nowrap px-6 py-3.5"><StatusBadge status={listing.status} /></td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-admin-text-secondary">
                      <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{listing.views.toLocaleString()}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-admin-text-secondary">{listing.date}</td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <div className="flex items-center gap-1">
                        {actionLoading === listing.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <>
                            {listing.status === "pending_review" && (
                              <>
                                <button
                                  onClick={(e) => handleStatusChange(listing.id, "active", e)}
                                  className="rounded-md p-1.5 text-success hover:bg-emerald-50"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => handleStatusChange(listing.id, "rejected", e)}
                                  className="rounded-md p-1.5 text-error hover:bg-red-50"
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={(e) => handleToggleFeatured(listing.id, listing.featured, e)}
                              className={`rounded-md p-1.5 hover:bg-amber-50 ${listing.featured ? "text-accent" : "text-admin-text-tertiary"}`}
                              title={listing.featured ? "Unfeature" : "Feature"}
                            >
                              <Star className={`h-4 w-4 ${listing.featured ? "fill-accent" : ""}`} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/listings/${listing.id}`); }}
                              className="rounded-md p-1.5 text-admin-text-tertiary hover:bg-admin-bg"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="flex h-32 items-center justify-center text-sm text-admin-text-tertiary">No listings match your filters.</div>
          )}
        </div>
      )}
    </div>
  );
}
