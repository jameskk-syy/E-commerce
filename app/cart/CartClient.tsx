"use client";

import { useCart } from "@/hooks/useCart";
import React from "react";
import Link from "next/link";
import { FiArrowLeft, FiShoppingBag, FiTrash2, FiSmartphone } from "react-icons/fi";
import ItemContent from "./ItemContent";
import { formatPrice } from "@/utils/formatPrice";
import { SafeUser } from "@/types";
import { useRouter } from "next/navigation";

interface CartClientProps {
  currentUser: SafeUser | null;
}

const CartClient: React.FC<CartClientProps> = ({ currentUser }) => {
  const router = useRouter();
  const { cartProducts, handleClearCart, cartTotalAmount } = useCart();

  if (!cartProducts || cartProducts.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-2xl mb-4">
          <FiShoppingBag />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-sm text-zinc-500 max-w-sm mb-6">
          Looks like you haven&apos;t added any items to your bag yet. Explore our latest electronics and tech essentials.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-sm inline-flex items-center gap-2"
        >
          <FiArrowLeft />
          <span>Start Shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Title */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200/80 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">
            Shopping Cart
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Review your selected devices before proceeding to M-Pesa or Card checkout.
          </p>
        </div>
        <button
          onClick={handleClearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 transition"
        >
          <FiTrash2 className="text-xs" />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Cart Items Table Header */}
      <div className="hidden sm:grid grid-cols-5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 pb-3 border-b border-zinc-100">
        <div className="col-span-2">Product</div>
        <div className="text-center">Price</div>
        <div className="text-center">Quantity</div>
        <div className="text-right">Total</div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-zinc-100">
        {cartProducts.map((product) => (
          <ItemContent key={product.id} item={product} />
        ))}
      </div>

      {/* Cart Summary Card */}
      <div className="mt-8 pt-6 border-t border-zinc-200/80 flex flex-col sm:flex-row justify-between gap-8 items-start">
        <Link
          href="/"
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-2 transition"
        >
          <FiArrowLeft />
          <span>Continue Shopping</span>
        </Link>

        <div className="w-full sm:w-80 bg-zinc-50 rounded-2xl p-6 border border-zinc-200/80 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-zinc-900 pb-2 border-b border-zinc-200/60">
            Order Summary
          </h3>

          <div className="flex justify-between text-xs text-zinc-600">
            <span>Subtotal</span>
            <span className="font-semibold text-zinc-900">{formatPrice(cartTotalAmount)}</span>
          </div>

          <div className="flex justify-between text-xs text-zinc-500">
            <span>Delivery in Kenya</span>
            <span className="text-emerald-600 font-medium">Calculated at checkout</span>
          </div>

          <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-zinc-900">Total Payable</span>
            <span className="text-lg font-black text-zinc-950">
              {formatPrice(cartTotalAmount)}
            </span>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="w-full py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiSmartphone className="text-sm text-emerald-400" />
            <span>Proceed to Checkout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartClient;
