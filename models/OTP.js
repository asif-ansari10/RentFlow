import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otpHash: { type: String, required: true },
  purpose: { type: String, required: true }, // "register" or "reset"
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // OTP auto-deletes after 10 minutes (600 seconds)
  },
});

export default mongoose.models.OTP || mongoose.model("OTP", otpSchema);
