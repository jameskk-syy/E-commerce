"use client";

import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { formatPrice } from "@/utils/formatPrice";
import AdminPagination from "@/app/components/admin/AdminPagination";
import {
  MdDns,
  MdAdd,
  MdDelete,
  MdSearch,
  MdCheckCircle,
  MdWarning,
  MdBlock,
  MdClose,
  MdAddShoppingCart,
  MdVisibility,
  MdVisibilityOff,
  MdLayers,
  MdCategory,
  MdOutlineImage,
} from "react-icons/md";
import { FiUpload, FiX } from "react-icons/fi";

interface ManageProductsClientProps {
  products?: any[];
}

interface CategoryOption {
  id: string;
  name: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const getProductImage = (images: any): string => {
  if (!images) return "";
  if (Array.isArray(images) && images.length > 0) {
    return images[0]?.image || "";
  }
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0]?.image || "";
      }
      return images;
    } catch {
      return images;
    }
  }
  return "";
};

const ManageProductsClient: React.FC<ManageProductsClientProps> = ({
  products: initialProducts = [],
}) => {
  const router = useRouter();

  // Paginated Data & Stats from API
  const [products, setProducts] = useState<any[]>(initialProducts.slice(0, 8));
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(initialProducts.length);
  const [loading, setLoading] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalProducts: initialProducts.length,
    totalUnits: initialProducts.reduce((sum, p) => sum + (p.stockQuantity || 0), 0),
    inStockCount: initialProducts.filter((p) => p.inStock && (p.stockQuantity || 0) > 0).length,
    lowStockCount: initialProducts.filter((p) => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 5).length,
    outOfStockCount: initialProducts.filter((p) => !p.inStock || (p.stockQuantity || 0) === 0).length,
  });

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");

  // Dynamic categories from backend for create form
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>([]);

  // Dialog states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState<any | null>(null);

  // Add Product Form State
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addBrand, setAddBrand] = useState("");
  const [addCategory, setAddCategory] = useState("");
  const [addPrice, setAddPrice] = useState("0.0");
  const [addStockQuantity, setAddStockQuantity] = useState("0");
  const [addImageBase64, setAddImageBase64] = useState<string | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Restock Dialog Form State
  const [restockQty, setRestockQty] = useState("10");
  const [buyingPrice, setBuyingPrice] = useState("0.0");
  const [sellingPrice, setSellingPrice] = useState("0.0");
  const [isSubmittingRestock, setIsSubmittingRestock] = useState(false);

  // Fetch paginated products from backend API (8 per page)
  const fetchProducts = useCallback(async (page: number, search: string, filter: string) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/product", {
        params: {
          page,
          limit: 8,
          search: search.trim(),
          stockFilter: filter,
        },
      });

      if (res.data) {
        setProducts(res.data.products || []);
        setTotalCount(res.data.totalCount || 0);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || 1);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load paginated products:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount or when page/filter changes
  useEffect(() => {
    fetchProducts(currentPage, searchTerm, stockFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProducts, currentPage, stockFilter]);

  // Debounced search handling
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1, searchTerm, stockFilter);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, stockFilter, fetchProducts]);

  // Fetch categories for Add Product dialog
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get("/api/category?all=true");
      if (Array.isArray(res.data)) {
        setCategoriesList(res.data);
        if (res.data.length > 0 && !addCategory) {
          setAddCategory(res.data[0].name);
        }
      }
    } catch (err) {
      console.warn("Could not load backend categories:", err);
    }
  }, [addCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Image file handler for Add Product
  const handleProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        setAddImageBase64(base64);
        toast.success("Product image ready");
      } catch {
        toast.error("Failed to read image file");
      }
    }
  };

  // Submit Add Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    if (!addCategory) {
      toast.error("Please select a category");
      return;
    }
    if (!addImageBase64) {
      toast.error("Please upload a product image");
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const imagesPayload = [
        {
          color: "Standard",
          colorCode: "#000000",
          image: addImageBase64,
        },
      ];

      await axios.post("/api/product", {
        name: addName.trim(),
        description: addDescription.trim() || addName.trim(),
        brand: addBrand.trim() || "General",
        category: addCategory,
        price: parseFloat(addPrice || "0"),
        stockQuantity: parseInt(addStockQuantity || "0", 10),
        images: imagesPayload,
      });

      toast.success("Product created successfully!");
      setAddName("");
      setAddDescription("");
      setAddBrand("");
      setAddPrice("0.0");
      setAddStockQuantity("0");
      setAddImageBase64(null);
      setIsAddProductOpen(false);
      fetchProducts(1, searchTerm, stockFilter);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to create product");
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Open Restock Dialog
  const handleOpenRestock = (product: any) => {
    setRestockProduct(product);
    setRestockQty("10");
    setBuyingPrice("0.0");
    setSellingPrice(String(product.price || "0.0"));
  };

  // Submit Restock & Price update
  const handleSubmitRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;

    const unitsToAdd = parseInt(restockQty, 10);
    if (isNaN(unitsToAdd) || unitsToAdd <= 0) {
      toast.error("Please enter a valid number of units to add");
      return;
    }

    const updatedSelling = parseFloat(sellingPrice || "0");
    if (isNaN(updatedSelling) || updatedSelling < 0) {
      toast.error("Please enter a valid selling price");
      return;
    }

    setIsSubmittingRestock(true);
    try {
      await axios.put("/api/product", {
        id: restockProduct.id,
        addStock: unitsToAdd,
        price: updatedSelling,
      });

      toast.success(
        `Added ${unitsToAdd} units to stock! Selling price set to ${formatPrice(
          updatedSelling
        )}.`
      );
      setRestockProduct(null);
      fetchProducts(currentPage, searchTerm, stockFilter);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to update stock");
    } finally {
      setIsSubmittingRestock(false);
    }
  };

  // Toggle inStock availability
  const handleToggleStock = async (id: string, currentInStock: boolean) => {
    try {
      await axios.put("/api/product", {
        id,
        inStock: !currentInStock,
      });
      toast.success("Product visibility updated");
      fetchProducts(currentPage, searchTerm, stockFilter);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle product status");
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await axios.delete(`/api/product/${id}`);
      toast.success("Product deleted successfully");
      fetchProducts(currentPage, searchTerm, stockFilter);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
              Products & Inventory Stock
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Manage live catalog items, stock purchases, selling prices, and availability with backend 8-per-page pagination.
          </p>
        </div>

        <button
          onClick={() => setIsAddProductOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs hover:bg-zinc-800 transition shadow-sm active:scale-95 cursor-pointer shrink-0"
        >
          <MdAdd className="text-base" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Total SKUs
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MdDns className="text-base sm:text-lg" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-950">
            {stats.totalProducts}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block truncate">
            Cataloged items
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Units In Stock
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MdLayers className="text-base sm:text-lg" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-950">
            {stats.totalUnits.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block truncate">
            Total physical inventory
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Healthy Stock
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MdCheckCircle className="text-base sm:text-lg" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-950">
            {stats.inStockCount}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block truncate">
            &gt; 5 units available
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <MdWarning className="text-base sm:text-lg" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-950">
            {stats.lowStockCount}
          </div>
          <span className="text-[10px] text-amber-600 font-bold mt-1 block truncate">
            1 to 5 units remaining
          </span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Out of Stock
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <MdBlock className="text-base sm:text-lg" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600">
            {stats.outOfStockCount}
          </div>
          <span className="text-[10px] text-rose-500 font-medium mt-1 block truncate">
            Zero inventory or disabled
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-base" />
            <input
              type="text"
              placeholder="Search by name, category, brand, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Items" },
              { id: "in_stock", label: "In Stock" },
              { id: "low_stock", label: "Low Stock (≤5)" },
              { id: "out_of_stock", label: "Out of Stock" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStockFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  stockFilter === tab.id
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
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-zinc-400">
                    <span className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin inline-block mb-2" />
                    <p className="font-bold text-zinc-600 text-xs">
                      Loading products...
                    </p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-zinc-400">
                    <MdDns className="mx-auto text-4xl mb-2 text-zinc-300" />
                    <p className="font-bold text-zinc-600 text-sm">
                      No products found
                    </p>
                    <p className="text-[11px] mt-0.5">
                      {searchTerm
                        ? "Try adjusting your search or stock filters"
                        : "Click 'Add New Product' above to catalog your first product"}
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const qty = p.stockQuantity ?? 0;
                  const isLow = qty > 0 && qty <= 5;
                  const isOut = qty === 0 || !p.inStock;
                  const imgSrc = getProductImage(p.images);

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/70 transition group"
                    >
                      {/* Product Name & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200/80 overflow-hidden shrink-0 relative flex items-center justify-center">
                            {imgSrc ? (
                              <Image
                                src={imgSrc}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            ) : (
                              <MdOutlineImage className="text-zinc-400 text-xl" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span
                              className="font-extrabold text-zinc-950 text-xs block truncate"
                              title={p.name}
                            >
                              {p.name}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400">
                              SKU: {p.id.slice(0, 10)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-semibold text-[11px]">
                          <MdCategory className="text-[10px] text-zinc-400" />
                          <span>{p.category || "Unassigned"}</span>
                        </span>
                      </td>

                      {/* Brand */}
                      <td className="py-3.5 px-4 text-zinc-600 font-medium">
                        {p.brand || "—"}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 font-black text-zinc-950 text-xs font-mono">
                        {formatPrice(p.price || 0)}
                      </td>

                      {/* Stock Units */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md ${
                              isOut
                                ? "bg-rose-100 text-rose-800"
                                : isLow
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {qty} units
                          </span>
                          {isLow && (
                            <span
                              className="text-[10px] text-amber-600 font-bold"
                              title="Low stock alert"
                            >
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.inStock && qty > 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.inStock && qty > 0
                                ? "bg-emerald-500"
                                : "bg-zinc-400"
                            }`}
                          />
                          <span>
                            {p.inStock && qty > 0 ? "Active" : "Unavailable"}
                          </span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Add Stock Dialog Trigger */}
                          <button
                            onClick={() => handleOpenRestock(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition text-[11px] font-bold cursor-pointer"
                            title="Add Stock & Update Pricing"
                          >
                            <MdAddShoppingCart className="text-sm" />
                            <span>Add Stock</span>
                          </button>

                          {/* Toggle Active Status */}
                          <button
                            onClick={() => handleToggleStock(p.id, p.inStock)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
                            title={p.inStock ? "Hide from Storefront" : "Show on Storefront"}
                          >
                            {p.inStock ? (
                              <MdVisibility className="text-base" />
                            ) : (
                              <MdVisibilityOff className="text-base text-zinc-400" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Product"
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

      {/* DIALOG 1: Add New Product */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  <MdAdd className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-zinc-950">
                    Add New Product
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Initial quantity starts at 0 and selling price defaults to 0.0
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition"
              >
                <MdClose className="text-lg" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Product Title / Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. MacBook Pro 16-inch M3 Max"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                  >
                    {categoriesList.length === 0 ? (
                      <option value="General">General (Default)</option>
                    ) : (
                      categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Dell, Sony"
                    value={addBrand}
                    onChange={(e) => setAddBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Selling Price (KSh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.0"
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-mono"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Defaults to 0.0 (set retail price during restock or now)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Initial Stock Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={addStockQuantity}
                    onChange={(e) => setAddStockQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-mono"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Defaults to 0 (add inventory using Add Stock dialog)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Key features, specifications, warranty, etc."
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Product Image <span className="text-rose-500">*</span>
                </label>
                {addImageBase64 ? (
                  <div className="relative w-full h-40 bg-zinc-50 rounded-2xl border border-zinc-200 overflow-hidden flex items-center justify-center group">
                    <Image
                      src={addImageBase64}
                      alt="Uploaded preview"
                      fill
                      className="object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => setAddImageBase64(null)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-zinc-950/80 text-white flex items-center justify-center hover:bg-rose-600 transition"
                      title="Remove image"
                    >
                      <FiX className="text-sm" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-32 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-indigo-400 bg-zinc-50/70 hover:bg-zinc-50 flex flex-col items-center justify-center cursor-pointer transition">
                    <FiUpload className="text-2xl text-zinc-400 mb-2" />
                    <span className="text-xs font-bold text-zinc-700">
                      Upload Product Image
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">
                      PNG, JPG, WebP (encoded cleanly to Base64)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSubmittingProduct && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>Create Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 2: Add Stock Dialog */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MdAddShoppingCart className="text-xl" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-950">
                    Restock Product Inventory
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Add purchased stock units and set updated retail selling price
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRestockProduct(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition"
              >
                <MdClose className="text-lg" />
              </button>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80 mb-5 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Product
                </span>
                <span className="text-xs font-black text-zinc-900 block truncate">
                  {restockProduct.name}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  Current Stock:{" "}
                  <strong className="text-zinc-900 font-mono">
                    {restockProduct.stockQuantity ?? 0} units
                  </strong>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Current Price
                </span>
                <span className="text-xs font-black text-indigo-600 font-mono">
                  {formatPrice(restockProduct.price || 0)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitRestock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Stock Units Purchased to Add <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 20"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-mono"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  New total will be:{" "}
                  <strong className="text-zinc-700 font-mono">
                    {(restockProduct.stockQuantity ?? 0) +
                      (parseInt(restockQty, 10) || 0)}{" "}
                    units
                  </strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Buying Price per Unit (KSh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 25000"
                    value={buyingPrice}
                    onChange={(e) => setBuyingPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-mono"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Acquisition cost per unit
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    New Selling Price (KSh) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 32000"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-mono"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Retail price shown to customers
                  </span>
                </div>
              </div>

              {parseFloat(sellingPrice) > 0 && parseFloat(buyingPrice) > 0 && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-800 flex items-center justify-between">
                  <span>Gross Margin per Unit:</span>
                  <span className="font-extrabold font-mono">
                    {formatPrice(parseFloat(sellingPrice) - parseFloat(buyingPrice))} (
                    {(
                      ((parseFloat(sellingPrice) - parseFloat(buyingPrice)) /
                        parseFloat(sellingPrice)) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRestock}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSubmittingRestock && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>Save Restock & Price</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProductsClient;
