// app/api/cron/mark-overdue/route.js
import { connectDB } from "@/lib/mongodb";
import Rent from "@/models/Rent";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const rents = await Rent.find({ status: "PENDING" }).populate("tenantId");

  const today = new Date();

  for (const rent of rents) {
    const grace = rent.tenantId.rent.gracePeriod || 0;
    const overdueDate = new Date(rent.dueDate);
    overdueDate.setDate(overdueDate.getDate() + grace);

    if (today > overdueDate) {
      rent.status = "OVERDUE";
      await rent.save();
    }
  }

  return NextResponse.json({ success: true });
}
