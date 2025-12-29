import { connectDB } from "@/lib/mongodb";
import Rent from "@/models/Rent";
import { NextResponse } from "next/server";


export async function POST(req) {
  await connectDB();
  const { rentId, dueAmount } = await req.json();

  const rent = await Rent.findById(rentId);
  if (!rent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (dueAmount > 0) {
    rent.status = "partial";
    rent.dueNextMonth = {
      amount: dueAmount,
      tenantId: rent.tenantId,
      tenantName: rent.tenantName,
    };
  } else {
    rent.status = "paid";
  }

  await rent.save();
  return NextResponse.json({ success: true });
}
