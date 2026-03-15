import {
  Car,
  Users,
  DollarSign,
  ClipboardCheck,
  Eye,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";

const stats = [
  {
    title: "Total Listings",
    value: "1,284",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: Car,
  },
  {
    title: "Active Users",
    value: "8,421",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Revenue (₹)",
    value: "₹24,56,000",
    change: "+18.7%",
    changeType: "positive" as const,
    icon: DollarSign,
  },
  {
    title: "Pending Reviews",
    value: "32",
    change: "-4.1%",
    changeType: "negative" as const,
    icon: ClipboardCheck,
  },
];

const recentListings = [
  {
    id: 1,
    car: "2023 Maruti Suzuki Swift ZXi+",
    seller: "Faisal Mir",
    price: "₹6,85,000",
    status: "active" as const,
    views: 342,
    date: "2026-03-12",
  },
  {
    id: 2,
    car: "2022 Hyundai Creta SX",
    seller: "Suhail Dar",
    price: "₹12,50,000",
    status: "pending_review" as const,
    views: 0,
    date: "2026-03-13",
  },
  {
    id: 3,
    car: "2021 Tata Nexon EV",
    seller: "Irfan Bhat",
    price: "₹9,50,000",
    status: "sold" as const,
    views: 891,
    date: "2026-03-10",
  },
  {
    id: 4,
    car: "2024 Mahindra Scorpio N",
    seller: "Aaliya Shah",
    price: "₹14,50,000",
    status: "active" as const,
    views: 567,
    date: "2026-03-11",
  },
  {
    id: 5,
    car: "2020 Maruti Suzuki Baleno",
    seller: "Tariq Lone",
    price: "₹5,80,000",
    status: "rejected" as const,
    views: 12,
    date: "2026-03-09",
  },
  {
    id: 6,
    car: "2023 Toyota Innova Crysta",
    seller: "Nusrat Wani",
    price: "₹21,50,000",
    status: "active" as const,
    views: 234,
    date: "2026-03-12",
  },
  {
    id: 7,
    car: "2022 Mahindra Thar LX",
    seller: "Mushtaq Rather",
    price: "₹15,50,000",
    status: "pending_review" as const,
    views: 0,
    date: "2026-03-14",
  },
  {
    id: 8,
    car: "2021 Kia Seltos HTX",
    seller: "Mehak Sofi",
    price: "₹11,80,000",
    status: "sold" as const,
    views: 445,
    date: "2026-03-08",
  },
  {
    id: 9,
    car: "2023 Hyundai Venue SX",
    seller: "Showkat Malik",
    price: "₹8,50,000",
    status: "active" as const,
    views: 189,
    date: "2026-03-13",
  },
  {
    id: 10,
    car: "2024 Toyota Fortuner",
    seller: "Rukhsar Ganie",
    price: "₹32,50,000",
    status: "pending_review" as const,
    views: 0,
    date: "2026-03-14",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Activity chart placeholder */}
      <div className="rounded-xl border border-admin-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-admin-text">
          Listings Activity
        </h2>
        <div className="flex h-48 items-center justify-center rounded-lg bg-admin-bg">
          <p className="text-sm text-admin-text-tertiary">
            Chart placeholder &mdash; integrate with a charting library
          </p>
        </div>
      </div>

      {/* Recent listings table */}
      <div className="rounded-xl border border-admin-border bg-surface shadow-sm">
        <div className="border-b border-admin-border px-6 py-4">
          <h2 className="text-base font-semibold text-admin-text">
            Recent Listings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-admin-bg/50">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {recentListings.map((listing) => (
                <tr
                  key={listing.id}
                  className="transition-colors hover:bg-admin-bg/30"
                >
                  <td className="whitespace-nowrap px-6 py-3.5 font-medium text-admin-text">
                    {listing.car}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3.5 text-admin-text-secondary">
                    {listing.seller}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3.5 font-medium text-admin-text">
                    {listing.price}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
