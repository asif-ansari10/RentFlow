import { connectDB } from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import Rent from "@/models/Rent";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await connectDB();

    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const tenants = await Tenant.find();

    for (const tenant of tenants) {
      /* Skip expired agreements */
      const agreement = tenant.agreement;
      const expiry = new Date(agreement.startDate);
      expiry.setFullYear(expiry.getFullYear() + (agreement.tenure?.years || 0));
      expiry.setMonth(expiry.getMonth() + (agreement.tenure?.months || 0));
      expiry.setDate(expiry.getDate() + (agreement.tenure?.days || 0));
      if (today > expiry) continue;

      /* Check if rent already generated */
      const exists = await Rent.findOne({
        tenantId: tenant._id,
        month,
        year,
      });
      if (exists) continue;

      let rentAmount = tenant.rent.monthly;

      /* 🔼 APPLY RENT INCREASE */
      if (tenant.rentIncrease?.percentage) {
        const start = new Date(agreement.startDate);
        const diffMonths =
          (year - start.getFullYear()) * 12 +
          (month - (start.getMonth() + 1));

        const after = tenant.rentIncrease.after || 1;

        if (
          tenant.rentIncrease.cycle === "Yearly" &&
          diffMonths >= after * 12
        ) {
          rentAmount +=
            (rentAmount * tenant.rentIncrease.percentage) / 100;
        }

        if (
          tenant.rentIncrease.cycle === "Monthly" &&
          diffMonths >= after
        ) {
          rentAmount +=
            (rentAmount * tenant.rentIncrease.percentage) / 100;
        }
      }

      /* Create Rent */
      const dueDate = new Date(
        year,
        month - 1,
        tenant.rent.billingDate
      );

      await Rent.create({
        tenantId: tenant._id,
        tenantName: tenant.name,
        amount: Math.round(rentAmount),
        dueDate,
        month,
        year,
        status: "pending",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("RENT GENERATE ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
