"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Register() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [confirmPass, setConfirmPass] = useState("");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // RESEND OTP TIMER
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
    if (timer === 0) setCanResend(true);
  }, [timer, step]);

  // Password Strength
  const getStrength = () => {
    const p = form.password;
    if (p.length < 6) return "Weak";
    if (/[A-Z]/.test(p) && /\d/.test(p) && p.length >= 8) return "Strong";
    return "Medium";
  };

  // ---------------------------------------------------
  // SEND OTP WITH TOASTS
  // ---------------------------------------------------
  const requestOtp = async () => {
    if (!form.name || !form.email || !form.password)
      return toast.error("⚠️ All fields are required");

    if (form.password !== confirmPass)
      return toast.error("❌ Passwords do not match");

    setLoading(true);

    const res = await fetch("/api/auth/send-otp-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(`❌ ${data.message}`);
      return;
    }

    toast.success("📩 OTP sent to your email");
    setStep(2);
    setTimer(30);
    setCanResend(false);
  };

  // ---------------------------------------------------
  // RESEND OTP WITH TOASTS
  // ---------------------------------------------------
  const resendOtp = async () => {
    if (!canResend) return;

    setCanResend(false);
    setTimer(30);

    const res = await fetch("/api/auth/send-otp-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(`❌ ${data.message}`);
      return;
    }

    toast.success("🔁 New OTP sent!");
  };

  // ---------------------------------------------------
  // VERIFY OTP + REGISTER (WITH TOASTS)
  // ---------------------------------------------------
  const verifyAndRegister = async () => {
    if (!otp) return toast.error("⚠️ Enter OTP");

    setLoading(true);

    const res = await fetch("/api/auth/verify-otp-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, otp }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(`❌ ${data.message}`);
      return;
    }

    toast.success("🎉 Account created successfully!");

    setTimeout(() => router.push("/login"), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0b1220] pt-24 px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] shadow-xl rounded-2xl p-6 border dark:border-gray-700">

        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
          {step === 1 ? "Create Account" : "Verify OTP"}
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 rounded-lg mb-4 bg-white dark:bg-[#1b253a] 
                         border dark:border-gray-600 text-gray-800 dark:text-gray-100"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-lg mb-4 bg-white dark:bg-[#1b253a] 
                         border dark:border-gray-600 text-gray-800 dark:text-gray-100"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            {/* PASSWORD */}
            <div className="relative mb-3">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                className="w-full p-3 rounded-lg pr-10 border dark:border-gray-600 
                           bg-white dark:bg-[#1b253a] text-gray-800 dark:text-gray-100"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            {/* Password Strength */}
            {form.password && (
              <p
                className={`text-sm mb-3 ${
                  getStrength() === "Weak"
                    ? "text-red-500"
                    : getStrength() === "Medium"
                    ? "text-yellow-500"
                    : "text-green-600"
                }`}
              >
                Password Strength: {getStrength()}
              </p>
            )}

            {/* CONFIRM */}
            <div className="relative mb-6">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full p-3 rounded-lg pr-10 border dark:border-gray-600 
                         bg-white dark:bg-[#1b253a] text-gray-800 dark:text-gray-100"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            {/* Continue */}
            <button
              onClick={requestOtp}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 
                         rounded-lg font-semibold flex items-center justify-center gap-2
                         disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Continue (Send OTP)"}
            </button>

            {/* Google */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full mt-4 flex items-center justify-center gap-2 border 
                         bg-white dark:bg-[#1b253a] border-gray-300 dark:border-gray-600 
                         py-3 rounded-lg text-gray-800 dark:text-gray-200"
            >
              <img src="/google-icon.svg" className="w-5" />
              Continue with Google
            </button>

            <p className="mt-4 text-center text-gray-700 dark:text-gray-300">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-semibold">
                Login
              </Link>
            </p>
          </>
        )}

        {/* STEP 2 – OTP */}
        {step === 2 && (
          <>
            <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
              OTP sent to <br />
              <span className="font-semibold">{form.email}</span>
            </p>

            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              className="w-full p-3 border rounded-lg text-center tracking-widest text-2xl 
                         bg-white dark:bg-[#1b253a] dark:border-gray-600 text-gray-800 dark:text-gray-100 mb-4"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            {/* RESEND OTP + TIMER */}
            <button
              onClick={resendOtp}
              disabled={!canResend}
              className={`w-full py-2 rounded-lg mb-3 font-semibold 
                          ${
                            canResend
                              ? "text-blue-600 border border-blue-600"
                              : "text-gray-400 border border-gray-500"
                          }`}
            >
              {canResend ? "Resend OTP" : `Resend in ${timer}s`}
            </button>

            <button
              onClick={verifyAndRegister}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 
                         rounded-lg font-semibold flex items-center justify-center gap-2
                         disabled:opacity-60"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Verify & Register"}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full mt-3 py-3 rounded-lg border text-gray-700 dark:text-gray-300"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
