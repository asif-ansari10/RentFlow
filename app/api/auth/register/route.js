import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "../../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("➡ REGISTER API HIT");

    await  connectDB (); // This logs connection status

    const body = await req.json();
    console.log("📩 Body:", body);

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hashedPassword });

    console.log("✅ User Registered:", email);

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.log("❌ REGISTER ERROR:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
