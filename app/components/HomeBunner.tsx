"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface HomeBunnerProps {
  banners?: any[];
}

const HomeBunner: React.FC<HomeBunnerProps> = ({ banners = [] }) => {
  // If no banners from backend, completely hide component
  if (!banners || banners.length === 0) {
    return null;
  }

  return <HomeBunnerContent banners={banners} />;
};

const HomeBunnerContent: React.FC<{ banners: any[] }> = ({ banners }) => {
  const [current, setCurrent] = useState(0);

  // Auto-play carousel if more than 1 banner
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const currentBanner = banners[current] || banners[0];
  const isBase64 =
    currentBanner?.image && currentBanner.image.startsWith("data:");

  if (!currentBanner) return null;

  return (
    <div className="relative bg-white border border-zinc-200/80 rounded-2xl md:rounded-3xl mb-8 overflow-hidden shadow-xs group">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Main Slide Content */}
      <div className="relative z-10 px-6 py-10 md:px-12 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[340px]">
        {/* Text Area */}
        <div className="flex-1 max-w-xl text-center md:text-left">
          {currentBanner.badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {currentBanner.badge}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 mb-3 leading-tight transition-all duration-500">
            {currentBanner.title}
          </h1>

          {currentBanner.subtitle && (
            <p className="text-sm md:text-base text-zinc-600 mb-6 font-normal max-w-md leading-relaxed">
              {currentBanner.subtitle}
            </p>
          )}

          <div className="flex items-center justify-center md:justify-start gap-3">
            <Link
              href={currentBanner.link || "/#products-section"}
              className="px-5 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-sm"
            >
              Shop Collection →
            </Link>

            {currentBanner.discount && (
              <span className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold tracking-wider">
                {currentBanner.discount}
              </span>
            )}
          </div>
        </div>

        {/* Image Area */}
        <div className="w-full md:w-2/5 flex items-center justify-center">
          <div className="relative aspect-square w-56 sm:w-64 md:w-72 flex items-center justify-center">
            {isBase64 ? (
              // Base64 Image
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentBanner.image}
                alt={currentBanner.title || "Banner"}
                className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
              />
            ) : (
              // Static / URL Image
              <Image
                src={currentBanner.image || "/banner-image.png"}
                alt={currentBanner.title || "Banner"}
                fill
                priority
                unoptimized
                className="object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
              />
            )}
          </div>
        </div>
      </div>

      {/* Carousel Controls (If 2 or more banners) */}
      {banners.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-800 border border-zinc-200 shadow-sm flex items-center justify-center text-base opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
            title="Previous banner"
          >
            <FiChevronLeft />
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-800 border border-zinc-200 shadow-sm flex items-center justify-center text-base opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
            title="Next banner"
          >
            <FiChevronRight />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrent(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  current === idx
                    ? "w-7 bg-zinc-950"
                    : "w-2 bg-zinc-300 hover:bg-zinc-400"
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomeBunner;
