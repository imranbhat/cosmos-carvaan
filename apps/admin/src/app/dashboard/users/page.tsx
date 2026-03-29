"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Star, MoreHorizontal, Shield } from "lucide-react";
import { getUsers } from "../actions";

interface User {
  id: string;
  avatar: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  listings: number;
  rating: number;
  joined: string;
  city: string;
}

const roleConfig: Record<string, { label: string; bg: string; text: string }> = {
  buyer: { label: "Buyer", bg: "bg-blue-50", text: "text-blue-700" },
  seller: { label: "Seller", bg: "bg-emerald-50", text: "text-emerald-700" },
  both: { label: "Buyer & Seller", bg: "bg-purple-50", text: "text-purple-700" },
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(search || undefined, roleFilter);
      setUsers(data);
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUsers();
    }, search ? 300 : 0); // debounce search input

    return () => clearTimeout(timeout);
  }, [loadUsers, search]);

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
            placeholder="Search by name, email, or phone..."
            className="w-full rounded-lg border border-admin-border bg-surface py-2.5 pl-10 pr-4 text-sm text-admin-text placeholder:text-admin-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-admin-border bg-surface px-3.5 py-2.5 text-sm text-admin-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Roles</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
          <option value="both">Buyer & Seller</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-admin-border bg-surface shadow-sm">
        {loading ? (
          <div className="space-y-0 divide-y divide-admin-border">
            {/* Header skeleton */}
            <div className="h-12 bg-admin-bg/50" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-9 w-9 animate-pulse rounded-full bg-admin-bg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-admin-bg" />
                  <div className="h-3 w-24 animate-pulse rounded bg-admin-bg" />
                </div>
                <div className="h-4 w-20 animate-pulse rounded bg-admin-bg" />
                <div className="h-4 w-16 animate-pulse rounded bg-admin-bg" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-admin-border bg-admin-bg/50">
                    <th className="px-6 py-3 font-medium text-admin-text-secondary">
                      User
                    </th>
                    <th className="px-6 py-3 font-medium text-admin-text-secondary">
                      Contact
                    </th>
                    <th className="px-6 py-3 font-medium text-admin-text-secondary">
                      Role
                    </th>
                    <th className="px-6 py-3 font-medium text-admin-text-secondary">
                      Listings
                    </th>
                    <th className="px-6 py-3 font-medium text-admin-text-secondary">
                      Rating
                    </th>
                    <th className="px-6 py-3 font-medium text-admin-text-secondary">
                      Joined
                    </th>
                    <th className="px-6 py-3 font-medium text-admin-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {users.map((user) => {
                    const role = roleConfig[user.role] ?? { label: user.role, bg: "bg-gray-50", text: "text-gray-700" };
                    return (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-admin-bg/30"
                      >
                        <td className="whitespace-nowrap px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {user.avatar}
                            </div>
                            <div>
                              <p className="font-medium text-admin-text">
                                {user.name}
                              </p>
                              <p className="text-xs text-admin-text-tertiary">
                                {user.city}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-3.5">
                          <p className="text-admin-text-secondary">{user.email}</p>
                          <p className="text-xs text-admin-text-tertiary">
                            {user.phone}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-6 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${role.bg} ${role.text}`}
                          >
                            {role.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-3.5 text-admin-text-secondary">
                          {user.listings}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3.5">
                          {user.rating > 0 ? (
                            <span className="inline-flex items-center gap-1 text-admin-text-secondary">
                              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                              {user.rating.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-admin-text-tertiary">N/A</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3.5 text-admin-text-secondary">
                          {user.joined}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              className="rounded-md p-1.5 text-admin-text-tertiary hover:bg-admin-bg"
                              title="Manage roles"
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                            <button
                              className="rounded-md p-1.5 text-admin-text-tertiary hover:bg-admin-bg"
                              title="More actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="flex h-32 items-center justify-center text-sm text-admin-text-tertiary">
                No users match your filters.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
