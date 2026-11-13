"use client";

import { useCart } from "@/hooks/useCart";
import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsOptions, loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import CheckOutForm from "./CheckOutForm";
import MpesaForm from "./MpesaForm";
import Button from "../components/Button";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

type PaymentMethodType = "mpesa" | "stripe";

const CheckoutClient = () => {
  const router = useRouter();

  const { cartProducts, paymentIntent, handleSetPaymentIntent } = useCart();
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodType>("mpesa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Initialize Stripe intent only if Stripe is selected or available
  useEffect(() => {
    if (cartProducts && selectedMethod === "stripe" && !clientSecret) {
      setLoading(true);
      setError(false);

      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          items: cartProducts,
          payment_intent_id: paymentIntent,
        }),
      })
        .then((res) => {
          setLoading(false);
          if (res.status === 401) {
            return router.push("/login");
          }
          return res.json();
        })
        .then((data) => {
          if (data?.paymentIntent?.client_secret) {
            setClientSecret(data.paymentIntent.client_secret);
            handleSetPaymentIntent(data.paymentIntent.id);
          }
        })
        .catch((error) => {
          setError(true);
          console.error("Stripe init error:", error);
          toast.error("Something went wrong initializing card checkout");
        });
    }
  }, [cartProducts, paymentIntent, selectedMethod, clientSecret, router, handleSetPaymentIntent]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      labels: "floating",
    },
  };

  const handleSetPaymentSuccess = useCallback((value: boolean) => {
    setPaymentSuccess(value);
  }, []);

  return (
    <div className="w-full max-w-[650px] mx-auto">
      {paymentSuccess ? (
        <div className="flex items-center flex-col gap-4 py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-bold">
            ✓
          </div>
          <div className="text-emerald-600 text-xl font-bold text-center">
            Payment Received & Order Confirmed!
          </div>
          <p className="text-slate-500 text-sm text-center max-w-sm">
            Thank you for your purchase. Your order is being processed and you can track it anytime.
          </p>
          <div className="max-w-[220px] w-full mt-2">
            <Button
              label="View Your Orders"
              onClick={() => router.push("/orders")}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Payment Method Selector Tabs */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">
              Select Payment Method:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMethod("mpesa")}
                className={`p-3 rounded-lg border-2 text-sm font-bold flex items-center justify-center gap-2 transition ${
                  selectedMethod === "mpesa"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                M-Pesa (Kopo Kopo)
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("stripe")}
                className={`p-3 rounded-lg border-2 text-sm font-bold flex items-center justify-center gap-2 transition ${
                  selectedMethod === "stripe"
                    ? "border-blue-600 bg-blue-50 text-blue-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Credit / Debit Card
              </button>
            </div>
          </div>

          {/* M-PESA Checkout Form */}
          {selectedMethod === "mpesa" && (
            <MpesaForm handleSetPaymentSuccess={handleSetPaymentSuccess} />
          )}

          {/* STRIPE Card Checkout Form */}
          {selectedMethod === "stripe" && (
            <>
              {loading && (
                <div className="text-center py-6 text-slate-500">
                  Loading Card Checkout...
                </div>
              )}
              {error && (
                <div className="text-center text-rose-500 py-6">
                  Something went wrong loading card payments...
                </div>
              )}
              {clientSecret && cartProducts && (
                <Elements options={options} stripe={stripePromise}>
                  <CheckOutForm
                    clientSecret={clientSecret}
                    handleSetPaymentSuccess={handleSetPaymentSuccess}
                  />
                </Elements>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckoutClient;
