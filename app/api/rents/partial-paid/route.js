import { connectDB } from "@/lib/mongodb";
import Rent from "@/models/Rent";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const { rentId, paidAmount } = await req.json();

    if (!rentId || paidAmount === undefined) {
      return NextResponse.json(
        { error: "rentId and paidAmount are required" },
        { status: 400 }
      );
    }

    const rent = await Rent.findById(rentId);
    if (!rent) {
      return NextResponse.json({ error: "Rent not found" }, { status: 404 });
    }

    // 🔒 Prevent invalid states
    if (rent.status === "paid") {
      return NextResponse.json(
        { error: "Rent already fully paid" },
        { status: 400 }
      );
    }

    const currentPaid = Number(paidAmount);
    if (currentPaid <= 0) {
      return NextResponse.json(
        { error: "Invalid paid amount" },
        { status: 400 }
      );
    }

    // ✅ TOTAL PAYABLE (already includes electricity)
    const totalPayable = rent.amount;

    // ✅ cumulative payment
    const alreadyPaid = rent.paidAmount || 0;
    const newPaidTotal = alreadyPaid + currentPaid;

    if (newPaidTotal > totalPayable) {
      return NextResponse.json(
        { error: "Paid amount exceeds total payable" },
        { status: 400 }
      );
    }

    const dueAmount = totalPayable - newPaidTotal;

    // 🧮 Update rent
    rent.paidAmount = newPaidTotal;

    if (dueAmount > 0) {
      rent.status = "partial";
      rent.dueNextMonth.amount = dueAmount;
    } else {
      rent.status = "paid";
      rent.dueNextMonth.amount = 0;
    }

    await rent.save();

    return NextResponse.json({
      success: true,
      status: rent.status,
      paidAmount: rent.paidAmount,
      dueNextMonth: rent.dueNextMonth.amount,
    });
  } catch (error) {
    console.error("PARTIAL PAID ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update partial payment" },
      { status: 500 }
    );
  }
}
