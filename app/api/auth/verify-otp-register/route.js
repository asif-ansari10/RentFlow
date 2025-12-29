import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import bcrypt from "bcryptjs";
import { verifyOTP } from "@/lib/otp";

export async function POST(req) {
  try {
    await connectDB();

    const { name, email, password, otp } = await req.json();

    if (!name || !email || !password || !otp)
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );

    // Check OTP record
    const record = await OTP.findOne({ email, purpose: "register" }).sort({ createdAt: -1 });

    if (!record)
      return NextResponse.json(
        { success: false, message: "OTP not found. Please request again." },
        { status: 404 }
      );

    // Expired OTP
    if (new Date() > new Date(record.expiresAt))
      return NextResponse.json(
        { success: false, message: "OTP expired. Request a new one." },
        { status: 400 }
      );

    // Check OTP match
    const ok = await verifyOTP(otp, record.otpHash);
    if (!ok)
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );

    // Create user
    const hashedPass = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPass });

    // Delete OTP after use
    await OTP.deleteMany({ email, purpose: "register" });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err) {
    console.error("VERIFY OTP REGISTER ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
