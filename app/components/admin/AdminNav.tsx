"use client";

import React from "react";
import Container from "../Container";
import Link from "next/link";
import {
  MdDashboard,
  MdDns,
  MdFormatListBulleted,
  MdLibraryAdd,
  MdViewCarousel,
} from "react-icons/md";
import { usePathname } from "next/navigation";

const AdminNav = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Analytics & Overview",
      icon: MdDashboard,
      href: "/admin",
      selected: pathname === "/admin",
    },
    {
      label: "Add Product",
      icon: MdLibraryAdd,
      href: "/admin/add-product",
      selected: pathname === "/admin/add-product",
    },
    {
      label: "Products & Stock",
      icon: MdDns,
      href: "/admin/manage-products",
      selected: pathname === "/admin/manage-products",
    },
    {
      label: "Store Banners",
      icon: MdViewCarousel,
      href: "/admin/manage-banners",
      selected: pathname === "/admin/manage-banners",
    },
    {
      label: "Orders & M-Pesa",
      icon: MdFormatListBulleted,
      href: "/admin/manage-orders",
      selected: pathname === "/admin/manage-orders",
    },
  ];

  return (
    <div className="w-full bg-white border-b border-zinc-200/80 shadow-2xs">
      <Container>
        <div className="flex items-center justify-start md:justify-center gap-2 sm:gap-4 overflow-x-auto py-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex
                  items-center
                  gap-2
                  px-3.5
                  py-2
                  rounded-xl
                  text-xs
                  font-bold
                  transition-all
                  shrink-0
                  ${
                    item.selected
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                  }
                `}
              >
                <Icon className="text-base" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
};

export default AdminNav;
