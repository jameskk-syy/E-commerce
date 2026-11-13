"use client";

import React, { useState, useEffect } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Link from "next/link";
import { AiOutlineGoogle } from "react-icons/ai";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiArrowRight, FiPhone } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SafeUser } from "@/types";

interface RegisterFormProps {
  currentUser: SafeUser | null;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ currentUser }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      router.push("/");
      router.refresh();
    }
  }, [currentUser, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
  });

  const rawPhone = watch("phoneNumber") || "";

  // Helper to format phone with +254 prefix
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d]/g, "");
    // If user starts typing with 254 or 0, trim leading 0 or 254
    if (val.startsWith("254")) val = val.slice(3);
    else if (val.startsWith("0")) val = val.slice(1);

    // Limit to 9 digits (e.g. 712345678)
    if (val.length > 9) val = val.slice(0, 9);
    setValue("phoneNumber", val, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    const fullPhone = data.phoneNumber ? `+254${data.phoneNumber}` : "";

    axios
      .post("/api/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        phoneNumber: fullPhone,
      })
      .then(() => {
        toast.success("Customer account created successfully!");

        signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        }).then((callback) => {
          if (callback?.ok) {
            router.push("/");
            router.refresh();
            toast.success("Signed in!");
          }
          if (callback?.error) {
            toast.error(callback.error);
          }
        });
      })
      .catch((err) => {
        const message =
          err?.response?.data?.error ||
          err?.response?.data ||
          "Something went wrong creating your account";
        toast.error(typeof message === "string" ? message : "Failed to register");
      })
      .finally(() => setIsLoading(false));
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
          <span>Customer Registration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
          Create an Account
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Join TechHub to track your orders, receive M-Pesa payment receipts, and manage your deliveries.
        </p>
      </div>

      {/* Google Sign-up */}
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
          or register with email
        </span>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Full Name Input */}
        <div>
          <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
            Full name
          </label>
          <div className="relative flex items-center">
            <FiUser className="absolute left-3.5 text-zinc-400 text-sm pointer-events-none" />
            <input
              id="name"
              type="text"
              disabled={isLoading}
              {...register("name", { required: "Full name is required" })}
              placeholder="e.g. John Kamau"
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
                  errors.name
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-100"
                }
              `}
            />
          </div>
          {errors.name && (
            <span className="text-[11px] text-rose-500 mt-1 block">
              {errors.name.message as string}
            </span>
          )}
        </div>

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
              disabled={isLoading}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
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

        {/* Kenyan Phone Number Input with +254 Mask */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-zinc-700 block">
              M-Pesa Phone Number
            </label>
            <span className="text-[11px] text-zinc-400">For M-Pesa & Order Delivery</span>
          </div>
          <div className="relative flex items-center">
            {/* +254 Mask Badge */}
            <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none">
              <span className="text-sm">🇰🇪</span>
              <span className="text-xs font-bold text-zinc-700 font-mono">+254</span>
              <span className="text-zinc-300">|</span>
            </div>

            <input
              id="phoneNumber"
              type="tel"
              disabled={isLoading}
              value={rawPhone}
              onChange={handlePhoneChange}
              placeholder="712 345 678"
              maxLength={9}
              className="
                w-full
                py-2.5
                pl-24
                pr-4
                text-xs
                font-mono
                tracking-wider
                border
                border-zinc-200
                rounded-xl
                bg-white
                text-zinc-900
                placeholder-zinc-400
                focus:border-zinc-900
                focus:ring-2
                focus:ring-zinc-100
                focus:outline-none
                transition
              "
            />
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Example: Enter 712345678 (formatted as +254 712 345 678)
          </p>
        </div>

        {/* Password Input */}
        <div>
          <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
            Password
          </label>
          <div className="relative flex items-center">
            <FiLock className="absolute left-3.5 text-zinc-400 text-sm pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              disabled={isLoading}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
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
          disabled={isLoading}
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
          <span>{isLoading ? "Creating customer account..." : "Register as Customer"}</span>
          <FiArrowRight className="text-xs" />
        </button>
      </form>

      {/* Footer link */}
      <p className="text-center text-xs text-zinc-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
