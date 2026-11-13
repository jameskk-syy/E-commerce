"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { formatPrice } from "@/utils/formatPrice";
import { formatNumber } from "@/utils/formatNumber";
import {
  FiCreditCard,
  FiShoppingBag,
  FiCheckCircle,
  FiClock,
  FiBox,
  FiUsers,
  FiAlertTriangle,
  FiArrowUpRight,
  FiPlus,
  FiTruck,
  FiLayers,
} from "react-icons/fi";
import { MdPayments, MdDeliveryDining } from "react-icons/md";

interface SummaryProps {
  orders: any[];
  products: any[];
  users: any[];
}

const Summary: React.FC<SummaryProps> = ({
  orders = [],
  products = [],
  users = [],
}) => {
  const stats = useMemo(() => {
    const totalSales = orders.reduce((acc, order) => {
      if (order.status === "complete") {
        return acc + (order.amount || 0);
      }
      return acc;
    }, 0);

    const paidOrders = orders.filter((o) => o.status === "complete");
    const pendingOrders = orders.filter((o) => o.status === "pending");
    const needsDelivery = orders.filter((o) => o.deliveryStatus !== "delivered");
    const delivered = orders.filter((o) => o.deliveryStatus === "delivered");

    const totalWarehouseUnits = products.reduce(
      (acc, p) => acc + (p.stockQuantity !== undefined ? p.stockQuantity : 10),
      0
    );

    const outOfStock = products.filter(
      (p) =>
        p.inStock === false ||
        (p.stockQuantity !== undefined && p.stockQuantity <= 0)
    );

    const lowStock = products.filter(
      (p) =>
        p.stockQuantity !== undefined &&
        p.stockQuantity > 0 &&
        p.stockQuantity <= 5
    );

    return {
      totalSales,
      totalOrders: orders.length,
      paidCount: paidOrders.length,
      pendingCount: pendingOrders.length,
      needsDeliveryCount: needsDelivery.length,
      deliveredCount: delivered.length,
      totalProducts: products.length,
      totalWarehouseUnits,
      outOfStockCount: outOfStock.length,
      lowStockCount: lowStock.length,
      totalUsers: users.length,
    };
  }, [orders, products, users]);

  const cards = [
    {
      label: "Gross Sales Revenue",
      value: formatPrice(stats.totalSales),
      subtext: "Confirmed via M-Pesa & Card",
      badge: "+Live",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      icon: MdPayments,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      label: "Paid Orders",
      value: formatNumber(stats.paidCount),
      subtext: `${(
        (stats.paidCount / (stats.totalOrders || 1)) *
        100
      ).toFixed(0)}% completion rate`,
      badge: `${stats.totalOrders} total`,
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
      icon: FiCheckCircle,
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      label: "Needs Delivery / Dispatch",
      value: formatNumber(stats.needsDeliveryCount),
      subtext: "Orders awaiting final fulfillment",
      badge: stats.needsDeliveryCount > 0 ? "Action" : "Clear",
      badgeColor:
        stats.needsDeliveryCount > 0
          ? "bg-amber-500/10 text-amber-700 border-amber-200"
          : "bg-zinc-100 text-zinc-600 border-zinc-200",
      icon: MdDeliveryDining,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      label: "Warehouse Stock",
      value: `${stats.totalWarehouseUnits.toLocaleString()} units`,
      subtext: `Across ${stats.totalProducts} catalog products`,
      badge: "In Stock",
      badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
      icon: FiLayers,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      label: "Inventory Alerts",
      value: `${stats.lowStockCount + stats.outOfStockCount} Alerts`,
      subtext: `${stats.outOfStockCount} out of stock • ${stats.lowStockCount} low stock`,
      badge:
        stats.lowStockCount + stats.outOfStockCount > 0
          ? "Restock"
          : "Optimal",
      badgeColor:
        stats.lowStockCount + stats.outOfStockCount > 0
          ? "bg-rose-500/10 text-rose-700 border-rose-200"
          : "bg-emerald-500/10 text-emerald-700 border-emerald-200",
      icon: FiAlertTriangle,
      iconBg:
        stats.lowStockCount + stats.outOfStockCount > 0
          ? "bg-rose-50 text-rose-600 border-rose-100"
          : "bg-zinc-50 text-zinc-500 border-zinc-100",
    },
    {
      label: "Active Customers",
      value: formatNumber(stats.totalUsers),
      subtext: "Registered shoppers & buyers",
      badge: "Accounts",
      badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200",
      icon: FiUsers,
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Clean Dashboard Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
              Dashboard & Analytics
            </h1>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium">
            Real-time storefront performance, warehouse inventory levels, and Kopo Kopo payments.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/admin/add-product"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-2xs"
          >
            <FiPlus className="text-sm" />
            <span>Add Product</span>
          </Link>

          <Link
            href="/admin/manage-orders"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold border border-zinc-200 transition shadow-2xs"
          >
            <FiTruck className="text-sm text-zinc-500" />
            <span>Orders ({stats.needsDeliveryCount})</span>
          </Link>

          <Link
            href="/admin/manage-banners"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold border border-zinc-200 transition shadow-2xs"
          >
            <span>Banners</span>
            <FiArrowUpRight className="text-xs text-zinc-400" />
          </Link>
        </div>
      </div>

      {/* 6 Large High-Visibility Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-zinc-200/80 p-5 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg ${card.iconBg}`}
                  >
                    <Icon />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>

                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  {card.label}
                </span>

                <div className="text-xl sm:text-2xl font-black text-zinc-950 font-sans tracking-tight">
                  {card.value}
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 font-medium mt-3 pt-3 border-t border-zinc-100 truncate">
                {card.subtext}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Summary;
