"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tenants");
      const data = await res.json();

      if (data.unauthorized) {
        setNeedLogin(true);
        return;
      }

      setTenants(data.tenants || []);
    } catch {
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  const deleteTenant = async (id) => {
    if (!confirm("Delete this tenant?")) return;

    try {
      const res = await fetch(`/api/tenants/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete tenant");
        return;
      }

      toast.success("Tenant deleted");
      fetchTenants();
    } catch {
      toast.error("Something went wrong");
    }
  };

  /* 🔐 LOGIN REQUIRED */
  if (needLogin) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h2 className="text-2xl font-semibold">Login required</h2>
        <p className="text-gray-500 mt-2">
          Please login to manage your tenants
        </p>
        <Link
          href="/login"
          className="mt-5 px-6 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tenants</h1>
          <p className="text-gray-500">
            View and manage tenants linked to your account
          </p>
        </div>

      </div>

      {/* Desktop Table */}
      {!loading && tenants.length > 0 && (
        <div className="hidden md:block bg-white border rounded-xl overflow-x-auto border-gray-200 dark:border-gray-700 dark:bg-gray-900">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <Th>Tenant</Th>
                <Th>Phone</Th>
                <Th>Rent</Th>
                <Th>Agreement</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t._id} className="border-t">
                  <Td>
                    <div className="flex items-center gap-3">
                      {t.photoUrl ? (
                        <img
                          src={t.photoUrl}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                          {t.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                      <span>{t.name}</span>
                    </div>
                  </Td>

                  <Td>{t.phone}</Td>
                  <Td>₹{t.rent?.monthly}</Td>

                  <Td>
                    {t.agreementFile?.url ? (
                      <a
                        href={t.agreementFile.url}
                        target="_blank"
                        className="text-indigo-600 underline"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="text-gray-400">Not uploaded</span>
                    )}
                  </Td>

                  <Td>
                    <div className="flex gap-4">
                      <Link
                        href={`/tenants/edit/${t._id}`}
                        className="text-blue-600"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteTenant(t._id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards */}
<div className="md:hidden space-y-4">
  {tenants.map((t) => (
    <div
      key={t._id}
      className="
        rounded-xl border
        bg-white dark:bg-gray-900
        border-gray-200 dark:border-gray-700
        p-4 space-y-3
      "
    >
      {/* HEADER */}
      <div className="flex items-center gap-4">
        {t.photoUrl ? (
          <img
            src={t.photoUrl}
            alt={t.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
            {t.name[0].toUpperCase()}
          </div>
        )}

        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {t.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.phone}
          </p>
        </div>
      </div>

      {/* RENT */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monthly Rent
        </p>
        <p className="font-bold text-gray-900 dark:text-gray-100">
          ₹{t.rent?.monthly}
        </p>
      </div>

      {/* AGREEMENT */}
      {t.agreementFile?.url && (
        <a
          href={t.agreementFile.url}
          target="_blank"
          className="
            inline-block text-sm font-medium
            text-indigo-600 dark:text-indigo-400
            hover:underline
          "
        >
          📄 View Agreement
        </a>
      )}

      {/* ACTIONS */}
      <div className="flex gap-4 pt-2">
        <Link
          href={`/tenants/edit/${t._id}`}
          className="
            text-sm font-medium
            text-blue-600 dark:text-blue-400
            hover:underline
          "
        >
          Edit
        </Link>

        <button
          onClick={() => deleteTenant(t._id)}
          className="
            text-sm font-medium
            text-red-600 dark:text-red-400
            hover:underline
          "
        >
          Delete
        </button>
      </div>
    </div>
  ))}
</div>


      {!loading && tenants.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No tenants added yet
        </p>
      )}
    </div>
  );
}

/* ---------- UI HELPERS ---------- */

function Th({ children }) {
  return (
    <th className="px-6 py-4 text-left font-medium text-gray-600">
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-6 py-4">{children}</td>;
}
