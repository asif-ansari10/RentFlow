"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    if (!email) return toast.error("Enter email");

    setLoading(true);

    const res = await fetch("/api/auth/send-otp-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success("OTP sent successfully!");
    router.push(`/reset?email=${email}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] p-8 rounded-lg shadow-xl">

        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-3 rounded-lg border mb-4 dark:bg-[#1f2937] dark:border-gray-700"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={sendOtp}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} /> Sending...
            </>
          ) : (
            "Send OTP"
          )}
        </button>

      </div>
    </div>
  );
}
