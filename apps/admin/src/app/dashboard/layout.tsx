"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Car,
  Users,
  MessageSquare,
  Settings,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/listings", label: "Listings", icon: Car },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function getPageTitle(pathname: string): string {
  const item = navItems.find((n) =>
    pathname === "/dashboard" ? n.href === "/dashboard" : pathname.startsWith(n.href) && n.href !== "/dashboard"
  );
  return item?.label ?? "Dashboard";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminInitials, setAdminInitials] = useState("A");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAdminEmail(user.email ?? "");
        const meta = user.user_metadata;
        const name = meta?.full_name ?? meta?.name ?? user.email ?? "";
        const initials = name.includes("@")
          ? name[0].toUpperCase()
          : name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
        setAdminInitials(initials || "A");
      }
    });
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href) && href !== "/dashboard";

  const sidebar = (
    <div className="flex h-full flex-col bg-surface border-r border-admin-border">
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-admin-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Car className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-admin-text">Carvaan</span>
        <span className="text-xs font-medium text-admin-text-tertiary">Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-admin-text-secondary hover:bg-admin-bg hover:text-admin-text"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-admin-border p-4">
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex w-full items-center gap-3 rounded-lg p-1 hover:bg-admin-bg transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
              {adminInitials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="truncate text-sm font-medium text-admin-text">{adminEmail || "Admin"}</p>
              <p className="truncate text-xs text-admin-text-tertiary">Administrator</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-admin-text-tertiary transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-admin-border bg-surface shadow-lg">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-error hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-admin-bg">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-shrink-0 lg:block">{sidebar}</aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 h-full w-60">{sidebar}</aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-admin-border bg-surface px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-admin-text-secondary hover:bg-admin-bg lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-admin-text">
              {getPageTitle(pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button aria-label="Notifications" className="relative rounded-lg p-2 text-admin-text-secondary hover:bg-admin-bg">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
            </button>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              title="Sign out"
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {adminInitials}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
