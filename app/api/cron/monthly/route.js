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
      const { startDate, tenure } = tenant.agreement || {};
      if (!startDate) continue;

      const expiry = new Date(startDate);
      expiry.setFullYear(expiry.getFullYear() + (tenure?.years || 0));
      expiry.setMonth(expiry.getMonth() + (tenure?.months || 0));
      expiry.setDate(expiry.getDate() + (tenure?.days || 0));

      if (today > expiry) continue;

      const exists = await Rent.findOne({
        tenantId: tenant._id,
        month,
        year,
      });
      if (exists) continue;

      const lastMonth = month === 1 ? 12 : month - 1;
      const lastYear = month === 1 ? year - 1 : year;

      const prevRent = await Rent.findOne({
        tenantId: tenant._id,
        month: lastMonth,
        year: lastYear,
      });

      const previousDue =
        prevRent && prevRent.status !== "paid"
          ? prevRent.dueNextMonth?.amount || 0
          : 0;

      const dueDate = new Date(
        year,
        month - 1,
        tenant.rent.billingDate
      );

      await Rent.create({
        userId: tenant.userId,
        tenantId: tenant._id,
        tenantName: tenant.name,
        photoUrl: tenant.photoUrl || null,

        amount: Math.round(tenant.rent.monthly + previousDue),
        previousDue,

        dueDate,
        month,
        year,
        status: "pending",
        paidAmount: 0,
        dueNextMonth: { amount: 0 },

        electricityReminderSent:
          tenant.electricity?.notifyBeforeBilling === true
            ? false
            : true,

        electricity: {
          enabled: tenant.electricity?.enabled || false,
          unitCost: tenant.electricity?.unitCost || 0,
          unitsConsumed: 0,
          electricityAmount: 0,
          calculated: false,
        },
      });

      if (prevRent) {
        await Rent.deleteOne({ _id: prevRent._id });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Monthly rent generation completed",
    });
  } catch (error) {
    console.error("MONTHLY CRON ERROR:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
