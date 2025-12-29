"use client";

import Link from "next/link";
import { Sun, Moon, Menu, X, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import ProfileMenu from "./ProfileMenu";
import ProfileModal from "./ProfileModal";
import Image from "next/image";


export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu
  const [profileOpen, setProfileOpen] = useState(false); // avatar dropdown
  const [showProfileModal, setShowProfileModal] = useState(false); // modal

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* Logo */}
<Link
  href="/"
  className="flex items-center gap-3 md:gap-4 hover:opacity-90 transition"
>
  {/* LOGO */}
  <Image
  src="/logo.png"
  alt="RentFlow logo"
  width={64}
  height={64}
  priority
  className="
    w-12 h-12
    sm:w-14 sm:h-14
    md:w-16 md:h-16
    lg:w-18 lg:h-18
  "
/>


  {/* BRAND NAME */}
  <span
    className="
      font-extrabold tracking-wide
      text-xl
      sm:text-2xl
      md:text-3xl
      lg:text-4xl
      text-indigo-500
      dark:text-indigo-400
      drop-shadow-[0_2px_10px_rgba(99,102,241,0.4)]
    "
  >
    RentFlow
  </span>
</Link>



          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center gap-8 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Link href="/" className="hover:text-indigo-600">Dashboard</Link>
            <Link href="/rents" className="hover:text-indigo-600">Rents</Link>
            <Link href="/tenants" className="hover:text-indigo-600">Tenants</Link>
            <Link href="/about" className="hover:text-indigo-600">About</Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Add Tenant (desktop) */}
            {session && (
              <Link
                href="/tenants/add"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
              >
                <Plus size={16} />
                Add Tenant
              </Link>
            )}

            {/* Profile / Login (desktop) */}
            <div className="hidden md:block relative">
              {!session ? (
                <Link
                  href="/login"
                  className="px-4 py-1.5 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Login
                </Link>
              ) : (
                <>
                  <img
                    src={
                      session.user?.image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        session.user?.name || "U"
                      )}&background=2563eb&color=fff`
                    }
                    alt="avatar"
                    className="w-9 h-9 rounded-full cursor-pointer border"
                    onClick={() => setProfileOpen(!profileOpen)}
                  />

                  {profileOpen && (
                    <ProfileMenu
                      onClose={() => setProfileOpen(false)}
                      onOpenProfile={() => {
                        setProfileOpen(false);
                        setShowProfileModal(true);
                      }}
                    />
                  )}
                </>
              )}
            </div>

            {/* Mobile Add */}
            {session && (
              <Link
                href="/tenants/add"
                className="md:hidden p-2 rounded-md bg-indigo-600 text-white"
              >
                <Plus size={18} />
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden border-t bg-white dark:bg-gray-900">
            <div className="flex flex-col gap-4 px-6 py-6 text-sm font-medium text-gray-700 dark:text-gray-300">

              <Link href="/" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link href="/rents" onClick={() => setOpen(false)}>Rents</Link>
              <Link href="/tenants" onClick={() => setOpen(false)}>Tenants</Link>
              <Link href="/about" onClick={() => setOpen(false)}>About</Link>

              {session && (
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full py-2 bg-gray-700 text-white rounded-lg"
                >
                  Profile
                </button>
              )}

              {!session ? (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="w-full py-2 border rounded-lg text-center"
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="w-full py-2 bg-red-600 text-white rounded-lg"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Profile Modal */}
      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={session?.user}
      />
    </>
  );
}
