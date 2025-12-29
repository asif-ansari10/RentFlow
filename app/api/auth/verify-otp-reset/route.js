import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import bcrypt from "bcryptjs";
import { verifyOTP } from "@/lib/otp";

export async function POST(req) {
  try {
    await connectDB();

    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword)
      return NextResponse.json(
        { success: false, message: "All fields required" },
        { status: 400 }
      );

    const user = await User.findOne({ email });
    if (!user)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );

    const record = await OTP.findOne({ email, purpose: "reset" }).sort({ createdAt: -1 });

    if (!record)
      return NextResponse.json(
        { success: false, message: "OTP not found" },
        { status: 404 }
      );

    if (new Date() > new Date(record.expiresAt))
      return NextResponse.json(
        { success: false, message: "OTP expired" },
        { status: 400 }
      );

    const ok = await verifyOTP(otp, record.otpHash);

    if (!ok)
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );

    // SAVE NEW PASSWORD EVEN FOR GOOGLE USER
    const hashedPass = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { email },
      { password: hashedPass } // <-- OAuth user now has password too!
    );

    await OTP.deleteMany({ email, purpose: "reset" });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully!",
    });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
