"use client";

import React, { useState, useCallback, useEffect } from "react";
import { formatPrice } from "@/utils/formatPrice";
import { Order, User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import moment from "moment";
import AdminPagination from "@/app/components/admin/AdminPagination";
import {
  MdDeliveryDining,
  MdDone,
  MdRemoveRedEye,
  MdSearch,
  MdPhone,
  MdShoppingBag,
  MdPayments,
  MdCheckCircle,
  MdHourglassTop,
} from "react-icons/md";

interface ManageOrdersClientProps {
  orders?: ExtendedOrder[];
}

type ExtendedOrder = Order & {
  user?: User | null;
};

const ManageOrdersClient: React.FC<ManageOrdersClientProps> = ({
  orders: initialOrders = [],
}) => {
  const router = useRouter();

  // Paginated Data
  const [orders, setOrders] = useState<ExtendedOrder[]>(initialOrders.slice(0, 8));
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(initialOrders.length);
  const [loading, setLoading] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalOrders: initialOrders.length,
    totalRevenue: initialOrders.reduce((sum, o) => (o.status === "complete" ? sum + (o.amount || 0) : sum), 0),
    deliveredCount: initialOrders.filter((o) => o.deliveryStatus === "delivered").length,
    pendingDeliveryCount: initialOrders.filter((o) => o.deliveryStatus !== "delivered").length,
    mpesaPaidCount: initialOrders.filter((o) => o.paymentMethod?.includes("kopokopo") && o.status === "complete").length,
  });

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch paginated orders from backend API (8 per page)
  const fetchOrders = useCallback(async (page: number, search: string, filter: string) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/order", {
        params: {
          page,
          limit: 8,
          search: search.trim(),
          statusFilter: filter,
        },
      });

      if (res.data) {
        setOrders(res.data.orders || []);
        setTotalCount(res.data.totalCount || 0);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || 1);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount or page/filter change
  useEffect(() => {
    fetchOrders(currentPage, searchTerm, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOrders, currentPage, statusFilter]);

  // Debounced search handling
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders(1, searchTerm, statusFilter);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchOrders]);

  // Update order delivery status
  const handleUpdateDelivery = useCallback(
    (id: string, newStatus: "delivered" | "pending" | "dispatched") => {
      const label =
        newStatus === "delivered"
          ? "marked as delivered"
          : newStatus === "pending"
          ? "marked as pending / not delivered"
          : "marked as dispatched";

      axios
        .put("/api/order", {
          id,
          deliveryStatus: newStatus,
        })
        .then(() => {
          toast.success(`Order #${id.slice(-6)} ${label}`);
          fetchOrders(currentPage, searchTerm, statusFilter);
          router.refresh();
        })
        .catch((error) => {
          toast.error("Oops! Something went wrong updating status");
          console.error(error);
        });
    },
    [router, currentPage, searchTerm, statusFilter, fetchOrders]
  );

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
              Orders & Delivery Fulfillment
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Track customer orders, phone numbers, M-Pesa payments, and manage fulfillment dispatch with 8-per-page backend pagination.
          </p>
        </div>
      </div>

      {/* 5 Top Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <MdShoppingBag className="text-base" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-950">
            {stats.totalOrders}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            All customer checkout records
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Gross Sales
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <MdPayments className="text-base" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-950">
            {formatPrice(stats.totalRevenue)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            Paid & Verified
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Delivered
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <MdCheckCircle className="text-base" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            {stats.deliveredCount}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            {stats.totalOrders > 0
              ? `${Math.round(
                  (stats.deliveredCount / stats.totalOrders) * 100
                )}% fulfillment rate`
              : "0%"}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Needs Dispatch
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <MdHourglassTop className="text-base" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            {stats.pendingDeliveryCount}
          </div>
          <span className="text-[10px] text-amber-600 font-medium mt-1 block">
            Awaiting rider or packing
          </span>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              M-Pesa Paid
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <MdCheckCircle className="text-base" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-600">
            {stats.mpesaPaidCount}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            STK & Till verified orders
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-base" />
            <input
              type="text"
              placeholder="Search phone number (254...), name, receipt, order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Orders" },
              { id: "pending", label: "Pending" },
              { id: "dispatched", label: "Dispatched" },
              { id: "delivered", label: "Delivered" },
              { id: "mpesa", label: "M-Pesa Verified" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/70 border-b border-zinc-100 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Delivery Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-zinc-400">
                    <span className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin inline-block mb-2" />
                    <p className="font-bold text-zinc-600 text-xs">Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-zinc-400">
                    <MdShoppingBag className="mx-auto text-4xl mb-2 text-zinc-300" />
                    <p className="font-bold text-zinc-600">No orders found</p>
                    <p className="text-[11px] mt-0.5">
                      {searchTerm
                        ? "Try searching by a different phone number or name"
                        : "Orders will automatically appear here as customers place checkouts"}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => {
                  const customerName =
                    order.customerName || order.user?.name || "Guest Customer";
                  const phone = order.phoneNumber || "—";
                  const isDelivered = order.deliveryStatus === "delivered";
                  const isDispatched = order.deliveryStatus === "dispatched";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/70 transition group"
                    >
                      {/* ID & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-bold text-zinc-950">
                          #{order.id.slice(-6).toUpperCase()}
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {moment(order.createDate).fromNow()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0 font-bold text-[11px]">
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 max-w-[160px]">
                            <span
                              className="font-bold text-zinc-900 block truncate"
                              title={customerName}
                            >
                              {customerName}
                            </span>
                            <span
                              className="text-[10px] text-zinc-400 block truncate"
                              title={order.customerEmail || order.user?.email || ""}
                            >
                              {order.customerEmail || order.user?.email || "No email"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-800">
                          <MdPhone className="text-zinc-400 text-xs shrink-0" />
                          <span>{phone}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-black font-mono text-zinc-950">
                        {formatPrice(order.amount)}
                      </td>

                      {/* Payment Status & Method */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.status === "complete"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                order.status === "complete"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            <span>
                              {order.status === "complete"
                                ? "Paid"
                                : order.status || "Pending"}
                            </span>
                          </span>

                          {order.mpesaReceipt && (
                            <div className="font-mono text-[10px] text-zinc-500 truncate max-w-[120px]" title={order.mpesaReceipt}>
                              M-Pesa: {order.mpesaReceipt}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Delivery Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isDelivered
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : isDispatched
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDelivered
                                ? "bg-emerald-500"
                                : isDispatched
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span>
                            {isDelivered
                              ? "Delivered"
                              : isDispatched
                              ? "Dispatched"
                              : "Pending Delivery"}
                          </span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isDelivered ? (
                            <button
                              onClick={() =>
                                handleUpdateDelivery(order.id, "delivered")
                              }
                              title="Mark as Delivered"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                            >
                              <MdDone className="text-xs" />
                              <span>Delivered</span>
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleUpdateDelivery(order.id, "pending")
                              }
                              title="Revert to Not Delivered"
                              className="px-2 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold transition cursor-pointer"
                            >
                              Revert
                            </button>
                          )}

                          {!isDelivered && !isDispatched && (
                            <button
                              onClick={() =>
                                handleUpdateDelivery(order.id, "dispatched")
                              }
                              title="Mark Dispatched / In Transit"
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
                            >
                              <MdDeliveryDining className="text-sm" />
                            </button>
                          )}

                          <button
                            onClick={() => router.push(`/order/${order.id}`)}
                            title="View Full Order Summary"
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition cursor-pointer"
                          >
                            <MdRemoveRedEye className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 8-per-page Backend Pagination Component */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          limit={8}
          onPageChange={(page) => setCurrentPage(page)}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ManageOrdersClient;
