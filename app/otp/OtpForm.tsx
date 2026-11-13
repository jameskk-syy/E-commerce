"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { FiArrowRight, FiShield, FiRefreshCw, FiCopy, FiCheck } from "react-icons/fi";
import axios from "axios";

const OtpForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get("email") || "kirugjames@gmail.com";
  const callbackUrl = searchParams?.get("callbackUrl") || "/admin";
  const initialDevCode = searchParams?.get("code") || "";

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [devCode, setDevCode] = useState<string | null>(initialDevCode || null);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Fetch active OTP for dev display if not already provided
  const fetchDevOtp = useCallback(async () => {
    try {
      const res = await axios.get(`/api/auth/dev-otp?email=${encodeURIComponent(emailParam)}`);
      if (res.data?.activeOtp) {
        setDevCode(res.data.activeOtp);
      }
    } catch {
      // Ignore in production
    }
  }, [emailParam]);

  useEffect(() => {
    if (!devCode) {
      fetchDevOtp();
    }
  }, [devCode, fetchDevOtp]);

  // Countdown timer for Resend Code
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input if digit entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const fillDevCode = (code: string) => {
    const digits = code.split("").slice(0, 6);
    setOtp(digits);
    if (inputRefs.current[5]) {
      inputRefs.current[5]?.focus();
    }
    toast.success("Auto-filled verification code!");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    setIsLoading(true);

    try {
      const callback = await signIn("credentials", {
        email: emailParam,
        otp: code,
        redirect: false,
      });

      if (callback?.ok) {
        toast.success("Identity verified! Welcome to TechHub");
        // Check if admin or redirect to callbackUrl
        if (emailParam.toLowerCase() === "kirugjames@gmail.com" || callbackUrl === "/admin") {
          router.push("/admin");
        } else {
          router.push(callbackUrl);
        }
        router.refresh();
      } else {
        toast.error(callback?.error || "Invalid or expired verification code");
      }
    } catch {
      toast.error("An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      const res = await axios.post("/api/auth/send-otp", { email: emailParam });
      if (res.data?.success) {
        setResendTimer(60);
        if (res.data?.devOtp) {
          setDevCode(res.data.devOtp);
        }
        toast.success(`A fresh 6-digit code was sent to ${emailParam}`);
      }
    } catch {
      toast.error("Failed to resend code. Please try again.");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Code copied to clipboard!");
  };

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
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 mb-3">
          <FiShield className="text-xs" />
          <span>Security Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
          Enter Verification Code
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          We sent a 6-digit security code to{" "}
          <span className="font-bold text-zinc-900">{emailParam}</span>.
        </p>
      </div>

      {/* Developer Test Mode Callout */}
      {devCode && (
        <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs">
          <div className="flex items-center justify-between font-bold text-amber-800 mb-1">
            <span className="flex items-center gap-1.5">
              <span>🛠️</span>
              <span>Development Testing Helper</span>
            </span>
            <button
              type="button"
              onClick={() => copyCode(devCode)}
              className="text-amber-700 hover:text-amber-950 inline-flex items-center gap-1 font-semibold"
            >
              {copied ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <p className="text-[11px] text-amber-700 mb-2">
            Email simulation active. Your generated security code is:
          </p>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-white border border-amber-200 font-mono text-sm font-extrabold text-amber-950 tracking-wider">
              {devCode}
            </span>
            <button
              type="button"
              onClick={() => fillDevCode(devCode)}
              className="px-3 py-1 rounded-md bg-amber-900 text-white font-bold text-[11px] hover:bg-amber-800 transition shadow-2xs"
            >
              Auto-fill Code
            </button>
          </div>
        </div>
      )}

      {/* OTP Inputs */}
      <form onSubmit={handleVerify} className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
          {otp.map((data, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="
                w-11
                h-13
                sm:w-13
                sm:h-14
                text-center
                text-lg
                sm:text-xl
                font-extrabold
                text-zinc-900
                border
                border-zinc-200
                rounded-xl
                bg-white
                focus:border-indigo-600
                focus:ring-2
                focus:ring-indigo-100
                outline-none
                transition
                shadow-2xs
              "
            />
          ))}
        </div>

        {/* Resend Code */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Didn&apos;t receive the email?</span>
          {resendTimer > 0 ? (
            <span className="text-zinc-400 font-medium">
              Resend in <span className="font-bold text-zinc-700">{resendTimer}s</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <FiRefreshCw className="text-[11px]" />
              <span>Resend code</span>
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || otp.join("").length < 6}
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
            disabled:opacity-50
            disabled:cursor-not-allowed
            cursor-pointer
          "
        >
          <span>{isLoading ? "Verifying code..." : "Verify Code & Sign In"}</span>
          <FiArrowRight className="text-xs" />
        </button>
      </form>

      {/* Alternative options */}
      <p className="text-center text-xs text-zinc-500 mt-8">
        Need to change account?{" "}
        <Link href="/login" className="text-indigo-600 font-bold hover:underline">
          Return to sign in
        </Link>
      </p>
    </div>
  );
};

export default OtpForm;
