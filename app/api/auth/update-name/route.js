import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { email, name } = await req.json();

    const user = await User.findOne({ email });
    if (!user)
      return NextResponse.json({ success: false, message: "User not found" });

    user.name = name;
    await user.save();

    return NextResponse.json({ success: true, message: "Name updated" });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
