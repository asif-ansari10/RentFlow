"use client";

import { X, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function ProfileModal({ open, onClose }) {
  const { data: session, update } = useSession();
  const user = session?.user;

  const isPasswordSet = user?.provider === "credentials";


  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (password) => {
  if (!password) return { label: "", color: "" };

  if (password.length < 6)
    return { label: "Weak", color: "bg-red-500" };

  if (password.length < 10)
    return { label: "Medium", color: "bg-yellow-500" };

  return { label: "Strong", color: "bg-green-500" };
};


  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  if (!open) return null;



  /* ---------- CHANGE NAME ---------- */
  const handleChangeName = async () => {
    if (!name.trim()) return toast.error("Name cannot be empty");

    try {
      setLoading(true);

      const res = await fetch("/api/auth/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // 🔥 THIS updates UI instantly
      await update({ name });

      toast.success("Name updated");
      setEditingName(false);
    } catch (err) {
      toast.error(err.message || "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- CHANGE PASSWORD ---------- */
const handleChangePassword = async () => {
  if (!newPass || !confirmPass)
    return toast.error("All password fields are required");

  if (newPass !== confirmPass)
    return toast.error("Passwords do not match");

  try {
    setLoading(true);

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        newPass,
        confirmPass,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    toast.success("Password updated successfully");
    setNewPass("");
    setConfirmPass("");
  } catch (err) {
    toast.error(err.message || "Password update failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Profile
        </h2>

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <img
            src={
              user?.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "User"
              )}&background=2563eb&color=fff`
            }
            alt="avatar"
            className="w-20 h-20 rounded-full border"
          />
        </div>

        {/* Name */}
        <div className="mb-4 text-sm">
          <p className="text-gray-500">Name</p>

          {!editingName ? (
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.name}
              </p>
              <button onClick={() => setEditingName(true)}>
                <Pencil
                  size={16}
                  className="text-gray-500 hover:text-indigo-600"
                />
              </button>
            </div>
          ) : (
            <div className="flex gap-2 mt-1">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-800"
              />
              <button
                disabled={loading}
                onClick={handleChangeName}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="mb-6 text-sm">
          <p className="text-gray-500">Email</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {user?.email}
          </p>
        </div>

        {/* Change Password */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Change Password
          </h3>

          {/* Only ask current password for credentials users */}
          

          <input
            type="password"
            placeholder="New password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800"
          />

          {newPass && (
  <div className="mt-1">
    <div className="h-1 w-full rounded bg-gray-200">
      <div
        className={`h-1 rounded ${
          getPasswordStrength(newPass).color
        }`}
        style={{
          width:
            getPasswordStrength(newPass).label === "Weak"
              ? "33%"
              : getPasswordStrength(newPass).label === "Medium"
              ? "66%"
              : "100%",
        }}
      />
    </div>
    <p className="text-xs mt-1 text-gray-500">
      Strength: {getPasswordStrength(newPass).label}
    </p>
  </div>
)}


          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800"
          />

          <button
            disabled={loading}
            onClick={handleChangePassword}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Update Password
          </button>

          <p className="text-xs text-gray-500 text-center">
            You can also reset your password using{" "}
            <span className="font-medium">Forgot Password</span> on the login
            page.
          </p>
        </div>
      </div>
    </div>
  );
}
