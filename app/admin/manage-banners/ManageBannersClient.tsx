"use client";

import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import AdminPagination from "@/app/components/admin/AdminPagination";
import {
  MdViewCarousel,
  MdAdd,
  MdDelete,
  MdEdit,
  MdVisibility,
  MdVisibilityOff,
  MdSearch,
  MdClose,
  MdCheckCircle,
  MdOutlineImage,
  MdLaunch,
} from "react-icons/md";
import { FiUpload, FiX } from "react-icons/fi";

interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  discount?: string | null;
  link?: string | null;
  image: string;
  active: boolean;
  createdAt: string | Date;
}

interface ManageBannersClientProps {
  banners?: BannerItem[];
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const ManageBannersClient: React.FC<ManageBannersClientProps> = ({
  banners: initialBanners = [],
}) => {
  const router = useRouter();

  // Paginated Data
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners.slice(0, 8));
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(initialBanners.length);
  const [loading, setLoading] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalBanners: initialBanners.length,
    activeCount: initialBanners.filter((b) => b.active).length,
    inactiveCount: initialBanners.filter((b) => !b.active).length,
  });

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [previewBanner, setPreviewBanner] = useState<BannerItem | null>(null);

  // Form states for Add / Edit
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");
  const [discount, setDiscount] = useState("");
  const [link, setLink] = useState("");
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch paginated banners from backend API (8 per page)
  const fetchBanners = useCallback(async (page: number, search: string, filter: string) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/banner", {
        params: {
          page,
          limit: 8,
          search: search.trim(),
          statusFilter: filter,
        },
      });

      if (res.data) {
        setBanners(res.data.banners || []);
        setTotalCount(res.data.totalCount || 0);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || 1);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load banners:", err);
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount or page/filter change
  useEffect(() => {
    fetchBanners(currentPage, searchTerm, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchBanners, currentPage, statusFilter]);

  // Debounced search handling
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchBanners(1, searchTerm, statusFilter);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchBanners]);

  // File upload handler
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        setBase64Image(base64);
        toast.success("Image ready for banner");
      } catch {
        toast.error("Failed to read image file");
      }
    }
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    setTitle("");
    setSubtitle("");
    setBadge("");
    setDiscount("");
    setLink("");
    setBase64Image(null);
    setIsAddOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (banner: BannerItem) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || "");
    setBadge(banner.badge || "");
    setDiscount(banner.discount || "");
    setLink(banner.link || "");
    setBase64Image(banner.image);
  };

  // Submit Create Banner
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !base64Image) {
      toast.error("Please provide both a title and an image");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/banner", {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        badge: badge.trim() || null,
        discount: discount.trim() || null,
        link: link.trim() || null,
        image: base64Image,
        active: true,
      });

      toast.success("Store banner created successfully!");
      setIsAddOpen(false);
      fetchBanners(1, searchTerm, statusFilter);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to create banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Update Banner
  const handleUpdateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner || !title.trim() || !base64Image) {
      toast.error("Title and image are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.put("/api/banner", {
        id: editingBanner.id,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        badge: badge.trim() || null,
        discount: discount.trim() || null,
        link: link.trim() || null,
        image: base64Image,
      });

      toast.success("Banner updated successfully!");
      setEditingBanner(null);
      fetchBanners(currentPage, searchTerm, statusFilter);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to update banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active / Deactivate
  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await axios.put("/api/banner", {
        id,
        active: !currentActive,
      });
      toast.success(
        currentActive ? "Banner deactivated" : "Banner published live"
      );
      fetchBanners(currentPage, searchTerm, statusFilter);
      router.refresh();
    } catch {
      toast.error("Failed to update banner status");
    }
  };

  // Delete Banner
  const handleDeleteBanner = async (id: string, bannerTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete banner "${bannerTitle}"?`))
      return;

    try {
      await axios.delete(`/api/banner?id=${id}`);
      toast.success("Banner deleted");
      fetchBanners(currentPage, searchTerm, statusFilter);
      router.refresh();
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
              Storefront Carousel Banners
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Manage homepage carousel slides, seasonal promotions, discounts, and target links with 8-per-page backend pagination.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition shadow-sm active:scale-95 cursor-pointer shrink-0"
        >
          <MdAdd className="text-base" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Total Banners
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MdViewCarousel className="text-lg" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-950">
            {stats.totalBanners}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Configured hero carousel slides
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Live Active Slides
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MdCheckCircle className="text-lg" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {stats.activeCount}
          </div>
          <span className="text-[11px] text-emerald-600/80 font-medium mt-1 block">
            Rotating on storefront homepage
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Inactive / Drafts
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-500 flex items-center justify-center">
              <MdVisibilityOff className="text-lg" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-700">
            {stats.inactiveCount}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Hidden from customer view
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-base" />
            <input
              type="text"
              placeholder="Search title, badge, discount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {[
              { id: "all", label: "All Banners" },
              { id: "active", label: "Active Live" },
              { id: "inactive", label: "Inactive" },
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
                <th className="py-3.5 px-5">Banner Preview & Title</th>
                <th className="py-3.5 px-5">Badge / Discount</th>
                <th className="py-3.5 px-5">Target Link</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Created</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {loading && banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-zinc-400">
                    <span className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin inline-block mb-2" />
                    <p className="font-bold text-zinc-600 text-xs">Loading banners...</p>
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-zinc-400">
                    <MdViewCarousel className="mx-auto text-4xl mb-2 text-zinc-300" />
                    <p className="font-bold text-zinc-600">No banners found</p>
                    <p className="text-[11px] mt-0.5">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "Click 'Add New Banner' above to create your first homepage carousel slide"}
                    </p>
                  </td>
                </tr>
              ) : (
                banners.map((b) => {
                  const dateStr = b.createdAt
                    ? new Date(b.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-zinc-50/70 transition group"
                    >
                      {/* Thumbnail & Title */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3.5">
                          <div
                            onClick={() => setPreviewBanner(b)}
                            className="w-20 h-12 rounded-xl bg-zinc-900 border border-zinc-200/80 overflow-hidden shrink-0 relative cursor-pointer group-hover:scale-105 transition"
                            title="Click to preview slide"
                          >
                            {b.image ? (
                              <Image
                                src={b.image}
                                alt={b.title}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                <MdOutlineImage className="text-xl" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <span
                              className="font-extrabold text-zinc-950 text-sm block truncate"
                              title={b.title}
                            >
                              {b.title}
                            </span>
                            {b.subtitle && (
                              <span
                                className="text-[11px] text-zinc-500 block truncate"
                                title={b.subtitle}
                              >
                                {b.subtitle}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Badge / Discount */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {b.badge && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-bold text-[10px] uppercase">
                              {b.badge}
                            </span>
                          )}
                          {b.discount && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 font-extrabold text-[10px]">
                              {b.discount}
                            </span>
                          )}
                          {!b.badge && !b.discount && (
                            <span className="text-zinc-400 font-mono text-[11px]">
                              —
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Target Link */}
                      <td className="py-3.5 px-5">
                        {b.link ? (
                          <span
                            className="font-mono text-[11px] text-zinc-600 hover:text-indigo-600 truncate max-w-xs block"
                            title={b.link}
                          >
                            {b.link}
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-mono text-[11px]">
                            / (Default)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            b.active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              b.active ? "bg-emerald-500" : "bg-zinc-400"
                            }`}
                          />
                          <span>{b.active ? "Active Live" : "Deactivated"}</span>
                        </span>
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-5 text-zinc-500 font-medium">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewBanner(b)}
                            className="p-1.5 rounded-lg text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                            title="Preview Banner"
                          >
                            <MdVisibility className="text-base" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 rounded-lg text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                            title="Edit Banner"
                          >
                            <MdEdit className="text-base" />
                          </button>

                          <button
                            onClick={() => handleToggleActive(b.id, b.active)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                              b.active
                                ? "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
                                : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                            }`}
                            title={
                              b.active ? "Deactivate banner" : "Publish banner live"
                            }
                          >
                            {b.active ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            onClick={() => handleDeleteBanner(b.id, b.title)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Banner"
                          >
                            <MdDelete className="text-base" />
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

      {/* DIALOG 1: Create Banner */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MdViewCarousel className="text-xl" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-950">
                    Create Carousel Banner
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Add a hero slide to the storefront homepage
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition"
              >
                <MdClose className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Headline Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer Tech Extravaganza"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Save up to 50% on top laptops, smartphones, and accessories."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Badge Pill (e.g. NEW ARRIVAL)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MEGA DEAL"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Discount Highlight
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UP TO 50% OFF"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Target Destination Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. /?category=Phone or /product/clk..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Banner Background Image <span className="text-rose-500">*</span>
                </label>
                {base64Image ? (
                  <div className="relative w-full h-36 bg-zinc-900 rounded-2xl border border-zinc-200 overflow-hidden flex items-center justify-center group">
                    <Image
                      src={base64Image}
                      alt="Banner Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setBase64Image(null)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-zinc-950/80 text-white flex items-center justify-center hover:bg-rose-600 transition"
                      title="Remove image"
                    >
                      <FiX className="text-sm" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-28 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-indigo-400 bg-zinc-50/70 hover:bg-zinc-50 flex flex-col items-center justify-center cursor-pointer transition">
                    <FiUpload className="text-2xl text-zinc-400 mb-1" />
                    <span className="text-xs font-bold text-zinc-700">
                      Upload Banner Graphic
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      High resolution widescreen PNG, JPG, or WebP
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSubmitting && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>Create Banner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 2: Update Banner */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MdEdit className="text-xl" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-950">
                    Update Banner #{editingBanner.id.slice(0, 8)}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Modify headline copy, tags, or graphic
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingBanner(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition"
              >
                <MdClose className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleUpdateBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Headline Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Subtitle
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Badge
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Discount
                  </label>
                  <input
                    type="text"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Target Link
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Banner Graphic
                </label>
                {base64Image && (
                  <div className="relative w-full h-36 bg-zinc-900 rounded-2xl border border-zinc-200 overflow-hidden mb-2">
                    <Image
                      src={base64Image}
                      alt="Current Banner"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold cursor-pointer transition">
                  <FiUpload className="text-sm" />
                  <span>Replace Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSubmitting && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 3: View / Live Preview Modal */}
      {previewBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
              <div className="flex items-center gap-2">
                <MdVisibility className="text-xl text-indigo-600" />
                <h3 className="font-extrabold text-base text-zinc-950">
                  Storefront Live Hero Preview
                </h3>
              </div>
              <button
                onClick={() => setPreviewBanner(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition"
              >
                <MdClose className="text-lg" />
              </button>
            </div>

            <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden shadow-xl border border-zinc-200 flex items-center">
              {previewBanner.image && (
                <Image
                  src={previewBanner.image}
                  alt={previewBanner.title}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />

              <div className="relative z-10 p-6 sm:p-12 max-w-xl text-white space-y-3">
                <div className="flex items-center gap-2">
                  {previewBanner.badge && (
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                      {previewBanner.badge}
                    </span>
                  )}
                  {previewBanner.discount && (
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider bg-amber-400 text-zinc-950 shadow-xs">
                      {previewBanner.discount}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  {previewBanner.title}
                </h2>

                {previewBanner.subtitle && (
                  <p className="text-xs sm:text-sm text-zinc-200/90 leading-relaxed">
                    {previewBanner.subtitle}
                  </p>
                )}

                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-bold text-xs shadow-md">
                    <span>Shop Collection Now</span>
                    <MdLaunch className="text-sm" />
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 mt-4 border-t border-zinc-100 text-xs text-zinc-500">
              <span>Target URL: <strong className="font-mono text-zinc-800">{previewBanner.link || "/"}</strong></span>
              <button
                onClick={() => setPreviewBanner(null)}
                className="px-5 py-2 rounded-xl bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBannersClient;
