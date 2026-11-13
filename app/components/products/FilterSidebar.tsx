"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { Categories } from "@/utils/Categories";
import { colors } from "@/utils/Colors";
import { FiFilter, FiX, FiRotateCcw, FiCheck } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";

interface FilterSidebarProps {
  totalCount?: number;
  categories?: { label: string }[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ totalCount, categories }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryList =
    categories && categories.length > 0 ? categories : Categories;

  // URL state
  const currentCategory = searchParams?.get("category") || "All";
  const currentMinPrice = searchParams?.get("minPrice") || "";
  const currentMaxPrice = searchParams?.get("maxPrice") || "";
  const currentRating = searchParams?.get("rating") || "";
  const currentColor = searchParams?.get("color") || "";
  const currentInStock = searchParams?.get("inStock") === "true";
  const currentSort = searchParams?.get("sort") || "";

  // Local state for custom price inputs
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  const updateFilters = (newParams: Record<string, any>) => {
    const currentQuery = searchParams
      ? queryString.parse(searchParams.toString())
      : {};

    const updatedQuery = {
      ...currentQuery,
      ...newParams,
    };

    // Remove empty/null/default keys
    Object.keys(updatedQuery).forEach((key) => {
      if (
        updatedQuery[key] === null ||
        updatedQuery[key] === undefined ||
        updatedQuery[key] === "" ||
        (key === "category" && updatedQuery[key] === "All")
      ) {
        delete updatedQuery[key];
      }
    });

    const url = queryString.stringifyUrl(
      { url: "/", query: updatedQuery },
      { skipNull: true }
    );

    router.push(url);
  };

