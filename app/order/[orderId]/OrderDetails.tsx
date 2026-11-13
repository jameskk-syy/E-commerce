"use client";

import React, { useState } from "react";
import Status from "@/app/components/Status";
import { formatPrice } from "@/utils/formatPrice";
import moment from "moment";
import { MdAccessTimeFilled, MdDone, MdDeliveryDining, MdClose } from "react-icons/md";
import { FiCheck, FiSmartphone, FiArrowLeft, FiClock, FiShield } from "react-icons/fi";
import OrderItem from "./OrderItem";
import Link from "next/link";
import toast from "react-hot-toast";

interface OrderDetailsProps {
  order: any;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const [retrying, setRetrying] = useState(false);
  const [orderState, setOrderState] = useState(order);

  const isKES = orderState.currency?.toUpperCase() === "KES";
  const displayAmount = isKES
    ? `KES ${orderState.amount?.toLocaleString()}`
    : formatPrice(orderState.amount);

  const handleRetryMpesa = async () => {
    const phone = window.prompt(
      "Enter your M-Pesa Phone Number to resend STK Push (e.g. 0712345678):",
      orderState.phoneNumber || ""
    );

    if (!phone) return;

    setRetrying(true);
    toast("Sending new STK Push prompt to your phone...");

    try {
      const res = await fetch("/api/kopokopo/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderState.products,
          phoneNumber: phone,
          address: orderState.address,
        }),
      });

      const data = await res.json();
      setRetrying(false);

      if (res.ok && data.success) {
        toast.success("STK push sent! Please enter your PIN on your phone.");
      } else {
        toast.error(data.error || "Failed to trigger M-Pesa prompt");
      }
    } catch (err: any) {
      setRetrying(false);
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Back button & Heading */}
      <div className="mb-6">
        <Link
          href="/orders"
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 inline-flex items-center gap-1.5 mb-3 transition"
        >
          <FiArrowLeft />
          <span>Back to All Orders</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
              Order #{orderState.id}
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Placed {moment(orderState.createDate).format("MMMM Do YYYY, h:mm a")} ({moment(orderState.createDate).fromNow()})
            </p>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-950 font-sans">
            {displayAmount}
          </div>
        </div>
      </div>

      {/* M-Pesa & Payment Status Banner */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
              orderState.status === "complete"
                ? "bg-emerald-100 text-emerald-800"
                : orderState.status === "failed"
                ? "bg-rose-100 text-rose-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {orderState.status === "complete" ? (
              <FiCheck className="text-xl" />
            ) : orderState.status === "failed" ? (
              <MdClose className="text-xl" />
            ) : (
              <FiClock className="text-xl" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                Payment Status:
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  orderState.status === "complete"
                    ? "bg-emerald-100 text-emerald-800"
                    : orderState.status === "failed"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {orderState.status === "complete"
                  ? "Paid & Confirmed"
                  : orderState.status === "failed"
                  ? "Payment Failed"
                  : "Awaiting PIN Prompt"}
              </span>
            </div>

            {orderState.mpesaReceipt ? (
              <p className="text-xs text-emerald-700 font-mono mt-0.5">
                M-Pesa Receipt Code: <strong>{orderState.mpesaReceipt}</strong>
              </p>
            ) : orderState.status === "pending" ? (
              <p className="text-xs text-zinc-500 mt-0.5">
                An STK push was sent to {orderState.phoneNumber || "your phone"}.
              </p>
            ) : null}
          </div>
        </div>

        {/* Retry Payment if Pending or Failed */}
        {orderState.status !== "complete" && (
          <button
            onClick={handleRetryMpesa}
            disabled={retrying}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
          >
            <FiSmartphone />
            <span>{retrying ? "Sending..." : "Retry M-Pesa Payment"}</span>
          </button>
        )}
      </div>

      {/* Delivery Tracking Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs mb-8">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
          Delivery Progress
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Order Placed</p>
              <p className="text-[10px] text-zinc-400">Received by store</p>
            </div>
          </div>

          <div className="h-0.5 flex-1 bg-zinc-200 mx-3"></div>

          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                orderState.deliveryStatus === "dispatched" || orderState.deliveryStatus === "delivered"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-zinc-100 text-zinc-400"
              }`}
            >
              <MdDeliveryDining />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Dispatched</p>
              <p className="text-[10px] text-zinc-400">On the way</p>
            </div>
          </div>

          <div className="h-0.5 flex-1 bg-zinc-200 mx-3"></div>

          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                orderState.deliveryStatus === "delivered"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-zinc-100 text-zinc-400"
              }`}
            >
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Delivered</p>
              <p className="text-[10px] text-zinc-400">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Products Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100">
          Items in this Order
        </h3>

        <div className="grid grid-cols-5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-100">
          <div className="col-span-2">Product</div>
          <div className="text-center">Price</div>
          <div className="text-center">Quantity</div>
          <div className="text-right">Total</div>
        </div>

        <div className="divide-y divide-zinc-100">
          {orderState.products &&
            orderState.products.map((item: any) => {
              return <OrderItem key={item.id} item={item} />;
            })}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
