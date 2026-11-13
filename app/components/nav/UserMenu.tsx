"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { SafeUser } from "@/types";
import {
  FiUser,
  FiChevronDown,
  FiPackage,
  FiShield,
  FiLogOut,
  FiLogIn,
  FiUserPlus,
} from "react-icons/fi";

interface UserMenuProps {
  currentUser?: SafeUser | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="User Menu"
        className={`
          flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border transition-all cursor-pointer outline-none select-none
          ${
            isOpen
              ? "border-zinc-900 bg-zinc-100"
              : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
          }
        `}
      >
        <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
          {initials ? initials : <FiUser className="text-xs" />}
        </div>

        <span className="hidden sm:inline text-xs font-bold text-zinc-800 max-w-[90px] truncate">
          {currentUser?.name ? currentUser.name.split(" ")[0] : "Account"}
        </span>

        <FiChevronDown
          className={`text-xs text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-zinc-800" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className="
            absolute right-0 top-11 w-60 bg-white/95 backdrop-blur-xl rounded-2xl border border-zinc-200/80 shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150
          "
        >
          {currentUser ? (
            <>
              {/* User Header */}
              <div className="px-4 py-2.5 border-b border-zinc-100 mb-1">
                <span className="font-bold text-zinc-900 block truncate">
                  {currentUser.name || "Customer"}
                </span>
                <span className="text-[11px] text-zinc-400 block truncate">
                  {currentUser.email}
                </span>
                {currentUser.role === "ADMIN" && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Administrator
                  </span>
                )}
              </div>

              {/* Admin Console Link (Admin Only) */}
              {currentUser.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-indigo-600 hover:bg-indigo-50 font-bold transition"
                >
                  <FiShield className="text-sm" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              {/* My Orders */}
              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-zinc-700 hover:bg-zinc-50 font-semibold transition"
              >
                <FiPackage className="text-sm text-zinc-400" />
                <span>My Orders</span>
              </Link>

              {/* Divider */}
              <div className="my-1.5 border-t border-zinc-100"></div>

              {/* Sign Out */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold transition text-left cursor-pointer"
              >
                <FiLogOut className="text-sm" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <div className="px-4 py-2 border-b border-zinc-100 mb-1">
                <span className="font-bold text-zinc-900 block">Welcome to TechHub</span>
                <span className="text-[11px] text-zinc-400 block">
                  Sign in to track orders & save items
                </span>
              </div>

              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-zinc-900 hover:bg-zinc-50 font-bold transition"
              >
                <FiLogIn className="text-sm text-zinc-500" />
                <span>Sign In</span>
              </Link>

              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-zinc-700 hover:bg-zinc-50 font-semibold transition"
              >
                <FiUserPlus className="text-sm text-zinc-400" />
                <span>Create Customer Account</span>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
