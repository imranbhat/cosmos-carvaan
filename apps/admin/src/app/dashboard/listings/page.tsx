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
  Download,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import {
  getListings,
  updateListingStatus,
  toggleFeatured,
  bulkUpdateStatus,
  bulkToggleFeatured,
  exportListingsCSV,
} from "./actions";

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    getListings().then((data) => {
      setListings(data as Listing[]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Clear selection when tab or search changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab, search]);

  const handleStatusChange = async (
    id: string,
    status: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setActionLoading(id);
    const result = await updateListingStatus(id, status);
    if (result.success) {
      setListings((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, status: status as ListingStatus } : l
        )
      );
    }
    setActionLoading(null);
  };

  const handleToggleFeatured = async (
    id: string,
    currentFeatured: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setActionLoading(id);
    const result = await toggleFeatured(id, !currentFeatured);
    if (result.success) {
      setListings((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, featured: !currentFeatured } : l
        )
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

  const filteredIds = new Set(filtered.map((l) => l.id));
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((l) => selectedIds.has(l.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((l) => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkApprove = async () => {
    const ids = Array.from(selectedIds).filter((id) => filteredIds.has(id));
    if (ids.length === 0) return;
    setBulkLoading(true);
    const result = await bulkUpdateStatus(ids, "active");
    if (result.success) {
      setListings((prev) =>
        prev.map((l) =>
          ids.includes(l.id) ? { ...l, status: "active" as ListingStatus } : l
        )
      );
      setSelectedIds(new Set());
    }
    setBulkLoading(false);
  };

  const handleBulkReject = async () => {
    const ids = Array.from(selectedIds).filter((id) => filteredIds.has(id));
    if (ids.length === 0) return;
    setBulkLoading(true);
    const result = await bulkUpdateStatus(ids, "rejected");
    if (result.success) {
      setListings((prev) =>
        prev.map((l) =>
          ids.includes(l.id)
            ? { ...l, status: "rejected" as ListingStatus }
            : l
        )
      );
      setSelectedIds(new Set());
    }
    setBulkLoading(false);
  };

  const handleBulkFeature = async () => {
    const ids = Array.from(selectedIds).filter((id) => filteredIds.has(id));
    if (ids.length === 0) return;
    setBulkLoading(true);
    const result = await bulkToggleFeatured(ids, true);
    if (result.success) {
      setListings((prev) =>
        prev.map((l) => (ids.includes(l.id) ? { ...l, featured: true } : l))
      );
    }
    setBulkLoading(false);
  };

  const handleBulkUnfeature = async () => {
    const ids = Array.from(selectedIds).filter((id) => filteredIds.has(id));
    if (ids.length === 0) return;
    setBulkLoading(true);
    const result = await bulkToggleFeatured(ids, false);
    if (result.success) {
      setListings((prev) =>
        prev.map((l) => (ids.includes(l.id) ? { ...l, featured: false } : l))
      );
    }
    setBulkLoading(false);
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    const csv = await exportListingsCSV();
    if (csv) {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carvaan-listings-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
    setExportLoading(false);
  };

  const counts: Record<string, number> = {
    all: listings.length,
    pending_review: listings.filter((l) => l.status === "pending_review")
      .length,
    active: listings.filter((l) => l.status === "active").length,
    sold: listings.filter((l) => l.status === "sold").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
  };

  const selectedCount = Array.from(selectedIds).filter((id) =>
    filteredIds.has(id)
  ).length;

  return (
    <div className="space-y-6">
      {/* Search, filters, and export */}
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
        <button
          onClick={handleExportCSV}
          disabled={exportLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-admin-border bg-surface px-4 py-2.5 text-sm font-medium text-admin-text shadow-sm transition-colors hover:bg-admin-bg disabled:opacity-50"
        >
          {exportLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export CSV
        </button>
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

      {/* Bulk actions bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          {bulkLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
          <span className="text-sm font-medium text-admin-text">
            {selectedCount} selected
          </span>
          <div className="mx-2 h-4 w-px bg-admin-border" />
          <button
            onClick={handleBulkApprove}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 rounded-md bg-success/10 px-3 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approve All
          </button>
          <button
            onClick={handleBulkReject}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 rounded-md bg-error/10 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/20 disabled:opacity-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject All
          </button>
          <button
            onClick={handleBulkFeature}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
          >
            <Star className="h-3.5 w-3.5" />
            Feature All
          </button>
          <button
            onClick={handleBulkUnfeature}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 rounded-md bg-admin-bg px-3 py-1.5 text-xs font-medium text-admin-text-secondary transition-colors hover:bg-admin-border disabled:opacity-50"
          >
            <Star className="h-3.5 w-3.5" />
            Unfeature All
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setSelectedIds(new Set())}
            disabled={bulkLoading}
            className="text-xs font-medium text-admin-text-secondary transition-colors hover:text-admin-text disabled:opacity-50"
          >
            Deselect All
          </button>
        </div>
      )}

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
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-admin-border text-primary focus:ring-primary/20"
                    />
                  </th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">
                    Photo
                  </th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">
                    Car
                  </th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">
                    Seller
                  </th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">
                    Price
                  </th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">
                    Status
                  </th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">
                    Views
                  </th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">
                    Date
                  </th>
                  <th className="px-6 py-3 font-medium text-admin-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {filtered.map((listing) => (
                  <tr
                    key={listing.id}
                    onClick={() =>
                      router.push(`/dashboard/listings/${listing.id}`)
                    }
                    className={`cursor-pointer transition-colors hover:bg-admin-bg/30 ${
                      selectedIds.has(listing.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(listing.id)}
                        onChange={() => toggleSelect(listing.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-admin-border text-primary focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-6 py-3.5">
                      {listing.photo ? (
                        <img
                          src={listing.photo}
                          alt={listing.car}
                          className="h-10 w-14 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded-md bg-admin-bg text-xs text-admin-text-tertiary">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-admin-text">
                          {listing.car}
                        </span>
                        {listing.featured && (
                          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-admin-text-secondary">
                      {listing.seller}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 font-medium text-admin-text">
                      {formatPrice(listing.price)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <StatusBadge status={listing.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-admin-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {listing.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-admin-text-secondary">
                      {listing.date}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <div className="flex items-center gap-1">
                        {actionLoading === listing.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <>
                            {listing.status === "pending_review" && (
                              <>
                                <button
                                  onClick={(e) =>
                                    handleStatusChange(
                                      listing.id,
                                      "active",
                                      e
                                    )
                                  }
                                  className="rounded-md p-1.5 text-success hover:bg-emerald-50"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) =>
                                    handleStatusChange(
                                      listing.id,
                                      "rejected",
                                      e
                                    )
                                  }
                                  className="rounded-md p-1.5 text-error hover:bg-red-50"
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={(e) =>
                                handleToggleFeatured(
                                  listing.id,
                                  listing.featured,
                                  e
                                )
                              }
                              className={`rounded-md p-1.5 hover:bg-amber-50 ${
                                listing.featured
                                  ? "text-accent"
                                  : "text-admin-text-tertiary"
                              }`}
                              title={listing.featured ? "Unfeature" : "Feature"}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  listing.featured ? "fill-accent" : ""
                                }`}
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/dashboard/listings/${listing.id}`
                                );
                              }}
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
            <div className="flex h-32 items-center justify-center text-sm text-admin-text-tertiary">
              No listings match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
