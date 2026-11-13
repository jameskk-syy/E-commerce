import React from "react";
import Summary from "./Summary";
import getProducts from "@/actions/getProducts";
import getOrders from "@/actions/getOrders";
import getUsers from "@/actions/getUsers";
import BarGraph from "./BarGraph";
import getGraphData from "@/actions/getGraphDats";
import NullData from "../components/NullData";
import Link from "next/link";
import moment from "moment";
import { FiArrowRight, FiPackage, FiPhone, FiCheck, FiClock, FiAlertTriangle } from "react-icons/fi";
import { MdDone, MdAccessTimeFilled, MdDeliveryDining } from "react-icons/md";

const Admin = async () => {
  const products = await getProducts({ category: null });
  const orders = await getOrders();
  const users = await getUsers();
  const graphData = await getGraphData();

  if (!graphData) {
    return <NullData title="No graph Data available" />;
  }

  const recentOrders = (orders || []).slice(0, 5);
  const lowStockItems = (products || [])
    .filter(
      (p: any) =>
        !p.inStock || (p.stockQuantity !== undefined && p.stockQuantity <= 5)
    )
    .slice(0, 4);

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      {/* 1. Metric Cards & Welcome Hero */}
      <Summary products={products} orders={orders} users={users} />

      {/* 2. Main Performance & Live Operations Grid (Full-Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: 7-Day Revenue Trend (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <BarGraph data={graphData} />
        </div>

        {/* Right Column: Live Recent Orders & Quick Watchlist (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Recent Orders Feed Card */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-xs flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
                    <FiPackage className="text-base" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-950">
                      Recent Orders
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      Latest storefront purchases
                    </span>
                  </div>
                </div>

                <Link
                  href="/admin/manage-orders"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
                >
                  <span>View All</span>
                  <FiArrowRight className="text-xs" />
                </Link>
              </div>

              {/* Orders List */}
              <div className="divide-y divide-zinc-100">
                {recentOrders.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-6 text-center">
                    No orders placed yet.
                  </p>
                ) : (
                  recentOrders.map((ord: any) => {
                    const isPaid = ord.status === "complete";
                    const isMpesa = ord.paymentMethod?.includes("kopokopo");
                    const customerName = ord.customerName || ord.user?.name || "Customer";

                    return (
                      <div
                        key={ord.id}
                        className="py-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 truncate">
                              {customerName}
                            </span>
                            {isMpesa && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                M-Pesa
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">
                            {moment(ord.createDate).fromNow()} &bull; #{ord.id.slice(-6)}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-zinc-950 font-sans block">
                            KES {ord.amount?.toLocaleString()}
                          </span>
                          <span
                            className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {isPaid ? "Paid" : "Pending"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-zinc-100">
              <Link
                href="/admin/manage-orders"
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-zinc-200/60"
              >
                <span>Open Order Dispatch Console</span>
                <FiArrowRight className="text-xs" />
              </Link>
            </div>
          </div>

          {/* Low Stock Radar Card */}
          {lowStockItems.length > 0 && (
            <div className="bg-white rounded-3xl border border-rose-200/70 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-3">
                <div className="flex items-center gap-2 text-rose-700">
                  <FiAlertTriangle className="text-base" />
                  <span className="font-bold text-xs">Inventory Radar</span>
                </div>
                <Link
                  href="/admin/manage-products"
                  className="text-[11px] font-bold text-rose-600 hover:underline"
                >
                  Restock ({lowStockItems.length})
                </Link>
              </div>

              <div className="flex flex-col gap-2">
                {lowStockItems.map((prod: any) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-rose-50/60 border border-rose-100"
                  >
                    <span className="font-semibold text-zinc-900 truncate max-w-[180px]">
                      {prod.name}
                    </span>
                    <span className="font-bold font-mono text-rose-700 text-[11px] shrink-0">
                      {prod.stockQuantity || 0} units left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
