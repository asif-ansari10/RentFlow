import { connectDB } from "@/lib/mongodb";
import Rent from "@/models/Rent";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { rentId } = await req.json();

    const rent = await Rent.findById(rentId).populate("tenantId");
    if (!rent) {
      return NextResponse.json({ message: "Rent not found" }, { status: 404 });
    }

    const phone = rent.tenantId.whatsapp;
    const msg = encodeURIComponent(
      `Hello ${rent.tenantId.name},\n\nThis is a reminder that your rent of ₹${rent.amount} is due on ${rent.dueDate.toDateString()}.\n\nThank you.`
    );

    const whatsappUrl = `https://wa.me/91${phone}?text=${msg}`;

    return NextResponse.json({ whatsappUrl });
  } catch (err) {
    console.error("REMINDER ERROR:", err);
    return NextResponse.json({ message: "Failed to send reminder" }, { status: 500 });
  }
}
