"use client";

import { useState } from "react";
import { Search, Star, MoreHorizontal, Shield } from "lucide-react";

interface User {
  id: number;
  avatar: string;
  name: string;
  email: string;
  phone: string;
  role: "buyer" | "seller" | "both";
  listings: number;
  rating: number;
  joined: string;
  city: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    avatar: "FM",
    name: "Faisal Mir",
    email: "faisal.mir@email.com",
    phone: "+91 94190 12345",
    role: "seller",
    listings: 8,
    rating: 4.8,
    joined: "2025-06-15",
    city: "Srinagar",
  },
  {
    id: 2,
    avatar: "SD",
    name: "Suhail Dar",
    email: "suhail.dar@email.com",
    phone: "+91 70060 23456",
    role: "both",
    listings: 3,
    rating: 4.5,
    joined: "2025-08-22",
    city: "Jammu",
  },
  {
    id: 3,
    avatar: "IB",
    name: "Irfan Bhat",
    email: "irfan.bhat@email.com",
    phone: "+91 96220 34567",
    role: "seller",
    listings: 12,
    rating: 4.9,
    joined: "2025-04-10",
    city: "Baramulla",
  },
  {
    id: 4,
    avatar: "AS",
    name: "Aaliya Shah",
    email: "aaliya.shah@email.com",
    phone: "+91 94690 45678",
    role: "buyer",
    listings: 0,
    rating: 0,
    joined: "2025-11-03",
    city: "Srinagar",
  },
  {
    id: 5,
    avatar: "TL",
    name: "Tariq Lone",
    email: "tariq.lone@email.com",
    phone: "+91 70060 56789",
    role: "both",
    listings: 5,
    rating: 4.2,
    joined: "2025-07-18",
    city: "Anantnag",
  },
  {
    id: 6,
    avatar: "NW",
    name: "Nusrat Wani",
    email: "nusrat.wani@email.com",
    phone: "+91 94190 67890",
    role: "seller",
    listings: 6,
    rating: 4.7,
    joined: "2025-09-05",
    city: "Sopore",
  },
  {
    id: 7,
    avatar: "MR",
    name: "Mushtaq Rather",
    email: "mushtaq.rather@email.com",
    phone: "+91 96220 78901",
    role: "seller",
    listings: 15,
    rating: 4.6,
    joined: "2025-03-21",
    city: "Kupwara",
  },
  {
    id: 8,
    avatar: "MS",
    name: "Mehak Sofi",
    email: "mehak.sofi@email.com",
    phone: "+91 94690 89012",
    role: "buyer",
    listings: 0,
    rating: 0,
    joined: "2026-01-12",
    city: "Jammu",
  },
  {
    id: 9,
    avatar: "SM",
    name: "Showkat Malik",
    email: "showkat.malik@email.com",
    phone: "+91 70060 90123",
    role: "both",
    listings: 4,
    rating: 4.3,
    joined: "2025-10-08",
    city: "Pulwama",
  },
  {
    id: 10,
    avatar: "RG",
    name: "Rukhsar Ganie",
    email: "rukhsar.ganie@email.com",
    phone: "+91 94190 01234",
    role: "seller",
    listings: 9,
    rating: 4.9,
    joined: "2025-05-30",
    city: "Budgam",
  },
];

const roleConfig: Record<string, { label: string; bg: string; text: string }> = {
  buyer: { label: "Buyer", bg: "bg-blue-50", text: "text-blue-700" },
  seller: { label: "Seller", bg: "bg-emerald-50", text: "text-emerald-700" },
  both: { label: "Buyer & Seller", bg: "bg-purple-50", text: "text-purple-700" },
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = mockUsers.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSearch =
      search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    return matchesRole && matchesSearch;
  });

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
              {filtered.map((user) => {
                const role = roleConfig[user.role];
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

        {filtered.length === 0 && (
          <div className="flex h-32 items-center justify-center text-sm text-admin-text-tertiary">
            No users match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
