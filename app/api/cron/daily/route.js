import { connectDB } from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import Rent from "@/models/Rent";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

/* ================= EMAIL SETUP ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: `"RentFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

/* ================= DAILY CRON ================= */
export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    /* ======================================================
       📄 AGREEMENT EXPIRY REMINDER (30 DAYS BEFORE)
    ====================================================== */
    const tenants = await Tenant.find({
      "agreement.startDate": { $exists: true },
      "notifications.notifyBeforeAgreementEnd": true,
    });

    for (const tenant of tenants) {
      if (!tenant.email) continue;
      if (tenant.agreementExpiryReminderSent) continue;

      const { startDate, tenure } = tenant.agreement;

      const expiry = new Date(startDate);
      expiry.setFullYear(expiry.getFullYear() + (tenure?.years || 0));
      expiry.setMonth(expiry.getMonth() + (tenure?.months || 0));
      expiry.setDate(expiry.getDate() + (tenure?.days || 0));

      const diffDays = Math.ceil(
        (expiry - today) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 30) {
        await sendEmail(
          tenant.email,
          "Agreement Expiry Reminder",
          `
            <p>Hello <b>${tenant.name}</b>,</p>
            <p>Your rental agreement will expire on:</p>
            <p><b>${expiry.toDateString()}</b></p>
            <p>– RentFlow</p>
          `
        );

        tenant.agreementExpiryReminderSent = true;
        await tenant.save();
      }
    }

    /* ======================================================
       🔌 ELECTRICITY METER REMINDER (1 DAY BEFORE DUE DATE)
    ====================================================== */
    const rents = await Rent.find({
      month,
      year,
      "electricity.enabled": true,
      "electricity.calculated": false,
      electricityReminderSent: false,
    }).populate("tenantId");

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
          `
            <p>Hello <b>${tenant.name}</b>,</p>
            <p>Please submit your electricity meter reading.</p>
            <p><b>Due Date:</b> ${dueDate.toDateString()}</p>
            <p>– RentFlow</p>
          `
        );

        rent.electricityReminderSent = true;
        await rent.save();
      }
    }

    /* ======================================================
       🔴 MARK RENT AS OVERDUE (AFTER GRACE PERIOD)
    ====================================================== */
    const pendingRents = await Rent.find({
      status: "pending",
    }).populate("tenantId");

    for (const rent of pendingRents) {
      const tenant = rent.tenantId;
      if (!tenant) continue;

      const gracePeriod = tenant.rent?.gracePeriod || 0;

      const overdueDate = new Date(rent.dueDate);
      overdueDate.setDate(overdueDate.getDate() + gracePeriod);
      overdueDate.setHours(0, 0, 0, 0);

      if (today > overdueDate) {
        rent.status = "overdue";
        await rent.save();
      }
    }

    /* ================= DONE ================= */
    return NextResponse.json({
      success: true,
      message: "Daily cron executed successfully",
    });

  } catch (error) {
    console.error("DAILY CRON ERROR:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
