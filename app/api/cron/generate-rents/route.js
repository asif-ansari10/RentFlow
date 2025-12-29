import { connectDB } from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import Rent from "@/models/Rent";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const tenants = await Tenant.find();

    for (const tenant of tenants) {
      /* ---------- AGREEMENT CHECK ---------- */
      const { startDate, tenure } = tenant.agreement || {};
      if (!startDate) continue;

      const expiry = new Date(startDate);
      expiry.setFullYear(expiry.getFullYear() + (tenure?.years || 0));
      expiry.setMonth(expiry.getMonth() + (tenure?.months || 0));
      expiry.setDate(expiry.getDate() + (tenure?.days || 0));

      // ❌ Do not generate rent if agreement expired
      if (today > expiry) continue;

      /* ---------- PREVENT DUPLICATE RENT ---------- */
      const alreadyExists = await Rent.findOne({
        tenantId: tenant._id,
        month,
        year,
      });
      if (alreadyExists) continue;

      /* ---------- PREVIOUS MONTH CALCULATION ---------- */
      const lastMonth = month === 1 ? 12 : month - 1;
      const lastYear = month === 1 ? year - 1 : year;

      const prevRent = await Rent.findOne({
        tenantId: tenant._id,
        month: lastMonth,
        year: lastYear,
      });

      let previousDue = 0;

      if (prevRent && prevRent.status !== "paid") {
        previousDue = prevRent.dueNextMonth?.amount || 0;
      }

      /* ---------- RENT INCREASE ---------- */
      let baseRent = tenant.rent.monthly;

      if (tenant.rentIncrease?.percentage) {
        const diffMonths =
          (year - startDate.getFullYear()) * 12 +
          (month - (startDate.getMonth() + 1));

        const after = tenant.rentIncrease.after || 1;

        if (
          tenant.rentIncrease.cycle === "Yearly" &&
          diffMonths >= after * 12
        ) {
          baseRent += (baseRent * tenant.rentIncrease.percentage) / 100;
        }

        if (
          tenant.rentIncrease.cycle === "Monthly" &&
          diffMonths >= after
        ) {
          baseRent += (baseRent * tenant.rentIncrease.percentage) / 100;
        }
      }

      /* ---------- CREATE NEW MONTH RENT ---------- */
      const dueDate = new Date(
        year,
        month - 1,
        tenant.rent.billingDate
      );

const newRent = await Rent.create({
  userId: tenant.userId,
  tenantId: tenant._id,
  tenantName: tenant.name,
  photoUrl: tenant.photoUrl || null,

  amount: Math.round(baseRent + previousDue),
  previousDue,

  dueDate,
  month,
  year,
  status: "pending",

  paidAmount: 0,
  dueNextMonth: { amount: 0 },

  // 🔔 IMPORTANT FIX
  electricityReminderSent:
    tenant.electricity?.notifyBeforeBilling === true
      ? false   // user wants reminder
      : true,   // user does NOT want reminder

  electricity: {
    enabled: tenant.electricity?.enabled || false,
    unitCost: tenant.electricity?.unitCost || 0,
    unitsConsumed: 0,
    electricityAmount: 0,
    calculated: false,
  },
});


      /* ---------- DELETE PREVIOUS MONTH RENT (FREE MONGODB) ---------- */
      if (prevRent) {
        await Rent.deleteOne({ _id: prevRent._id });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Monthly rent generation completed",
    });
  } catch (error) {
    console.error("GENERATE RENT CRON ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Rent generation failed" },
      { status: 500 }
    );
  }
}
