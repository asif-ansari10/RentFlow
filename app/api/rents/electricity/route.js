import { connectDB } from "@/lib/mongodb";
import Rent from "@/models/Rent";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  const { rentId, units } = await req.json();

  const rent = await Rent.findById(rentId);
  if (!rent || !rent.electricity?.enabled) {
    return NextResponse.json({ error: "Invalid rent" }, { status: 400 });
  }

  // ❌ prevent multiple readings
  if (rent.electricity.calculated) {
    return NextResponse.json({ error: "Already calculated" }, { status: 400 });
  }

  const electricityAmount = units * rent.electricity.unitCost;

  rent.electricity.unitsConsumed = units;
  rent.electricity.electricityAmount = electricityAmount;
  rent.electricity.calculated = true;

  rent.amount += electricityAmount; // ✅ ADD

  await rent.save();

  return NextResponse.json({ success: true });
}
