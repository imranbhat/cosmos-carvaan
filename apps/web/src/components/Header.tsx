"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Car } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              href="#"
              className="text-text-secondary hover:text-primary font-medium transition-colors"
            >
              Sell Your Car
            </Link>
            <Link
              href="#"
              className="text-text-secondary hover:text-primary font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="#"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              Sign In
            </Link>
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
              href="#"
              className="block px-3 py-2 text-text-secondary hover:text-primary font-medium rounded-lg hover:bg-bg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sell Your Car
            </Link>
            <Link
              href="#"
              className="block px-3 py-2 text-text-secondary hover:text-primary font-medium rounded-lg hover:bg-bg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="#"
              className="block px-3 py-2.5 text-center rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
