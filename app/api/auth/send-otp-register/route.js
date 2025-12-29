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

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // CHECK IF USER ALREADY EXISTS
    const user = await User.findOne({ email });
    if (user) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    // DELETE OLD OTP BEFORE CREATING NEW
    await OTP.deleteMany({ email, purpose: "register" });

    // CREATE OTP
    const otp = generateOTP(6);
    const otpHash = await hashOTP(otp);

    await OTP.create({
      email,
      otpHash,
      purpose: "register",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // SEND MAIL
    await sendEmail({
      to: email,
      subject: "Your Registration OTP",
      html: `
        <h2>Your OTP Code</h2>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes</p>
      `
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (err) {
    console.error("SEND OTP REGISTER ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
