"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { FiX, FiRotateCcw } from "react-icons/fi";

interface ProductGridHeaderProps {
  totalCount: number;
}

const ProductGridHeader: React.FC<ProductGridHeaderProps> = ({ totalCount }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams?.get("category");
  const minPrice = searchParams?.get("minPrice");
  const maxPrice = searchParams?.get("maxPrice");
  const rating = searchParams?.get("rating");
  const color = searchParams?.get("color");
  const inStock = searchParams?.get("inStock");
  const searchTerm = searchParams?.get("searchTerm");
  const sort = searchParams?.get("sort") || "";

  const removeFilter = (key: string) => {
    const currentQuery = searchParams
      ? queryString.parse(searchParams.toString())
      : {};

    delete currentQuery[key];

    const url = queryString.stringifyUrl(
      { url: "/", query: currentQuery },
      { skipNull: true }
    );

    router.push(url);
  };

  const removePriceFilter = () => {
    const currentQuery = searchParams
      ? queryString.parse(searchParams.toString())
      : {};

    delete currentQuery.minPrice;
    delete currentQuery.maxPrice;

    const url = queryString.stringifyUrl(
      { url: "/", query: currentQuery },
      { skipNull: true }
    );

    router.push(url);
  };

  const handleSortChange = (newSort: string) => {
    const currentQuery = searchParams
      ? queryString.parse(searchParams.toString())
      : {};

    if (newSort) {
      currentQuery.sort = newSort;
    } else {
      delete currentQuery.sort;
    }

    const url = queryString.stringifyUrl(
      { url: "/", query: currentQuery },
      { skipNull: true }
    );

    router.push(url);
  };

  const hasAnyFilter = Boolean(
    (category && category !== "All") ||
      minPrice ||
      maxPrice ||
      rating ||
      color ||
      inStock ||
      searchTerm
  );

  return (
    <div className="w-full flex flex-col gap-3 pb-5 border-b border-zinc-200/80 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-950">
            {category && category !== "All" ? `${category}s` : "All Products"}
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Showing {totalCount} {totalCount === 1 ? "device" : "devices"}
          </p>
        </div>

        {/* Desktop Sort Dropdown */}
        <div className="hidden lg:flex items-center gap-2">
          <label className="text-xs font-medium text-zinc-500">Sort by:</label>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-xs font-semibold text-zinc-800 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 outline-none hover:border-zinc-300 focus:border-zinc-900 transition cursor-pointer"
          >
            <option value="">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-medium text-zinc-400">Active:</span>

          {category && category !== "All" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
              Category: {category}
              <button
                onClick={() => removeFilter("category")}
                className="hover:text-rose-600 transition"
              >
                <FiX className="text-xs" />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
              Price: {minPrice ? `KSh ${Number(minPrice).toLocaleString()}` : "KSh 0"} - {maxPrice ? `KSh ${Number(maxPrice).toLocaleString()}` : "Any"}
              <button
                onClick={removePriceFilter}
                className="hover:text-rose-600 transition"
              >
                <FiX className="text-xs" />
              </button>
            </span>
          )}

          {rating && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
              Rating: {rating}★ & above
              <button
                onClick={() => removeFilter("rating")}
                className="hover:text-rose-600 transition"
              >
                <FiX className="text-xs" />
              </button>
            </span>
          )}

          {color && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200 capitalize">
              Color: {color}
              <button
                onClick={() => removeFilter("color")}
                className="hover:text-rose-600 transition"
              >
                <FiX className="text-xs" />
              </button>
            </span>
          )}

          {inStock && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
              In Stock Only
              <button
                onClick={() => removeFilter("inStock")}
                className="hover:text-rose-600 transition"
              >
                <FiX className="text-xs" />
              </button>
            </span>
          )}

          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-medium border border-indigo-200">
              Search: &ldquo;{searchTerm}&rdquo;
              <button
                onClick={() => removeFilter("searchTerm")}
                className="hover:text-rose-600 transition"
              >
                <FiX className="text-xs" />
              </button>
            </span>
          )}

          <button
            onClick={() => router.push("/")}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 ml-1"
          >
            <FiRotateCcw className="text-[10px]" />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGridHeader;
