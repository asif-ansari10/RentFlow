
import mongoose from "mongoose";
const { Schema } = mongoose;

const TenantSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ---------- BASIC INFO ---------- */
    name: { type: String, required: true },
    email: String,
    phone: { type: String, required: true },
    whatsapp: String,
    address: { type: String, required: true },

    /* ---------- OPTIONAL MEDIA ---------- */
    photoUrl: { type: String }, // image
    agreementFile: {
      url: String,
      publicId: String,
    }, // pdf

    /* ---------- RENT ---------- */
    rent: {
      monthly: { type: Number, required: true },
      advance: { type: Number, default: 0 },
      billingCycle: {
        type: String,
        enum: ["Monthly", "Every 2 Months", "Every 3 Months"],
        default: "Monthly",
      },
      billingDate: { type: Number, default: 1 },
      gracePeriod: { type: Number, default: 5 },
    },

    /* ---------- OPTIONAL RENT INCREASE ---------- */
    rentIncrease: {
      percentage: Number,
      after: Number,
      cycle: {
        type: String,
        enum: ["Monthly", "Yearly"],
      },
    },

    /* ---------- OPTIONAL ELECTRICITY ---------- */
    electricity: {
      enabled: { type: Boolean, default: false },
      unitCost: { type: Number, default: 0 },
      currentUnits: { type: Number, default: 0 },
      notifyBeforeBilling: { type: Boolean, default: false },
    },

    /* ---------- AGREEMENT ---------- */
    agreement: {
      startDate: { type: Date, required: true },
      tenure: {
        years: Number,
        months: Number,
        days: Number,
      },
    },

    notifications: {
      notifyBeforeAgreementEnd: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Tenant ||
  mongoose.model("Tenant", TenantSchema);
