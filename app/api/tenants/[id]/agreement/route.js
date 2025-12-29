import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req, context) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ FIX: await params
    const { id } = await context.params;

    const formData = await req.formData();

    const startDate = formData.get("startDate");
    const years = Number(formData.get("years") || 0);
    const months = Number(formData.get("months") || 0);
    const days = Number(formData.get("days") || 0);
    const file = formData.get("agreementFile");

    const tenant = await Tenant.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!tenant) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }

    // Ensure agreement exists
    if (!tenant.agreement) {
      tenant.agreement = {};
    }

    // Update agreement fields
    if (startDate) {
      tenant.agreement.startDate = new Date(startDate);
    }

    tenant.agreement.tenure = {
      years,
      months,
      days,
    };

    // Upload new PDF if provided
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const upload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "rentflow/agreements",
            resource_type: "raw",
          },
          (err, res) => (err ? reject(err) : resolve(res))
        ).end(buffer);
      });

      tenant.agreementFile = {
        url: upload.secure_url,
        publicId: upload.public_id,
      };
    }

    // 🔥 VERY IMPORTANT
    tenant.markModified("agreement");

    await tenant.save();

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("AGREEMENT UPDATE ERROR:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
