"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Users, TrendingUp, ClipboardCheck, Eye } from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { getDashboardStats, getRecentListings, getListingsActivity } from "./actions";

interface DashboardStats {
  totalListings: number;
  totalUsers: number;
  pendingReviews: number;
  activeListings: number;
}

interface RecentListing {
  id: string;
  car: string;
  seller: string;
  price: number;
  status: string;
  views: number;
  date: string;
  featured: boolean;
}

interface ActivityData {
  date: string;
  total: number;
  active: number;
  pending: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
  const [activity, setActivity] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, listingsData, activityData] = await Promise.all([
          getDashboardStats(),
          getRecentListings(),
          getListingsActivity(),
        ]);
        setStats(statsData);
        setRecentListings(listingsData);
        setActivity(activityData);
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-admin-border bg-surface" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl border border-admin-border bg-surface" />
        <div className="h-96 animate-pulse rounded-xl border border-admin-border bg-surface" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Listings",
      value: stats?.totalListings?.toLocaleString() ?? "0",
      change: "",
      changeType: "neutral" as const,
      icon: Car,
    },
    {
      title: "Active Users",
      value: stats?.totalUsers?.toLocaleString() ?? "0",
      change: "",
      changeType: "neutral" as const,
      icon: Users,
    },
    {
      title: "Active Listings",
      value: stats?.activeListings?.toLocaleString() ?? "0",
      change: "",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "Pending Reviews",
      value: stats?.pendingReviews?.toLocaleString() ?? "0",
      change: "",
      changeType: stats?.pendingReviews && stats.pendingReviews > 0 ? "negative" as const : "neutral" as const,
      icon: ClipboardCheck,
    },
  ];

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Activity chart */}
      <div className="rounded-xl border border-admin-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-admin-text">
          Listings Activity (Last 30 Days)
        </h2>
        {activity.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-lg bg-admin-bg">
            <p className="text-sm text-admin-text-tertiary">
              No listing activity in the last 30 days
            </p>
          </div>
        ) : (
          <div className="flex h-48 items-end gap-1 rounded-lg bg-admin-bg p-4">
            {activity.map((day) => {
              const maxTotal = Math.max(...activity.map(d => d.total), 1);
              const height = Math.max((day.total / maxTotal) * 100, 4);
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1" title={`${day.date}: ${day.total} listings`}>
                  <div
                    className="w-full rounded-t bg-primary/70 transition-all hover:bg-primary"
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent listings table */}
      <div className="rounded-xl border border-admin-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-admin-border px-6 py-4">
          <h2 className="text-base font-semibold text-admin-text">
            Recent Listings
          </h2>
          <Link href="/dashboard/listings" className="text-sm font-medium text-primary hover:text-primary-dark">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-admin-bg/50">
                <th className="px-6 py-3 font-medium text-admin-text-secondary">Car</th>
                <th className="px-6 py-3 font-medium text-admin-text-secondary">Seller</th>
                <th className="px-6 py-3 font-medium text-admin-text-secondary">Price</th>
                <th className="px-6 py-3 font-medium text-admin-text-secondary">Status</th>
                <th className="px-6 py-3 font-medium text-admin-text-secondary">Views</th>
                <th className="px-6 py-3 font-medium text-admin-text-secondary">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {recentListings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-admin-text-tertiary">
                    No listings yet
                  </td>
                </tr>
              ) : (
                recentListings.map((listing) => (
                  <tr key={listing.id} className="transition-colors hover:bg-admin-bg/30">
                    <td className="whitespace-nowrap px-6 py-3.5 font-medium text-admin-text">
                      <Link href={`/dashboard/listings/${listing.id}`} className="hover:text-primary">
                        {listing.car}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-admin-text-secondary">{listing.seller}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 font-medium text-admin-text">{formatPrice(listing.price)}</td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <StatusBadge status={listing.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-admin-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {listing.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-admin-text-secondary">{listing.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
