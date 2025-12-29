import mongoose from "mongoose";

const RentSchema = new mongoose.Schema(
  {
    // 🔐 OWNER
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🧑 TENANT
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    tenantName: {
      type: String,
      required: true,
    },

    // 🖼️ AVATAR / PHOTO
    photoUrl: {
      type: String,
      default: null,
    },

    // 💰 BASE RENT ONLY (no electricity here)
    amount: {
      type: Number,
      required: true,
    },

    // 📅 PERIOD
    dueDate: {
      type: Date,
      required: true,
    },

    month: {
      type: Number,
      required: true,
      index: true,
    },

    year: {
      type: Number,
      required: true,
      index: true,
    },

    // 📌 STATUS
    status: {
      type: String,
      enum: ["pending", "paid", "overdue", "partial"],
      default: "pending",
      index: true,
    },

    // 💳 PAYMENT TRACKING
    paidAmount: {
      type: Number,
      default: 0,
    },

    // 🔁 DUE CARRY FORWARD
    dueNextMonth: {
      amount: {
        type: Number,
        default: 0,
      },
    },

    // previous month dues
    previousDue: {
      type: Number,
      default: 0,
    },

    // 🔔 ELECTRICITY REMINDER (CRON SAFE)
    electricityReminderSent: {
      type: Boolean,
      default: false,
    },

    // 🔌 ELECTRICITY (SEPARATE – NO DOUBLE COUNT)
    electricity: {
      enabled: {
        type: Boolean,
        default: false,
      },

      unitCost: {
        type: Number,
        default: 0,
      },

      unitsConsumed: {
        type: Number,
        default: 0,
      },

      electricityAmount: {
        type: Number,
        default: 0,
      },

      calculated: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Rent || mongoose.model("Rent", RentSchema);
