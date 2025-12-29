import { connectDB } from "@/lib/mongodb";
import Rent from "@/models/Rent";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ pending: 0, overdue: 0, paid: 0 });
  }

  const userId = session.user.id;

  const pending = await Rent.countDocuments({ userId, status: "pending" });
  const overdue = await Rent.countDocuments({ userId, status: "overdue" });
  const paid = await Rent.countDocuments({ userId, status: "paid" });

  return NextResponse.json({ pending, overdue, paid });
}
