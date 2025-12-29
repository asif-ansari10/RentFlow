import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rent from "@/models/Rent";
import Tenant from "@/models/Tenant";
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

/* ---------------- CRON ---------------- */
export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const rents = await Rent.find({
      month,
      year,
      "electricity.enabled": true,
      "electricity.calculated": false,
      electricityReminderSent: false,
    }).populate("tenantId");

    let sent = 0;

    for (const rent of rents) {
      const tenant = rent.tenantId;
      if (!tenant?.email) continue;
      if (!tenant.electricity?.notifyBeforeBilling) continue;

      const dueDate = new Date(rent.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const diffDays =
        (dueDate - today) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        await sendEmail(
          tenant.email,
          "Electricity Meter Reading Reminder",
          `<p>Hello <b>${tenant.name}</b>,</p>
           <p>Please submit your electricity meter reading.</p>
           <p><b>Rent Due Date:</b> ${dueDate.toDateString()}</p>
           <p>Regards,<br/>RentFlow</p>`
        );

        rent.electricityReminderSent = true;
        await rent.save();
        sent++;
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent: sent,
    });
  } catch (err) {
    console.error("ELECTRICITY CRON ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

