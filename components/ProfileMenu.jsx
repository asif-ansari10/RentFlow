"use client";

import { signOut } from "next-auth/react";

export default function ProfileMenu({
  onOpenProfile,
  onClose,
}) {
  return (
    <div
      className="absolute right-0 mt-2 w-44 rounded-xl border bg-white dark:bg-gray-900 shadow-lg overflow-hidden z-50"
      onMouseLeave={onClose}
    >
      <button
        onClick={() => {
          onClose();
          onOpenProfile();
        }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Profile
      </button>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
      >
        Logout
      </button>
    </div>
  );
}
