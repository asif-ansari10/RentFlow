// app/api/rents/pay/route.js
import { connectDB } from "@/lib/mongodb";
import Rent from "@/models/Rent";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  const { rentId, method } = await req.json();

  await Rent.findByIdAndUpdate(rentId, {
    status: "PAID",
    paidAt: new Date(),
    paymentMethod: method,
  });

  return NextResponse.json({ success: true });
}
