"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function ResetPassword() {
  const params = useSearchParams();
  const email = params.get("email");

  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
    setCanResend(true);
  }, [timer]);

  const getStrength = () => {
    if (password.length < 6) return "Weak";
    if (
      password.match(/[A-Z]/) &&
      password.match(/[0-9]/) &&
      password.match(/[^A-Za-z0-9]/)
    )
      return "Strong";
    return "Medium";
  };

  const resendOtp = async () => {
    if (!canResend) return;

    setCanResend(false);
    setTimer(30);

    const res = await fetch("/api/auth/send-otp-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success("📩 New OTP sent!");
  };

  const handleReset = async () => {
    if (!otp || !password || !confirmPass)
      return toast.error("All fields are required");

    if (password !== confirmPass)
      return toast.error("Passwords do not match");

    setLoading(true);

    const res = await fetch("/api/auth/verify-otp-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        otp,
        newPassword: password,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success("Password changed successfully!");

    setTimeout(() => router.push("/login"), 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 px-4 bg-gray-100 dark:bg-[#0b1220]">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] p-8 rounded-xl shadow-lg border dark:border-gray-700">

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
          Reset Password
        </h2>

        <input
          type="text"
          placeholder="Enter OTP"
          maxLength={6}
          className="w-full p-3 border rounded-lg mb-4 text-center tracking-widest dark:bg-[#1f2937] dark:border-gray-700"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={resendOtp}
          disabled={!canResend}
          className={`w-full py-2 rounded-lg mb-4 font-semibold ${
            canResend
              ? "text-blue-600 border border-blue-600"
              : "text-gray-400 border border-gray-500"
          }`}
        >
          {canResend ? "Resend OTP" : `Resend in ${timer}s`}
        </button>

        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            className="w-full p-3 border rounded-lg pr-12 dark:bg-[#1f2937] dark:border-gray-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            className="absolute right-4 top-3 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        {password && (
          <p
            className={`text-sm mb-3 ${
              getStrength() === "Weak"
                ? "text-red-500"
                : getStrength() === "Medium"
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            Password Strength: {getStrength()}
          </p>
        )}

        <div className="relative mb-6">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            className="w-full p-3 border rounded-lg pr-12 dark:bg-[#1f2937] dark:border-gray-700"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />

          <span
            className="absolute right-4 top-3 cursor-pointer"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : "Reset Password"}
        </button>

      </div>
    </div>
  );
}
