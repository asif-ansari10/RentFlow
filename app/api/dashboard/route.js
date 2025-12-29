import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rent from "@/models/Rent";
import Tenant from "@/models/Tenant";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function GET() {
  await connectDB();

  const session = await getServerSession(authOptions);

  // 🚫 NOT LOGGED IN → return empty dashboard
  if (!session) {
    return NextResponse.json({
      stats: { totalTenants: 0, collected: 0, pending: 0,partialPending: 0, overdue: 0 },
      tenantOverview: [],
      pendingTenants: [],
      overdueTenants: [],
      partialRents: [],
    meterPending: [],
      chart: [],
      expiringTenants: [],
      recentRents: [],
    });
  }

  // ✅ Convert string → ObjectId
  const userId = new mongoose.Types.ObjectId(session.user.id);

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  /* ---------- STATS ---------- */

  const totalTenants = await Tenant.countDocuments({ userId });

const rentsThisMonth = await Rent.find({ userId, month, year });

let collected = 0;
let pending = 0;
let partialPending = 0;
let overdue = 0;

for (const r of rentsThisMonth) {
  const electricity = r.electricity?.electricityAmount || 0;
  const total = r.amount + electricity;

  const paid = r.paidAmount || 0;
  const remaining = total - paid;

  // 💰 total money received (full + partial)
  collected += paid;

  // 🟡 fully unpaid
  if (r.status === "pending") {
    pending += total;
  }

  // 🟠 unpaid part of partial payment
  if (r.status === "partial") {
    partialPending += remaining;
  }

  // 🔴 unpaid overdue
  if (r.status === "overdue") {
    overdue += remaining;
  }
}


  /* ---------- PENDING / OVERDUE ---------- */
  const pendingTenants = await Rent.find({
    userId,
    status: "pending",
    month,
    year,
  }).populate("tenantId", "name").limit(5);

  const overdueTenants = await Rent.find({
    userId,
    status: "overdue",
    month,
    year,
  }).populate("tenantId", "name").limit(5);

  /* ---------- PARTIAL PAYMENTS ---------- */
const partialRents = await Rent.find({
  userId,
  status: "partial",
  month,
  year,
}).populate("tenantId", "name");

/* ---------- METER PENDING ---------- */
const meterPending = await Rent.find({
  userId,
  month,
  year,
  "electricity.enabled": true,
  "electricity.calculated": false,
}).populate("tenantId", "name");


  /* ---------- CHART ---------- */
const chart = rentsThisMonth.map(r => {
  const electricity = r.electricity?.electricityAmount || 0;
  const total = r.amount + electricity;

  const paid = r.paidAmount || 0;
  const due = total - paid;

  return {
    tenant: r.tenantName,
    paid,
    pending: due > 0 ? due : 0,
  };
});


  /* ---------- RECENT ---------- */
  const recentRents = await Rent.find({ userId, month, year })
    .sort({ updatedAt: -1 })
    .limit(5);

  /* ---------- EXPIRING ---------- */
  const tenants = await Tenant.find({ userId });

  const expiringTenants = tenants.filter(t => {
    const expiry = new Date(t.agreement.startDate);
    expiry.setFullYear(expiry.getFullYear() + (t.agreement.tenure.years || 0));
    expiry.setMonth(expiry.getMonth() + (t.agreement.tenure.months || 0));
    expiry.setDate(expiry.getDate() + (t.agreement.tenure.days || 0));

    const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 30;
  });

  /* ---------- TENANT OVERVIEW ---------- */
const tenantOverview = await Tenant.find({ userId })
  .select("name email")
  .sort({ createdAt: -1 }) // latest tenants
  .limit(5);


return NextResponse.json({
  stats: { totalTenants, collected, pending, partialPending, overdue },
  tenantOverview,
  pendingTenants,
  overdueTenants,
  partialRents,
  meterPending,
  chart,
  expiringTenants,
  recentRents,
});

}
