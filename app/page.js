"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return <p className="p-6 text-gray-500">Loading dashboard…</p>;
  }

  /* ---------- DATA FROM BACKEND ---------- */
  const {
    stats,
    tenantOverview,
    pendingTenants,
    overdueTenants,
    partialRents,
    meterPending,
    chart,
    expiringTenants,
    recentRents,
  } = data;


  /* ---------- SAFE ARRAYS ---------- */
  const safePending = pendingTenants ?? [];
  const safeOverdue = overdueTenants ?? [];
  const safeExpiring = expiringTenants ?? [];
  const safeRecent = recentRents ?? [];
  const safeChart = chart ?? [];
  const safePartial = partialRents ?? [];
const safeMeterPending = meterPending ?? [];




  return (
    <div className="px-4 py-8 max-w-7xl mx-auto space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Rent overview & activity
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Stat title="Tenants" value={stats.totalTenants} />
        <Stat title="Collected" value={`₹${stats.collected}`} />
        <Stat title="Pending" value={`₹${stats.pending}`} color="text-yellow-500" />
        <Stat title="Partial Pending" value={`₹${stats.partialPending}`} color="text-orange-500"/>
        <Stat title="Overdue" value={`₹${stats.overdue}`} color="text-red-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* PENDING RENTS */}
        <Card title="Pending Rents">
          {safePending.length === 0 ? (
            <p className="text-gray-500">No pending rents</p>
          ) : (
            <ul className="space-y-2">
              {safePending.map((r) => (
                <li
                  key={r._id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-medium">
                    {r.tenantId?.name || "Unknown"}
                  </span>
                  <span className="text-yellow-600 font-semibold">
                    ₹{r.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/rents?status=pending"
            className="inline-block mt-3 text-indigo-600 hover:underline text-sm"
          >
            View all →
          </Link>
        </Card>

        {/* OVERDUE RENTS */}
        <Card title="Overdue Rents">
          {safeOverdue.length === 0 ? (
            <p className="text-gray-500">No overdue rents</p>
          ) : (
            <ul className="space-y-2">
              {safeOverdue.map((t) => (
                <li
                  key={t._id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium">
                    {t.tenantId?.name || "Unknown"}
                  </span>
                  <span className="text-red-600 font-semibold">
                    Overdue
                  </span>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/rents?status=overdue"
            className="inline-block mt-3 text-indigo-600 hover:underline text-sm"
          >
            View all →
          </Link>
        </Card>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* PARTIAL PAYMENTS */}
<Card title="Partial Payments">
  {safePartial.length === 0 ? (
    <p className="text-gray-500">No partial payments</p>
  ) : (
    <ul className="space-y-2">
      {safePartial.map(r => (
        <li key={r._id} className="flex justify-between text-sm">
          <span>{r.tenantId?.name || "Unknown"}</span>
          <span className="text-orange-600 font-semibold">
            Due ₹{r.dueNextMonth?.amount || 0}
          </span>
        </li>
      ))}
    </ul>
  )}
</Card>


        {/* METER PENDING */}
<Card title="Meter Reading Pending">
  {safeMeterPending.length === 0 ? (
    <p className="text-gray-500">All meter readings added</p>
  ) : (
    <ul className="space-y-2">
      {safeMeterPending.map(r => (
        <li key={r._id} className="flex justify-between text-sm">
          <span>{r.tenantId?.name || "Unknown"}</span>
          <span className="text-orange-600">Pending</span>
        </li>
      ))}
    </ul>
  )}
</Card>


      </div>


      {/* MONTHLY RENT CHART */}
      <Card title="Monthly Rent Comparison">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeChart}>
              <XAxis dataKey="tenant" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="paid" stackId="a" fill="#22c55e" name="Paid" />
              <Bar dataKey="pending" stackId="a" fill="#facc15" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* AGREEMENTS EXPIRING */}
      <Card title="Agreements Expiring in 30 Days">
        {safeExpiring.length === 0 ? (
          <p className="text-gray-500">No expiring agreements 🎉</p>
        ) : (
          <ul className="space-y-2">
            {safeExpiring.map((t) => (
              <li
                key={t._id}
                className="flex justify-between border-b pb-2 text-sm"
              >
                <span>{t.name}</span>
                <span className="text-gray-500">
                  {new Date(t.expiry).toDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* RECENT ACTIVITY */}
      <Card title="Recent Rent Activity (This Month)">
        {safeRecent.length === 0 && (
          <p className="text-gray-500">No activity this month</p>
        )}

        {safeRecent.map((r) => (
          <div
            key={r._id}
            className="flex justify-between items-center border-b py-3 last:border-none"
          >
            <div>
              <p className="font-medium">{r.tenantName}</p>
              <p className="text-sm text-gray-500">
                Due: {new Date(r.dueDate).toLocaleDateString()}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${r.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : r.status === "overdue"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {r.status}
            </span>
          </div>
        ))}
      </Card>

      {/* TENANT SECTION */}
      {/* <Card title="Tenant Overview">
        <Link
          href="/tenants"
          className="text-indigo-600 hover:underline font-medium"
        >
          View all tenants →
        </Link>
      </Card> */}
      <Card title="Tenant Overview">
  {tenantOverview.length === 0 ? (
    <p className="text-gray-500 text-sm">No tenants added yet</p>
  ) : (
    <ul className="space-y-2">
      {tenantOverview.map(t => (
        <li
          key={t._id}
          className="flex justify-between items-center text-sm"
        >
          <span className="font-medium">{t.name}</span>
          {t.email && (
            <span className="text-gray-400 text-xs">{t.email}</span>
          )}
        </li>
      ))}
    </ul>
  )}

  <Link
    href="/tenants"
    className="inline-block mt-3 text-indigo-600 hover:underline font-medium"
  >
    View all tenants →
  </Link>
</Card>

    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Stat({ title, value, color = "text-indigo-600" }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className={`text-2xl font-bold mt-2 ${color}`}>{value}</h2>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
