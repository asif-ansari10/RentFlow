import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import Rent from "@/models/Rent";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Please login" },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type");

    let data = {};
    let photoFile = null;
    let agreementFile = null;

    // ✅ Handle FormData OR JSON
    if (contentType?.includes("multipart/form-data")) {
      const fd = await req.formData();
      fd.forEach((v, k) => (data[k] = v));
      photoFile = fd.get("photo");
      agreementFile = fd.get("agreementFile");
    } else {
      data = await req.json();
    }

    /* ---------- UPLOAD HELPERS ---------- */
    const uploadFile = async (file, options) => {
      if (!file || file.size === 0) return null;
      const buffer = Buffer.from(await file.arrayBuffer());
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          options,
          (err, res) => (err ? reject(err) : resolve(res))
        ).end(buffer);
      });
    };

    const photoUpload = await uploadFile(photoFile, {
      folder: "rentflow/tenants",
    });

    const agreementUpload = await uploadFile(agreementFile, {
      folder: "rentflow/agreements",
      resource_type: "raw",
    });

    /* ---------- OPTIONAL FLAGS ---------- */
    const electricityEnabled = data.electricityEnabled === "true";

    const rentIncreaseEnabled =
      data.increasePercentage &&
      data.increaseAfter &&
      data.increaseCycle !== "Select";

    /* ---------- CREATE TENANT ---------- */
    const tenant = await Tenant.create({
      userId: session.user.id,

      name: data.name,
      email: data.email || null,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      address: data.address,

      photoUrl: photoUpload?.secure_url || null,
      agreementFile: agreementUpload
        ? {
            url: agreementUpload.secure_url,
            publicId: agreementUpload.public_id,
          }
        : null,

      rent: {
        monthly: Number(data.monthlyRent),
        advance: Number(data.advanceAmount) || 0,
        billingCycle: data.billingCycle || "Monthly",
        billingDate: Number(data.billingDate) || 1,
        gracePeriod: Number(data.gracePeriod) || 5,
      },

      rentIncrease: rentIncreaseEnabled
        ? {
            percentage: Number(data.increasePercentage),
            after: Number(data.increaseAfter),
            cycle: data.increaseCycle,
          }
        : undefined,

      electricity: electricityEnabled
        ? {
            enabled: true,
            unitCost: Number(data.unitCost) || 0,
            notifyBeforeBilling:
              data.notifyBeforeBilling === "true",
          }
        : { enabled: false },

      agreement: {
        startDate: new Date(data.agreementStartDate),
        tenure: {
          years: Number(data.tenureYears) || 0,
          months: Number(data.tenureMonths) || 0,
          days: Number(data.tenureDays) || 0,
        },
      },

      notifications: {
        notifyBeforeAgreementEnd:
          data.notifyBeforeAgreementEnd !== "false",
      },
    });


/* ---------- FIRST RENT ---------- */
// await Rent.create({
//   userId: session.user.id,

//   // ✅ FIX: copy tenant photo correctly
//   photoUrl: tenant.photoUrl || null,
//   tenantId: tenant._id,
//   tenantName: tenant.name,

//   amount: tenant.rent.monthly,
//   dueDate: new Date(),
//   month: new Date().getMonth() + 1,
//   year: new Date().getFullYear(),
  
//   status: "pending",
//     paidAmount: 0,
//   dueNextMonth: { amount: 0 },
//   previousDue: 0,

//    electricityReminderSent:
//     tenant.electricity?.notifyBeforeBilling === true
//       ? false   // reminder allowed, not yet sent
//       : true,   // reminder disabled → mark as already sent


//   // 🔌 ELECTRICITY SNAPSHOT
//   electricity: {
//     enabled: tenant.electricity?.enabled || false,
//     unitCost: tenant.electricity?.unitCost || 0,
//     unitsConsumed: 0,        // future meter reading
//     electricityAmount: 0,    // future calculation
//     calculated: false,
//   },
// });


// current date
const now = new Date();

// calculate next month
let rentMonth = now.getMonth() + 2; // next month (1–12)
let rentYear = now.getFullYear();

if (rentMonth === 13) {
  rentMonth = 1;
  rentYear += 1;
}

// billing day (fallback = 1)
const billingDay = tenant.rent.billingDate || 1;

/**
 * ✅ IMPORTANT FIX:
 * Create date in UTC to avoid IST → UTC shift
 */
const dueDate = new Date(Date.UTC(
  rentYear,
  rentMonth - 1,
  billingDay,
  0, 0, 0   // midnight UTC
));

await Rent.create({
  userId: session.user.id,

  tenantId: tenant._id,
  tenantName: tenant.name,
  photoUrl: tenant.photoUrl || null,

  // 💰 base rent only
  amount: tenant.rent.monthly,

  dueDate,               // ✅ FIXED
  month: rentMonth,
  year: rentYear,

  status: "pending",
  paidAmount: 0,
  dueNextMonth: { amount: 0 },
  previousDue: 0,

  // 🔔 electricity reminder logic
  electricityReminderSent:
    tenant.electricity?.notifyBeforeBilling === true
      ? false   // reminder allowed
      : true,   // reminder disabled → mark as sent

  // 🔌 electricity snapshot
  electricity: {
    enabled: tenant.electricity?.enabled || false,
    unitCost: tenant.electricity?.unitCost || 0,
    unitsConsumed: 0,
    electricityAmount: 0,
    calculated: false,
  },
});



    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("TENANT CREATE ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { unauthorized: true, tenants: [] },
        { status: 200 }
      );
    }

    const tenants = await Tenant.find({
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ tenants });
  } catch (err) {
    console.error("TENANT FETCH ERROR:", err);
    return NextResponse.json(
      { message: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}

