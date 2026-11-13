"use client";

import React, { useCallback, useEffect, useState } from "react";
import ProductImage from "../components/products/ProductImage";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils/formatPrice";
import { AiFillStar } from "react-icons/ai";
import { FiCheck, FiShoppingBag, FiShield, FiTruck, FiSmartphone, FiMinus, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

interface ProductDetailsProps {
  product: any;
}

export type CartProductType = {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  selectedImg: selectedImageType;
  quantity: number;
  price: number;
};

export type selectedImageType = {
  color: string;
  colorCode: string;
  image: string;
};

const ProductDetailsComponent: React.FC<ProductDetailsProps> = ({ product }) => {
  const router = useRouter();
  const { handleAddProductToCart, cartProducts } = useCart();
  const [isProductInCart, setIsProductInCart] = useState(false);

  const initialImage =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : { color: "Default", colorCode: "#000000", image: "/placeholder.png" };

  const [cartProduct, setCartProduct] = useState<CartProductType>({
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    brand: product.brand,
    selectedImg: { ...initialImage },
    quantity: 1,
    price: product.price,
  });

  // Check if product is in cart
  useEffect(() => {
    setIsProductInCart(false);
    if (cartProducts) {
      const existingIndex = cartProducts.findIndex(
        (item) => item.id === product.id
      );
      if (existingIndex > -1) {
        setIsProductInCart(true);
      }
    }
  }, [cartProducts, product.id]);

  const totalReviews = product.reviews?.length || 0;
  const productRating =
    totalReviews > 0
      ? product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) /
        totalReviews
      : 5;

  const handleColorSelect = useCallback((value: selectedImageType) => {
    setCartProduct((prev) => ({ ...prev, selectedImg: value }));
  }, []);

  const handleQtyIncrease = () => {
    if (cartProduct.quantity >= 99) return;
    setCartProduct((prev) => ({ ...prev, quantity: prev.quantity + 1 }));
  };

  const handleQtyDecrease = () => {
    if (cartProduct.quantity <= 1) return;
    setCartProduct((prev) => ({ ...prev, quantity: prev.quantity - 1 }));
  };

  const handleAddToCart = () => {
    handleAddProductToCart(cartProduct);
    setIsProductInCart(true);
  };

  const handleBuyNow = () => {
    handleAddProductToCart(cartProduct);
    router.push("/checkout");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
      {/* Left: Product Images */}
      <div>
        <ProductImage
          cartProduct={cartProduct}
          product={product}
          handleColorSelect={handleColorSelect}
        />
      </div>

      {/* Right: Product Info & Actions */}
      <div className="flex flex-col gap-5 text-zinc-600">
        <div>
          {/* Category & Brand Pill */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              {product.category}
            </span>
            <span className="text-xs font-semibold text-zinc-400">•</span>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {product.brand}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-snug">
            {product.name}
          </h1>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2 mt-2 text-xs">
            <div className="flex items-center text-amber-400">
              <AiFillStar className="text-sm" />
              <span className="font-bold text-zinc-900 ml-1 text-xs">
                {productRating.toFixed(1)}
              </span>
            </div>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-500">
              {totalReviews} {totalReviews === 1 ? "customer review" : "customer reviews"}
            </span>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-zinc-400 block">Unit Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-zinc-950 font-sans">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                (Inclusive of VAT)
              </span>
            </div>
          </div>

          <div>
            {product.inStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Overview
          </h4>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Color Variants */}
        {Array.isArray(product.images) && product.images.length > 0 && (
          <div className="pt-2 border-t border-zinc-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
              Available Colors
            </h4>
            <div className="flex items-center gap-3">
              {product.images.map((img: selectedImageType) => {
                const isSelected = cartProduct.selectedImg.color === img.color;
                return (
                  <button
                    key={img.color}
                    type="button"
                    onClick={() => handleColorSelect(img)}
                    className={`
                      w-8
                      h-8
                      rounded-full
                      flex
                      items-center
                      justify-center
                      transition-all
                      cursor-pointer
                      ${
                        isSelected
                          ? "ring-2 ring-zinc-950 ring-offset-2 scale-110 shadow-xs"
                          : "border border-zinc-300 hover:scale-105"
                      }
                    `}
                    style={{ backgroundColor: img.colorCode }}
                    title={img.color}
                  >
                    {isSelected && (
                      <FiCheck
                        className={`text-xs ${
                          img.color.toLowerCase() === "white" ||
                          img.color.toLowerCase() === "silver"
                            ? "text-zinc-900"
                            : "text-white"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Controls & Stock Statistics */}
        {product.inStock && (
          <div className="pt-2 border-t border-zinc-100 flex flex-col gap-3">
            {/* Live Inventory Statistic Card */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  (product.stockQuantity ?? 10) <= 5 ? "bg-amber-500 animate-ping" : "bg-emerald-500 animate-pulse"
                }`}></span>
                <span className="font-bold text-zinc-900">
                  {product.stockQuantity !== undefined ? product.stockQuantity : 10} units in stock
                </span>
              </div>
              <span className={`text-[11px] font-semibold ${
                (product.stockQuantity ?? 10) <= 5 ? "text-amber-700 font-bold" : "text-emerald-700"
              }`}>
                {(product.stockQuantity ?? 10) <= 5 ? "Fast selling • Order soon" : "Ready to ship"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Quantity:
              </span>
              <div className="flex items-center gap-3 bg-zinc-100 border border-zinc-200 rounded-xl p-1">
                <button
                  type="button"
                  onClick={handleQtyDecrease}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-zinc-200 text-zinc-800 flex items-center justify-center transition shadow-2xs text-xs font-bold cursor-pointer"
                  title="Decrease"
                >
                  <FiMinus />
                </button>
                <span className="text-sm font-bold text-zinc-900 min-w-[20px] text-center font-mono">
                  {cartProduct.quantity}
                </span>
                <button
                  type="button"
                  onClick={handleQtyIncrease}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-zinc-200 text-zinc-800 flex items-center justify-center transition shadow-2xs text-xs font-bold cursor-pointer"
                  title="Increase"
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {product.inStock ? (
            <>
              {isProductInCart ? (
                <button
                  type="button"
                  onClick={() => router.push("/cart")}
                  className="
                    flex-1
                    py-3.5
                    px-5
                    rounded-xl
                    bg-emerald-600
                    hover:bg-emerald-500
                    text-white
                    text-xs
                    font-bold
                    transition
                    shadow-sm
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >
                  <FiCheck className="text-sm" />
                  <span>Item in Cart • View Cart</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="
                    flex-1
                    py-3.5
                    px-5
                    rounded-xl
                    bg-zinc-950
                    hover:bg-zinc-800
                    text-white
                    text-xs
                    font-bold
                    transition
                    shadow-sm
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >
                  <FiShoppingBag className="text-sm" />
                  <span>Add to Cart</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleBuyNow}
                className="
                  flex-1
                  py-3.5
                  px-5
                  rounded-xl
                  bg-emerald-700
                  hover:bg-emerald-800
                  text-white
                  text-xs
                  font-bold
                  transition
                  shadow-sm
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                <FiSmartphone className="text-sm" />
                <span>Pay with M-Pesa</span>
              </button>
            </>
          ) : (
            <button
              disabled
              className="w-full py-3.5 rounded-xl bg-zinc-200 text-zinc-400 text-xs font-bold cursor-not-allowed text-center"
            >
              Temporarily Out of Stock
            </button>
          )}
        </div>

        {/* Confidence & Guarantees */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-zinc-100 text-center text-[11px] text-zinc-500">
          <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
            <FiShield className="text-base text-zinc-800" />
            <span className="font-bold text-zinc-900">1-Year Warranty</span>
            <span className="text-[10px] text-zinc-400">100% Genuine Tech</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <FiSmartphone className="text-base text-emerald-600" />
            <span className="font-bold text-emerald-950">M-Pesa STK</span>
            <span className="text-[10px] text-emerald-700">Instant Pin Prompt</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
            <FiTruck className="text-base text-zinc-800" />
            <span className="font-bold text-zinc-900">Fast Delivery</span>
            <span className="text-[10px] text-zinc-400">Nairobi Same-Day</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
            <FiCheck className="text-base text-indigo-600" />
            <span className="font-bold text-zinc-900">Easy Returns</span>
            <span className="text-[10px] text-zinc-400">7-Day Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsComponent;
