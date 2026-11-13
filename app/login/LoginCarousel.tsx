"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const slides = [
  {
    tag: "Flagship Collection",
    title: "Next-Generation Devices & Accessories",
    desc: "Discover hand-picked electronics, mechanical keyboards, and audio peripherals with official warranty.",
    image: "https://firebasestorage.googleapis.com/v0/b/ecommerce-shop-cc542.appspot.com/o/products%2F1688622161445-iphone14-white.png?alt=media&token=fe2065e5-fdfe-4a6f-baa6-380b5fad90b8",
    badge: "Official TechHub Store",
  },
  {
    tag: "Instant Mobile Checkout",
    title: "Pay Seamlessly with Safaricom M-Pesa",
    desc: "Powered by Kopo Kopo v4 API. Enter your PIN on your phone and get real-time order confirmation in seconds.",
    image: "https://firebasestorage.googleapis.com/v0/b/ecommerce-shop-cc542.appspot.com/o/products%2F1688041293609-watch-black.jpg?alt=media&token=270f918c-d9f5-41a2-ad32-45d5f3c66bf0",
    badge: "Kopo Kopo Integrated",
  },
  {
    tag: "Admin & Operations",
    title: "Real-Time Inventory & Payment Tracking",
    desc: "Manage product stock levels, view incoming M-Pesa receipts, and monitor sales metrics from the dashboard.",
    image: "https://firebasestorage.googleapis.com/v0/b/ecommerce-shop-cc542.appspot.com/o/products%2F1688529886610-black-logitech-keyboard.jpg?alt=media&token=353aa276-1316-4e50-bc26-8e3828fe6cdd",
    badge: "Admin Suite Enabled",
  },
];

const LoginCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 text-white p-10 md:p-14 flex flex-col justify-between overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Top Branding */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-extrabold text-sm tracking-tighter">
            TH
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            tech<span className="text-indigo-400">hub</span>
          </span>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/10 text-zinc-300 border border-white/10">
          Kenya • Nairobi
        </span>
      </div>

      {/* Center Showcase with Smooth Transition */}
      <div className="relative z-10 my-auto py-8 flex flex-col items-center text-center">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/5 rounded-full blur-xl"></div>
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            className="object-contain p-4 drop-shadow-2xl transition-all duration-700 ease-out"
          />
        </div>

        <div className="max-w-md space-y-3">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-500/30">
            {slides[current].tag}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
            {slides[current].title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
            {slides[current].desc}
          </p>
        </div>
      </div>

      {/* Bottom Dots Navigation */}
      <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/10">
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current === idx ? "w-8 bg-indigo-400" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
        <span className="text-[11px] text-zinc-400 font-mono">
          {slides[current].badge}
        </span>
      </div>
    </div>
  );
};

export default LoginCarousel;

