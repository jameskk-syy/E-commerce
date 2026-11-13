"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft, FiShoppingBag, FiHome, FiSearch } from "react-icons/fi";
import { HideChrome } from "./components/layout/AppChrome";

export default function NotFound() {
  return (
    <div
      data-not-found
      className="min-h-screen w-full bg-white flex flex-col justify-between p-6 sm:p-10"
    >
      <HideChrome />

      {/* Top Header / Brand */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-zinc-100">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-extrabold text-xs tracking-tighter group-hover:bg-indigo-600 transition">
            TH
          </div>
          <span className="font-extrabold text-lg tracking-tight text-zinc-950">
            tech<span className="text-indigo-600">hub</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition flex items-center gap-1.5"
        >
          <FiArrowLeft />
          <span>Back to store</span>
        </Link>
      </div>

      {/* Center 404 Hero Content */}
      <div className="w-full max-w-lg mx-auto py-12 flex flex-col items-center text-center">
        {/* Minimalist 404 Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 mb-6">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Error 404 &bull; Page Not Found</span>
        </div>

        {/* Large Aesthetic 404 Number */}
        <h1 className="text-7xl sm:text-8xl font-black tracking-tighter text-zinc-950 mb-3 font-sans">
          4<span className="text-indigo-600">0</span>4
        </h1>

        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-2">
          Lost in cyberspace?
        </h2>

        <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mb-8 leading-relaxed">
          The page or product you were looking for doesn&apos;t exist, has been removed, or was relocated.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
          <Link
            href="/"
            className="
              w-full
              py-3
              px-5
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
            "
          >
            <FiHome className="text-sm" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/cart"
            className="
              w-full
              py-3
              px-5
              rounded-xl
              bg-zinc-100
              hover:bg-zinc-200
              text-zinc-800
              text-xs
              font-bold
              transition
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <FiShoppingBag className="text-sm" />
            <span>View Your Bag</span>
          </Link>
        </div>

        {/* Quick Links Suggestions */}
        <div className="mt-12 pt-8 border-t border-zinc-100 w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-3">
            Popular Categories
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: "Smartphones", query: "Phone" },
              { label: "Laptops", query: "Laptop" },
              { label: "Smart Watches", query: "Watch" },
              { label: "Accessories", query: "Accessories" },
            ].map((cat) => (
              <Link
                key={cat.query}
                href={`/?category=${cat.query}`}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-950 transition"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Minimal Notice */}
      <div className="w-full max-w-4xl mx-auto pt-6 border-t border-zinc-100 text-center text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>&copy; {new Date().getFullYear()} TechHub Kenya. All rights reserved.</span>
        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500">
          <Link href="/" className="hover:text-zinc-900 transition">Store</Link>
          <Link href="/cart" className="hover:text-zinc-900 transition">Cart</Link>
          <Link href="/login" className="hover:text-zinc-900 transition">Account</Link>
        </div>
      </div>
    </div>
  );
}

