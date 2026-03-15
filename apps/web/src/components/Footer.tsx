import Link from "next/link";
import { Car } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-text text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-7 w-7 text-primary-light" />
              <span className="text-xl font-bold text-white">Carvaan</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Kashmir&apos;s trusted used car marketplace. Every car inspected,
              every deal transparent.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Browse By
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/browse?body=sedan" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Sedans
                </Link>
              </li>
              <li>
                <Link href="/browse?body=suv" className="text-sm text-gray-300 hover:text-white transition-colors">
                  SUVs
                </Link>
              </li>
              <li>
                <Link href="/browse?body=hatchback" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Hatchbacks
                </Link>
              </li>
              <li>
                <Link href="/browse?body=truck" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Trucks
                </Link>
              </li>
              <li>
                <Link href="/browse?body=coupe" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Coupes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Follow Us
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Twitter / X
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-700">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Carvaan. All rights reserved. Made in Kashmir.
          </p>
        </div>
      </div>
    </footer>
  );
}
