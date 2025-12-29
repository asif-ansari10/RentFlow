import { connectDB } from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

/* ---------------- EMAIL HELPER ---------------- */
async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"RentFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

/* ---------------- CRON HANDLER ---------------- */
export async function POST() {
  try {
    await connectDB();

    const today = new Date();

    // ✅ only tenants who want notifications
    const tenants = await Tenant.find({
      "agreement.startDate": { $exists: true },
      "notifications.notifyBeforeAgreementEnd": true,
    });

    let sentCount = 0;

    for (const tenant of tenants) {
      if (!tenant.email) continue;
      if (tenant.agreementExpiryReminderSent) continue;

      const { startDate, tenure } = tenant.agreement;

      /* 1️⃣ Calculate expiry */
      const expiry = new Date(startDate);
      expiry.setFullYear(expiry.getFullYear() + (tenure?.years || 0));
      expiry.setMonth(expiry.getMonth() + (tenure?.months || 0));
      expiry.setDate(expiry.getDate() + (tenure?.days || 0));

      /* 2️⃣ Days remaining */
      const diffDays = Math.ceil(
        (expiry - today) / (1000 * 60 * 60 * 24)
      );

      /* 3️⃣ Send exactly once (30 days before) */
      if (diffDays === 30) {
        await sendEmail(
          tenant.email,
          "Agreement Expiry Reminder",
          `
            <p>Hello <b>${tenant.name}</b>,</p>

            <p>Your rental agreement will expire on:</p>
            <p><b>${expiry.toDateString()}</b></p>

            <p>Please contact the owner if you wish to renew.</p>

            <br/>
            <p>Regards,<br/>RentFlow</p>
          `
        );

        tenant.agreementExpiryReminderSent = true;
        await tenant.save();
        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent: sentCount,
    });
  } catch (error) {
    console.error("AGREEMENT REMINDER CRON ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Cron failed" },
      { status: 500 }
    );
  }
}
