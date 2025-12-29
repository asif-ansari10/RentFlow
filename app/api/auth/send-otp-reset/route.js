import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { sendEmail } from "@/lib/mailer";
import { generateOTP, hashOTP } from "@/lib/otp";

export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();
    if (!email)
      return NextResponse.json({ message: "Email is required" }, { status: 400 });

    const user = await User.findOne({ email });
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    // 1️⃣ DELETE OLD OTP FIRST
    await OTP.deleteMany({ email, purpose: "reset" });

    // 2️⃣ GENERATE NEW OTP
    const otp = generateOTP(6);
    const otpHash = await hashOTP(otp);

    await OTP.create({
      email,
      otpHash,
      purpose: "reset",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

    // 3️⃣ SEND MAIL
    await sendEmail({
      to: email,
      subject: "Your Password Reset OTP",
      html: `<p>Your OTP: <b>${otp}</b></p><p>Valid for 10 minutes.</p>`,
    });

    return NextResponse.json({ success: true, message: "OTP sent to email" });

  } catch (err) {
    console.error("RESET OTP ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
