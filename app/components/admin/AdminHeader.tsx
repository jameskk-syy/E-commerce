"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdMenu,
  MdAdd,
  MdStorefront,
  MdNotificationsNone,
} from "react-icons/md";
import { SafeUser } from "@/types";

interface AdminHeaderProps {
  currentUser?: SafeUser | null;
  onOpenMobile: () => void;
}

export default function AdminHeader({
  currentUser,
  onOpenMobile,
}: AdminHeaderProps) {
  const pathname = usePathname();

  // Compute breadcrumb title
  const getPageTitle = () => {
    if (pathname === "/admin") return "Overview & Analytics";
    if (pathname?.includes("/add-product")) return "Add New Product";
    if (pathname?.includes("/manage-products")) return "Product Inventory & Stock";
    if (pathname?.includes("/manage-orders")) return "Orders & Deliveries";
    if (pathname?.includes("/manage-banners")) return "Carousel Banners";
    return "Admin Console";
  };

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition"
          aria-label="Open Admin Menu"
        >
          <MdMenu className="text-xl" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/admin"
            className="font-bold text-zinc-400 hover:text-zinc-700 transition hidden sm:inline"
          >
            Admin
          </Link>
          <span className="text-zinc-300 hidden sm:inline">/</span>
          <span className="font-extrabold text-zinc-950 text-sm sm:text-base tracking-tight">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* View Storefront Pill */}
        <Link
          href="/"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-zinc-400 text-zinc-700 text-xs font-bold transition shadow-2xs"
        >
          <MdStorefront className="text-sm text-zinc-500" />
          <span>Live Store</span>
        </Link>

        {/* Quick Add Product Button */}
        <Link
          href="/admin/add-product"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-2xs"
        >
          <MdAdd className="text-sm" />
          <span>Add Product</span>
        </Link>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-800 flex items-center justify-center font-bold text-xs select-none">
          {currentUser?.name ? currentUser.name.slice(0, 1).toUpperCase() : "A"}
        </div>
      </div>
    </header>
  );
}

