
"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return toast.error("Enter email & password");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }

    toast.success("Logged in successfully!");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
      bg-gray-100 dark:bg-[#0b1220] pt-24 px-4">

      <div className="w-full max-w-md bg-white dark:bg-[#111827] 
        shadow-xl rounded-2xl p-8 border dark:border-gray-700">

        <h2 className="text-3xl font-bold text-center mb-6 
          text-gray-800 dark:text-gray-100">
          Login
        </h2>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg mb-4 bg-white dark:bg-[#1b253a] 
          border dark:border-gray-600 text-gray-800 dark:text-gray-100"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD + EYE TOGGLE */}
        <div className="relative mb-2">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-white dark:bg-[#1b253a] 
              border dark:border-gray-600 text-gray-800 dark:text-gray-100 pr-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            className="absolute right-4 top-3 cursor-pointer text-gray-600 dark:text-gray-300"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        {/* FORGOT PASSWORD */}
        <div className="text-right mb-4">
          <Link
            href="/forgot"
            className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 
          text-white font-semibold py-3 rounded-lg"
        >
          Login
        </button>

        {/* REGISTER LINK */}
        <p className="mt-4 text-center text-gray-700 dark:text-gray-300">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-600 font-semibold">
            Register
          </Link>
        </p>

        {/* GOOGLE LOGIN */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full mt-5 flex items-center justify-center gap-2 border 
          bg-white dark:bg-[#1b253a] border-gray-300 dark:border-gray-600 
          text-gray-800 dark:text-gray-200 py-3 rounded-lg"
        >
          <img src="/google-icon.svg" className="w-5" />
          Continue with Google
        </button>

      </div>
    </div>
  );
}