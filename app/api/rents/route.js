import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rent from "@/models/Rent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectDB();

    // 🔐 AUTH
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        {
          unauthorized: true,
          message: "Please login to view your rents",
          rents: [],
        },
        { status: 200 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get("status");

    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    // ✅ FETCH CURRENT MONTH RENTS
    let rents = await Rent.find({
      userId,
      month,
      year,
    })
      .populate({
        path: "tenantId",
        select: "name agreement rent photoUrl",
      })
      .sort({ dueDate: 1 });

    // 🔁 AGREEMENT EXPIRY FILTER
    rents = rents.filter((rent) => {
      const agreement = rent.tenantId?.agreement;
      if (!agreement?.startDate) return false;

      const expiry = new Date(agreement.startDate);
      expiry.setFullYear(expiry.getFullYear() + (agreement.tenure?.years || 0));
      expiry.setMonth(expiry.getMonth() + (agreement.tenure?.months || 0));
      expiry.setDate(expiry.getDate() + (agreement.tenure?.days || 0));

      return today <= expiry;
    });

    // 🔁 AUTO ADD LAST MONTH DUE (ONLY ON 1st)
    if (today.getDate() === 1) {
      for (const rent of rents) {
        if (rent.dueNextMonth?.amount > 0) {
          rent.amount += rent.dueNextMonth.amount;
          rent.dueNextMonth.amount = 0;
          rent.status = "pending";
          await rent.save();
        }
      }
    }

    // ⏱ AUTO STATUS UPDATE (SAFE)
    for (const rent of rents) {
      // ❗ DO NOT TOUCH PAID OR PARTIAL
      if (rent.status === "paid" || rent.status === "partial") continue;

      const grace = rent.tenantId?.rent?.gracePeriod || 0;
      const graceEnd = new Date(rent.dueDate);
      graceEnd.setDate(graceEnd.getDate() + grace);

      const newStatus = today > graceEnd ? "overdue" : "pending";

      if (rent.status !== newStatus) {
        rent.status = newStatus;
        await rent.save();
      }
    }

    // 🔍 FILTER BY STATUS
    if (filterStatus) {
      rents = rents.filter((r) => r.status === filterStatus);
    }

    // ✅ RESPONSE (BREAKUP SAFE)
    return NextResponse.json({
      rents: rents.map((r) => ({
        _id: r._id,
        tenantName: r.tenantId?.name || "Unknown",
        photoUrl: r.tenantId?.photoUrl || null,

        amount: r.amount, // base rent (+ carried due)
        dueDate: r.dueDate,
        status: r.status,

        paidAmount: r.paidAmount || 0,
        dueNextMonth: r.dueNextMonth?.amount || 0,

        electricity: {
          enabled: r.electricity?.enabled || false,
          unitCost: r.electricity?.unitCost || 0,
          unitsConsumed: r.electricity?.unitsConsumed || 0,
          electricityAmount: r.electricity?.electricityAmount || 0,
          calculated: r.electricity?.calculated || false,
        },
      })),
    });
  } catch (error) {
    console.error("RENT FETCH ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch rents" },
      { status: 500 }
    );
  }
}
