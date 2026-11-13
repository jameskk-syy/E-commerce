"use client";

import React, { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Link from "next/link";
import { AiOutlineGoogle } from "react-icons/ai";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield } from "react-icons/fi";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { SafeUser } from "@/types";
import axios from "axios";

interface LoginFormProps {
  currentUser: SafeUser | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ currentUser }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "ADMIN") {
        router.push("/admin");
      } else if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push("/cart");
      }
      router.refresh();
    }
  }, [currentUser, callbackUrl, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = watch("email");

  const fillAdminCredentials = () => {
    setValue("email", "kirugjames@gmail.com");
    setValue("password", "Admin@254!");
    toast.success("Loaded admin credentials");
  };

  const handleSendOtp = async () => {
    const email = emailValue || "kirugjames@gmail.com";
    setOtpLoading(true);

    try {
      const res = await axios.post("/api/auth/send-otp", { email });
      if (res.data?.success) {
        toast.success(`Security code sent to ${email}`);
        const devCodeParam = res.data?.devOtp ? `&code=${res.data.devOtp}` : "";
        router.push(`/otp?email=${encodeURIComponent(email)}${devCodeParam}&callbackUrl=/admin`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to dispatch security code";
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
      // 1. Verify credentials and dispatch 6-digit security code to email
      const res = await axios.post("/api/auth/send-otp", {
        email: data.email,
        password: data.password,
        verifyPassword: true,
      });

      if (res.data?.success) {
        toast.success("Password verified! Security code sent to your email.");
        const devCodeParam = res.data?.devOtp ? `&code=${res.data.devOtp}` : "";
        const destination =
          callbackUrl ||
          (data.email.toLowerCase() === "kirugjames@gmail.com" || res.data?.role === "ADMIN"
            ? "/admin"
            : "/");

        // 2. Redirect to dedicated /otp page
        router.push(
          `/otp?email=${encodeURIComponent(data.email)}${devCodeParam}&callbackUrl=${encodeURIComponent(
            destination
          )}`
        );
      }
    } catch (err: any) {
      setIsLoading(false);
      const msg =
        err?.response?.data?.error ||
        "Invalid email or password. Please verify your credentials.";
      toast.error(msg);
    }
  };

  if (currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-zinc-700">Already signed in. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 flex flex-col justify-center">
      {/* Top Brand & Back to Store Link */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-extrabold text-xs tracking-tighter group-hover:bg-indigo-600 transition">
            TH
          </div>
          <span className="font-extrabold text-base tracking-tight text-zinc-950">
            tech<span className="text-indigo-600">hub</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition flex items-center gap-1"
        >
          <span>Back to store</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-800 mb-3">
          <span>Security Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Sign in to track orders, manage your cart, or access the admin console.
        </p>
      </div>

      {/* Quick Admin Test Banner */}
      <div className="mb-5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-zinc-900 block text-[11px]">Admin Credentials</span>
          <span className="text-zinc-500 text-[11px]">kirugjames@gmail.com</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="px-2.5 py-1 rounded-lg bg-white border border-zinc-300 hover:border-zinc-400 font-bold text-zinc-700 text-[11px] transition shadow-2xs"
          >
            Fill Login
          </button>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={otpLoading}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] transition inline-flex items-center gap-1 shadow-2xs"
          >
            <FiShield className="text-xs" />
            <span>{otpLoading ? "Sending..." : "Send OTP"}</span>
          </button>
        </div>
      </div>

      {/* Google Login */}
      <button
        type="button"
        onClick={() => signIn("google")}
        className="
          w-full
          py-2.5
          px-4
          rounded-xl
          border
          border-zinc-200
          hover:border-zinc-400
          bg-white
          text-zinc-800
          text-xs
          font-bold
          transition
          flex
          items-center
          justify-center
          gap-2.5
          shadow-2xs
          mb-5
        "
      >
        <AiOutlineGoogle className="text-lg text-rose-500" />
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-5">
        <div className="border-t border-zinc-200 w-full"></div>
        <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold absolute">
          or with email
        </span>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Email Input */}
        <div>
          <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
            Email address
          </label>
          <div className="relative flex items-center">
            <FiMail className="absolute left-3.5 text-zinc-400 text-sm pointer-events-none" />
            <input
              id="email"
              type="email"
              disabled={isLoading || otpLoading}
              {...register("email", { required: "Email is required" })}
              placeholder="you@example.com"
              className={`
                w-full
                py-2.5
                pl-10
                pr-4
                text-xs
                border
                rounded-xl
                bg-white
                text-zinc-900
                placeholder-zinc-400
                focus:outline-none
                focus:ring-2
                transition
                ${
                  errors.email
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-100"
                }
              `}
            />
          </div>
          {errors.email && (
            <span className="text-[11px] text-rose-500 mt-1 block">
              {errors.email.message as string}
            </span>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-zinc-700 block">
              Password
            </label>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpLoading}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold transition inline-flex items-center gap-1"
            >
              <FiShield />
              <span>{otpLoading ? "Sending OTP..." : "Sign in with OTP instead"}</span>
            </button>
          </div>
          <div className="relative flex items-center">
            <FiLock className="absolute left-3.5 text-zinc-400 text-sm pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              disabled={isLoading || otpLoading}
              {...register("password", { required: "Password is required" })}
              placeholder="••••••••"
              className={`
                w-full
                py-2.5
                pl-10
                pr-10
                text-xs
                border
                rounded-xl
                bg-white
                text-zinc-900
                placeholder-zinc-400
                focus:outline-none
                focus:ring-2
                transition
                ${
                  errors.password
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-100"
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-zinc-400 hover:text-zinc-600 transition"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <FiEyeOff className="text-sm" />
              ) : (
                <FiEye className="text-sm" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-[11px] text-rose-500 mt-1 block">
              {errors.password.message as string}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || otpLoading}
          className="
            w-full
            py-3
            px-4
            rounded-xl
            bg-zinc-950
            hover:bg-zinc-800
            text-white
            text-xs
            font-bold
            transition
            shadow-sm
            flex
            items-center
            justify-center
            gap-2
            mt-2
            disabled:opacity-60
            disabled:cursor-not-allowed
            cursor-pointer
          "
        >
          <span>{isLoading ? "Verifying & Sending OTP..." : "Sign in & Verify with OTP"}</span>
          <FiArrowRight className="text-xs" />
        </button>
      </form>

      {/* Footer link */}
      <p className="text-center text-xs text-zinc-500 mt-6">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="text-indigo-600 font-bold hover:underline">
          Create one now
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
