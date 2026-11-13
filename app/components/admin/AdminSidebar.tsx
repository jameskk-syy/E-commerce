"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdDashboard,
  MdDns,
  MdCategory,
  MdViewCarousel,
  MdFormatListBulleted,
  MdStorefront,
  MdLogout,
  MdClose,
  MdShield,
} from "react-icons/md";
import { signOut } from "next-auth/react";
import { SafeUser } from "@/types";

interface AdminSidebarProps {
  currentUser?: SafeUser | null;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const navSections = [
  {
    title: "Core",
    items: [
      {
        label: "Analytics & Overview",
        icon: MdDashboard,
        href: "/admin",
      },
    ],
  },
  {
    title: "Inventory & Catalog",
    items: [
      {
        label: "Products & Stock",
        icon: MdDns,
        href: "/admin/manage-products",
      },
      {
        label: "Categories",
        icon: MdCategory,
        href: "/admin/manage-categories",
      },
    ],
  },
  {
    title: "Sales & Fulfillment",
    items: [
      {
        label: "Orders & Delivery",
        icon: MdFormatListBulleted,
        href: "/admin/manage-orders",
      },
    ],
  },
  {
    title: "Storefront",
    items: [
      {
        label: "Carousel Banners",
        icon: MdViewCarousel,
        href: "/admin/manage-banners",
      },
    ],
  },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentUser,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const sidebarContent = (
    <aside className="w-64 h-full bg-zinc-950 text-zinc-300 flex flex-col justify-between border-r border-zinc-800 select-none">
      {/* Top Brand Section */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-zinc-800/80">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm tracking-tighter group-hover:bg-indigo-500 transition">
              TH
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>techhub</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">Admin Console</span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Close Sidebar"
            >
              <MdClose className="text-lg" />
            </button>
          )}
        </div>

        {/* Live System Indicator */}
        <div className="px-5 py-2.5 bg-zinc-900/50 border-b border-zinc-800/50 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Online
          </span>
          <span className="text-zinc-500 font-mono text-[10px]">MariaDB &bull; K2</span>
        </div>

        {/* Navigation Groups */}
        <div className="p-3.5 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-220px)]">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {section.title}
              </div>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname?.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                        ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                        }
                      `}
                    >
                      <Icon
                        className={`text-base ${
                          isActive ? "text-white" : "text-zinc-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick link to Storefront */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Navigation
            </div>
            <Link
              href="/"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
            >
              <div className="flex items-center gap-3">
                <MdStorefront className="text-base text-zinc-400" />
                <span>Visit Storefront</span>
              </div>
              <span className="text-[10px] text-zinc-500">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin User Profile & Logout Footer */}
      <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "AD"}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-white truncate">
                {currentUser?.name || "Administrator"}
              </span>
              <span className="text-[10px] text-zinc-400 truncate block">
                {currentUser?.email || "kirugjames@gmail.com"}
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out of admin"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
          >
            <MdLogout className="text-base" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;

