"use client";

import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminPagination from "@/app/components/admin/AdminPagination";
import {
  MdCategory,
  MdAdd,
  MdDelete,
  MdSearch,
  MdLayers,
  MdFolderOpen,
  MdLocalOffer,
  MdClose,
  MdCheckCircle,
} from "react-icons/md";

interface CategoryItem {
  id: string;
  name: string;
  createdAt: string;
  productCount: number;
}

interface ManageCategoriesClientProps {
  initialCategories?: CategoryItem[];
}

const ManageCategoriesClient: React.FC<ManageCategoriesClientProps> = ({
  initialCategories = [],
}) => {
  const router = useRouter();

  // Paginated Data
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories.slice(0, 8));
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(initialCategories.length);
  const [loading, setLoading] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalCategories: initialCategories.length,
    totalAssignedProducts: initialCategories.reduce((sum, c) => sum + (c.productCount || 0), 0),
    inUseCount: initialCategories.filter((c) => (c.productCount || 0) > 0).length,
    emptyCount: initialCategories.filter((c) => (c.productCount || 0) === 0).length,
  });

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch paginated categories from API (8 per page)
  const fetchCategories = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/category", {
        params: {
          page,
          limit: 8,
          search: search.trim(),
        },
      });

      if (res.data) {
        setCategories(res.data.categories || []);
        setTotalCount(res.data.totalCount || 0);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || 1);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount or page change
  useEffect(() => {
    fetchCategories(currentPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCategories, currentPage]);

  // Debounced search handling
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchCategories(1, searchTerm);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchCategories]);

  // Handle Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast.error("Please enter a category name");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/category", { name: trimmed });
      toast.success(`Category "${trimmed}" created!`);
      setNewCategoryName("");
      setIsDialogOpen(false);
      fetchCategories(1, searchTerm);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (id: string, name: string, count: number) => {
    if (count > 0) {
      const confirmed = window.confirm(
        `Category "${name}" currently has ${count} product(s) linked to it. Deleting it will leave those products uncategorized. Proceed?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(
        `Are you sure you want to delete category "${name}"?`
      );
      if (!confirmed) return;
    }

    setDeletingId(id);
    try {
      await axios.delete(`/api/category/${id}`);
      toast.success(`Category "${name}" deleted`);
      fetchCategories(currentPage, searchTerm);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
              Category Management
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Organize products into dynamic store departments and navigation taxonomies with 8-per-page backend pagination.
          </p>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition shadow-sm active:scale-95 cursor-pointer shrink-0"
        >
          <MdAdd className="text-base" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Total Categories
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MdCategory className="text-lg" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-950">
            {stats.totalCategories}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Configured store departments
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Cataloged Products
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MdLayers className="text-lg" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-950">
            {stats.totalAssignedProducts}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
            Items assigned across categories
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Active In Store
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MdCheckCircle className="text-lg" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-950">
            {stats.inUseCount}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            Categories with ≥ 1 live product
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Empty Categories
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <MdFolderOpen className="text-lg" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-950">
            {stats.emptyCount}
          </div>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">
            Awaiting product associations
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-base" />
            <input
              type="text"
              placeholder="Search category name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5 self-end sm:self-auto">
            <span>Showing</span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 font-mono font-bold">
              {categories.length}
            </span>
            <span>of {totalCount} categories</span>
          </div>
        </div>

        {/* Categories Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/70 border-b border-zinc-100 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Category Name</th>
                <th className="py-3.5 px-5">Department ID</th>
                <th className="py-3.5 px-5">Products Linked</th>
                <th className="py-3.5 px-5">Created Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {loading && categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-zinc-400">
                    <span className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin inline-block mb-2" />
                    <p className="font-bold text-zinc-600 text-xs">Loading categories...</p>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    <MdFolderOpen className="mx-auto text-4xl mb-2 text-zinc-300" />
                    <p className="font-bold text-zinc-600">No categories found</p>
                    <p className="text-[11px] mt-0.5">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "Click 'Add New Category' above to create your first category"}
                    </p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const dateStr = cat.createdAt
                    ? new Date(cat.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-zinc-50/60 transition group"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100">
                            {cat.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-zinc-950 text-sm block">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              Direct store filter key
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 font-mono text-[11px] text-zinc-500">
                        {cat.id.slice(0, 12)}...
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            cat.productCount > 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                          }`}
                        >
                          <MdLocalOffer className="text-xs" />
                          <span>
                            {cat.productCount} {cat.productCount === 1 ? "Product" : "Products"}
                          </span>
                        </span>
                      </td>

                      <td className="py-4 px-5 text-zinc-600 font-medium">
                        {dateStr}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() =>
                            handleDeleteCategory(cat.id, cat.name, cat.productCount)
                          }
                          disabled={deletingId === cat.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition text-xs font-bold cursor-pointer disabled:opacity-50"
                          title="Delete Category"
                        >
                          <MdDelete className="text-base" />
                          <span>Delete</span>
                        </button>
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

      {/* Dialog / Modal: Add New Category */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MdCategory className="text-lg" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-950">
                    Add Store Category
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Create a new catalog taxonomy department
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition"
              >
                <MdClose className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Laptops, Audio, Gaming..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
                <p className="text-[10px] text-zinc-400 mt-1.5 leading-normal">
                  Products in the catalog can be categorized under this name for instant customer filtering and storefront discovery.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSubmitting && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>Create Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategoriesClient;
