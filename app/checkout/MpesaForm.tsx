"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import Button from "../components/Button";
import Heading from "../components/Heading";
import toast from "react-hot-toast";

interface MpesaFormProps {
  handleSetPaymentSuccess: (value: boolean) => void;
}

const MpesaForm: React.FC<MpesaFormProps> = ({ handleSetPaymentSuccess }) => {
  const { cartTotalAmount, cartProducts, handleClearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("Nairobi");
  const [line1, setLine1] = useState("");
  const [postalCode, setPostalCode] = useState("00100");

  const [loading, setLoading] = useState(false);
  const [waitingForPin, setWaitingForPin] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up polling interval when component unmounts
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Poll order status once activeOrderId is set
  useEffect(() => {
    if (!activeOrderId || !waitingForPin) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/kopokopo/status/${activeOrderId}`);
        if (!res.ok) return;

        const data = await res.json();

        if (data.status === "complete") {
          clearInterval(interval);
          setWaitingForPin(false);
          toast.success(
            `Payment confirmed! M-Pesa Code: ${data.mpesaReceipt || "Completed"}`
          );
          handleClearCart();
          handleSetPaymentSuccess(true);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setWaitingForPin(false);
          toast.error("M-Pesa payment failed or was cancelled. Please try again.");
        }
      } catch (err) {
        console.error("Status polling error:", err);
      }
    }, 3000);

    pollIntervalRef.current = interval;

    // Timeout after 60 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (waitingForPin) {
        setWaitingForPin(false);
        toast(
          "Payment confirmation took longer than usual. If you entered your PIN, your order will update shortly under 'Orders'.",
          { icon: "ℹ️", duration: 6000 }
        );
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [activeOrderId, waitingForPin, handleClearCart, handleSetPaymentSuccess]);

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d]/g, "");
    if (val.startsWith("254")) val = val.slice(3);
    else if (val.startsWith("0")) val = val.slice(1);
    if (val.length > 9) val = val.slice(0, 9);
    setPhoneNumber(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cartProducts || cartProducts.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter your name for order tracking");
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.length < 9) {
      toast.error("Please enter a valid 9-digit Kenyan phone number (e.g. 712345678)");
      return;
    }

    if (!line1.trim()) {
      toast.error("Please enter your delivery street / building address");
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `+254${phoneNumber.trim()}`;

      const res = await fetch("/api/kopokopo/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartProducts,
          phoneNumber: fullPhone,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || null,
          address: {
            city: city.trim(),
            country: "KE",
            line1: line1.trim(),
            line2: null,
            postal_code: postalCode.trim(),
            state: city.trim(),
          },
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || data.error) {
        toast.error(
          typeof data.error === "string"
            ? data.error
            : data.error?.message || "Failed to initiate M-Pesa payment"
        );
        return;
      }

      toast.success("STK push prompt sent! Check your phone.");
      setActiveOrderId(data.orderId);
      setWaitingForPin(true);
    } catch (err: any) {
      setLoading(false);
      console.error(err);
      toast.error(err?.message || "Something went wrong sending STK prompt");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
      <div>
        <Heading title="Guest / Express Checkout" />
        <p className="text-xs text-slate-500 mt-1">
          No sign-in required! Enter your delivery details and phone number for instant M-Pesa STK push.
        </p>
      </div>

      {/* Customer Contact Details */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col gap-3">
        <h3 className="font-bold text-sm text-slate-800">1. Customer Contact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              disabled={loading || waitingForPin}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Jane Wanjiku"
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-xs outline-none focus:border-zinc-900"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              disabled={loading || waitingForPin}
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-xs outline-none focus:border-zinc-900"
            />
          </div>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col gap-3">
        <h3 className="font-bold text-sm text-slate-800">2. Delivery Destination</h3>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">
            Street Address / Building / Apartment *
          </label>
          <input
            type="text"
            required
            disabled={loading || waitingForPin}
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            placeholder="e.g. Westlands, Chiromo Road, Apt 4B"
            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-xs outline-none focus:border-zinc-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Town / City
            </label>
            <input
              type="text"
              required
              disabled={loading || waitingForPin}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Nairobi"
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-xs outline-none focus:border-zinc-900"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Postal Code
            </label>
            <input
              type="text"
              disabled={loading || waitingForPin}
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g. 00100"
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-xs outline-none focus:border-zinc-900"
            />
          </div>
        </div>
      </div>

      {/* M-Pesa Phone Input with +254 Mask */}
      <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-emerald-900">3. M-Pesa Payment Details</h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
            Safaricom M-Pesa
          </span>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">
            Safaricom Phone Number for STK Push *
          </label>
          <div className="relative flex items-center">
            {/* +254 Mask Badge */}
            <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none">
              <span className="text-sm">🇰🇪</span>
              <span className="text-xs font-bold text-zinc-700 font-mono">+254</span>
              <span className="text-zinc-300">|</span>
            </div>

            <input
              type="tel"
              required
              disabled={loading || waitingForPin}
              value={phoneNumber}
              onChange={handlePhoneInput}
              placeholder="712 345 678"
              maxLength={9}
              className="
                w-full
                p-2.5
                pl-24
                pr-4
                border
                border-emerald-300
                rounded-xl
                bg-white
                text-xs
                font-mono
                tracking-wider
                outline-none
                focus:border-emerald-600
                focus:ring-2
                focus:ring-emerald-100
              "
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            We will prompt this phone number with a pop-up to enter your M-Pesa PIN.
          </p>
        </div>
      </div>

      {/* Total Amount in KES */}
      <div className="p-3 bg-zinc-900 text-white rounded-xl flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-300">Total Payable:</span>
        <span className="text-lg font-extrabold text-emerald-400 font-sans">
          KES {cartTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Waiting Prompt State */}
      {waitingForPin && (
        <div className="border-2 border-dashed border-emerald-400 bg-emerald-50 rounded-xl p-5 text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <h4 className="font-bold text-emerald-900 text-sm">
              STK Push Prompt Sent to Your Phone!
            </h4>
            <p className="text-xs text-emerald-700 mt-1">
              Please unlock your phone, check for the Safaricom pop-up, and enter your M-Pesa PIN.
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!waitingForPin && (
        <Button
          label={
            loading
              ? "Sending STK Prompt..."
              : `Pay KES ${cartTotalAmount.toLocaleString()} with M-Pesa`
          }
          disabled={loading || waitingForPin}
          onClick={() => {}}
        />
      )}
    </form>
  );
};

export default MpesaForm;
