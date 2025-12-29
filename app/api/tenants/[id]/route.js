import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import Rent from "@/models/Rent";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/* =====================================================
   GET SINGLE TENANT
   ===================================================== */
export async function GET(req, context) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const tenant = await Tenant.findOne({
    _id: id,
    userId: session.user.id,
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  return NextResponse.json({ tenant });
}

/* =====================================================
   UPDATE TENANT (SYNC RENT ALSO)
   ===================================================== */
export async function PUT(req, context) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const fd = await req.formData();

  const tenant = await Tenant.findOne({
    _id: id,
    userId: session.user.id,
  });

  if (!tenant) {
    return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
  }

  /* ---------- BASIC INFO ---------- */
  tenant.name = fd.get("name");
  tenant.email = fd.get("email") || null;
  tenant.phone = fd.get("phone");
  tenant.whatsapp = fd.get("whatsapp") || fd.get("phone");
  tenant.address = fd.get("address");

  /* ---------- RENT ---------- */
  const newMonthlyRent = Number(fd.get("monthlyRent"));
  tenant.rent.monthly = newMonthlyRent;
  tenant.rent.advance = Number(fd.get("advance") || 0);

  /* ---------- RENT INCREASE ---------- */
  const riPercent = fd.get("rentIncreasePercentage");
  if (riPercent) {
    tenant.rentIncrease = {
      percentage: Number(riPercent),
      after: Number(fd.get("rentIncreaseAfter")),
      cycle: fd.get("rentIncreaseCycle"),
    };
  } else {
    tenant.rentIncrease = undefined;
  }

  /* ---------- ELECTRICITY ---------- */
  const electricityEnabled = fd.get("electricityEnabled") === "true";
  tenant.electricity = electricityEnabled
    ? {
        enabled: true,
        unitCost: Number(fd.get("unitCost") || 0),
        notifyBeforeBilling: fd.get("notifyBeforeBilling") === "true",
      }
    : { enabled: false };

  /* ---------- PHOTO ---------- */
  const photo = fd.get("photo");
  if (photo && photo.size > 0) {
    const buffer = Buffer.from(await photo.arrayBuffer());

    const upload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "rentflow/tenants" },
        (err, res) => (err ? reject(err) : resolve(res))
      ).end(buffer);
    });

    tenant.photoUrl = upload.secure_url;
  }

  await tenant.save();

  /* =====================================================
     🔁 SYNC RENT COLLECTION (VERY IMPORTANT)
     ===================================================== */

  const electricityPayload = tenant.electricity?.enabled
    ? {
        enabled: true,
        unitCost: tenant.electricity.unitCost,
        unitsConsumed: 0,
        electricityAmount: 0,
      }
    : {
        enabled: false,
        unitCost: 0,
        unitsConsumed: 0,
        electricityAmount: 0,
      };

  await Rent.updateMany(
    {
      tenantId: tenant._id,
      userId: session.user.id,
      status: { $ne: "paid" }, // 🚫 never touch paid rents
    },
    {
      $set: {
        tenantName: tenant.name,
        amount: newMonthlyRent,
        photoUrl: tenant.photoUrl || null,
        electricity: electricityPayload,
      },
    }
  );

  return NextResponse.json({ success: true });
}

/* =====================================================
   DELETE TENANT + ALL RELATED RENTS
   ===================================================== */
export async function DELETE(req, context) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await Rent.deleteMany({
    tenantId: id,
    userId: session.user.id,
  });

  await Tenant.deleteOne({
    _id: id,
    userId: session.user.id,
  });

  return NextResponse.json({ success: true });
}
