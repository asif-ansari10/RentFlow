"use client";

import Link from "next/link";
import Image from "next/image";


export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand */}
          {/* Brand */}
<div>
  <div className="flex items-center gap-4 sm:justify-start justify-center">
    {/* Logo */}
    <Image
      src="/logo.png"
      alt="RentFlow logo"
      width={64}
      height={64}
      className="
        w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18
    drop-shadow-[0_0_10px_rgba(99,102,241,0.35)]
      "
    />

    {/* Brand Name */}
    <h2
      className="
        text-2xl
        sm:text-3xl
        md:text-4xl
        font-extrabold
        tracking-wide
        text-indigo-400
      "
    >
      RentFlow
    </h2>
  </div>

  <p className="text-sm sm:text-base text-gray-400 mt-4 leading-relaxed max-w-xs">
    A smart and simple way to manage tenants, rents, and payment reminders.
  </p>
</div>


          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-gray-200 mb-3">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-indigo-400 transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/rents" className="hover:text-indigo-400 transition">
                  Rents
                </Link>
              </li>
              <li>
                <Link href="/tenants" className="hover:text-indigo-400 transition">
                  Tenants
                </Link>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div>
            <h3 className="font-semibold text-gray-200 mb-3">
              Actions
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tenants/add" className="hover:text-indigo-400 transition">
                  Add Tenant
                </Link>
              </li>
              <li>
                <Link href="/rents?status=pending" className="hover:text-indigo-400 transition">
                  Pending Rents
                </Link>
              </li>
              <li>
                <Link href="/rents?status=overdue" className="hover:text-indigo-400 transition">
                  Overdue Rents
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-gray-200 mb-3">
              Info
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-indigo-400 transition">
                  About
                </Link>
              </li>
              <li className="text-gray-400">
                WhatsApp Reminders
              </li>
              <li className="text-gray-400">
                Auto Rent Tracking
              </li>
            </ul>
          </div>

          {/* Developer */}
          <div>
            <h3 className="font-semibold text-gray-200 mb-3">
              Developer
            </h3>
            <p className="text-sm text-gray-400">
              Asif Ansari
            </p>
            <a
              href="mailto:asifnasimansari10@gmail.com"
              className="text-sm text-indigo-400 hover:underline block mt-1"
            >
              asifnasimansari10@gmail.com
            </a>
            <p className="text-xs text-gray-500 mt-2">
              Full Stack Developer
            </p>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-6 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} RentFlow. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
