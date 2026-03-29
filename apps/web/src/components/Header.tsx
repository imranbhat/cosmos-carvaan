"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Car, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "User";

  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Carvaan</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/browse"
              className="text-text-secondary hover:text-primary font-medium transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/sell"
              className="text-text-secondary hover:text-primary font-medium transition-colors"
            >
              Sell Your Car
            </Link>
            <Link
              href="/dashboard"
              className="text-text-secondary hover:text-primary font-medium transition-colors"
            >
              Dashboard
            </Link>

            {loading ? (
              <div className="w-20 h-10 rounded-lg bg-border animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                    {avatarInitial}
                  </div>
                  <span className="text-sm font-medium text-text max-w-[120px] truncate">
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-text-tertiary hover:text-error rounded-lg hover:bg-error/5 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-text-secondary hover:text-primary font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden p-2 text-text-secondary hover:text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/browse"
              className="block px-3 py-2 text-text-secondary hover:text-primary font-medium rounded-lg hover:bg-bg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse
            </Link>
            <Link
              href="/sell"
              className="block px-3 py-2 text-text-secondary hover:text-primary font-medium rounded-lg hover:bg-bg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sell Your Car
            </Link>
            <Link
              href="/dashboard"
              className="block px-3 py-2 text-text-secondary hover:text-primary font-medium rounded-lg hover:bg-bg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>

            {loading ? (
              <div className="px-3 py-2">
                <div className="w-full h-10 rounded-lg bg-border animate-pulse" />
              </div>
            ) : user ? (
              <>
                <div className="px-3 py-2 flex items-center gap-2 border-t border-border pt-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                    {avatarInitial}
                  </div>
                  <span className="text-sm font-medium text-text">
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-error hover:bg-error/5 font-medium rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2 border-t border-border pt-4">
                <Link
                  href="/auth/login"
                  className="block px-3 py-2.5 text-center rounded-lg border border-border text-text font-semibold hover:bg-bg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-3 py-2.5 text-center rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