  const handleCategorySelect = (categoryLabel: string) => {
    updateFilters({ category: categoryLabel === "All" ? null : categoryLabel });
  };

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPriceInput || null,
      maxPrice: maxPriceInput || null,
    });
  };

  const handleRatingSelect = (ratingValue: number) => {
    if (currentRating === ratingValue.toString()) {
      updateFilters({ rating: null }); // Toggle off
    } else {
      updateFilters({ rating: ratingValue });
    }
  };

  const handleColorSelect = (colorName: string) => {
    if (currentColor.toLowerCase() === colorName.toLowerCase()) {
      updateFilters({ color: null }); // Toggle off
    } else {
      updateFilters({ color: colorName });
    }
  };

  const handleToggleStock = () => {
    updateFilters({ inStock: currentInStock ? null : "true" });
  };

  const handleResetFilters = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push("/");
    setMobileDrawerOpen(false);
  };

  const hasActiveFilters = Boolean(
    (currentCategory && currentCategory !== "All") ||
      currentMinPrice ||
      currentMaxPrice ||
      currentRating ||
      currentColor ||
      currentInStock
  );

  const filterContent = (
    <div className="flex flex-col gap-6 text-sm text-zinc-700">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2 font-bold text-zinc-950 text-base">
          <FiFilter className="text-zinc-600" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
          >
            <FiRotateCcw className="text-[10px]" />
            Reset All
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div>
        <h4 className="font-semibold text-xs uppercase tracking-wider text-zinc-400 mb-3">
          Categories
        </h4>
        <div className="flex flex-col gap-1.5">
          {categoryList.map((cat: any) => {
            const staticMatch = Categories.find((c) => c.label === cat.label);
            const Icon = staticMatch?.icon;
            const isSelected =
              currentCategory === cat.label ||
              (currentCategory === "All" && cat.label === "All");

            return (
              <button
                key={cat.label}
                onClick={() => handleCategorySelect(cat.label)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isSelected
                    ? "bg-zinc-900 text-white font-semibold shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {Icon ? <Icon className="text-sm" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>}
                  <span>{cat.label}</span>
                </div>
                {isSelected && <FiCheck className="text-xs" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Price Range Filter */}
      <div className="pt-2 border-t border-zinc-100">
        <h4 className="font-semibold text-xs uppercase tracking-wider text-zinc-400 mb-3">
          Price Range (KSh)
        </h4>

        {/* Quick Price Range Presets in KES */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <button
            onClick={() => updateFilters({ minPrice: null, maxPrice: 5000 })}
            className={`px-2 py-1.5 rounded-md border text-[11px] font-medium text-center transition ${
              !currentMinPrice && currentMaxPrice === "5000"
                ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                : "border-zinc-200 hover:border-zinc-400 text-zinc-600 bg-white"
            }`}
          >
            Under KSh 5,000
          </button>
          <button
            onClick={() => updateFilters({ minPrice: 5000, maxPrice: 20000 })}
            className={`px-2 py-1.5 rounded-md border text-[11px] font-medium text-center transition ${
              currentMinPrice === "5000" && currentMaxPrice === "20000"
                ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                : "border-zinc-200 hover:border-zinc-400 text-zinc-600 bg-white"
            }`}
          >
            5K - 20K KSh
          </button>
          <button
            onClick={() => updateFilters({ minPrice: 20000, maxPrice: 60000 })}
            className={`px-2 py-1.5 rounded-md border text-[11px] font-medium text-center transition ${
              currentMinPrice === "20000" && currentMaxPrice === "60000"
                ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                : "border-zinc-200 hover:border-zinc-400 text-zinc-600 bg-white"
            }`}
          >
            20K - 60K KSh
          </button>
          <button
            onClick={() => updateFilters({ minPrice: 60000, maxPrice: null })}
            className={`px-2 py-1.5 rounded-md border text-[11px] font-medium text-center transition ${
              currentMinPrice === "60000" && !currentMaxPrice
                ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                : "border-zinc-200 hover:border-zinc-400 text-zinc-600 bg-white"
            }`}
          >
            KSh 60,000+
          </button>
        </div>

        {/* Custom Min / Max Form */}
        <form onSubmit={handleApplyPrice} className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="number"
              min="0"
              placeholder="Min KSh"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-full p-2 text-xs border border-zinc-200 rounded-md outline-none bg-zinc-50 focus:bg-white focus:border-zinc-900 transition font-mono"
            />
          </div>
          <span className="text-zinc-400 text-xs">-</span>
          <div className="relative flex-1">
            <input
              type="number"
              min="0"
              placeholder="Max KSh"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-full p-2 text-xs border border-zinc-200 rounded-md outline-none bg-zinc-50 focus:bg-white focus:border-zinc-900 transition font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-md bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition"
          >
            Go
          </button>
        </form>
      </div>

      {/* 3. Customer Rating */}
      <div className="pt-2 border-t border-zinc-100">
        <h4 className="font-semibold text-xs uppercase tracking-wider text-zinc-400 mb-3">
          Customer Rating
        </h4>
        <div className="flex flex-col gap-1.5">
          {[4, 3, 2].map((stars) => {
            const isSelected = currentRating === stars.toString();
            return (
              <button
                key={stars}
                onClick={() => handleRatingSelect(stars)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                  isSelected
                    ? "bg-zinc-900 text-white font-semibold"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400 text-xs">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <AiFillStar
                        key={i}
                        className={i < stars ? "text-amber-400" : "text-zinc-200"}
                      />
                    ))}
                  </div>
                  <span className={isSelected ? "text-white" : "text-zinc-600"}>
                    {stars}★ & up
                  </span>
                </div>
                {isSelected && <FiCheck className="text-xs" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Color Swatches */}
      <div className="pt-2 border-t border-zinc-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-zinc-400">
            Color
          </h4>
          {currentColor && (
            <span className="text-[11px] font-semibold text-zinc-900 capitalize">
              {currentColor}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => {
            const isSelected =
              currentColor.toLowerCase() === c.color.toLowerCase();

            return (
              <button
                key={c.color}
                title={c.color}
                onClick={() => handleColorSelect(c.color)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? "ring-2 ring-zinc-900 ring-offset-2 scale-110 shadow-xs"
                    : "border border-zinc-200 hover:scale-105"
                }`}
                style={{ backgroundColor: c.colorCode }}
              >
                {isSelected && (
                  <FiCheck
                    className={`text-xs ${
                      c.color.toLowerCase() === "white" ||
                      c.color.toLowerCase() === "silver"
                        ? "text-zinc-900"
                        : "text-white"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. In-Stock Availability */}
      <div className="pt-2 border-t border-zinc-100">
        <label className="flex items-center justify-between cursor-pointer group py-1">
          <span className="text-xs font-semibold text-zinc-800 group-hover:text-zinc-950">
            In Stock Only
          </span>
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={handleToggleStock}
            className="w-4 h-4 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-900 cursor-pointer accent-zinc-900"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger Button (Visible on screens < lg) */}
      <div className="lg:hidden flex items-center justify-between w-full mb-4 bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-zinc-900 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition"
        >
          <FiFilter className="text-sm text-zinc-700" />
          <span>Filters & Sort</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          )}
        </button>

        {/* Sort selector on mobile */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-zinc-400 font-medium">Sort:</span>
          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value || null })}
            className="bg-transparent font-semibold text-zinc-800 outline-none cursor-pointer"
          >
            <option value="">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
                <h3 className="font-bold text-base text-zinc-900">Filters</h3>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-full text-zinc-500 hover:bg-zinc-100"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
              {filterContent}
            </div>
            <div className="pt-6 border-t border-zinc-100 mt-6">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-bold shadow-sm hover:bg-zinc-800"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar (Visible on screens >= lg) */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          {filterContent}
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;

