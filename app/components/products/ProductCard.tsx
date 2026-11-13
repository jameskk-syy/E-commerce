"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { formatPrice } from "@/utils/formatPrice";
import { useRouter } from "next/navigation";
import { AiFillStar } from "react-icons/ai";
import { FiPlus, FiMinus, FiCheck, FiShoppingBag } from "react-icons/fi";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  data: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  const router = useRouter();
  const { cartProducts, handleAddProductToCart, handleCartQtyIncrease, handleCartQtyDecrease } = useCart();

  // Average review rating calculation
  const totalReviews = data.reviews?.length || 0;
  const productRating =
    totalReviews > 0
      ? data.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) /
        totalReviews
      : 5;

  const firstImage =
    data.images && data.images.length > 0
      ? data.images[0]
      : { color: "Default", colorCode: "#000000", image: "/placeholder.png" };

  // Check if item is already in cart
  const cartItem = useMemo(() => {
    if (!cartProducts) return null;
    return cartProducts.find((item) => item.id === data.id);
  }, [cartProducts, data.id]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.inStock === false) return;

    const cartProduct = {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      brand: data.brand,
      selectedImg: {
        color: firstImage.color || "Default",
        colorCode: firstImage.colorCode || "#000000",
        image: firstImage.image || "/placeholder.png",
      },
      quantity: 1,
      price: data.price,
    };

    handleAddProductToCart(cartProduct);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      handleCartQtyIncrease(cartItem);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      handleCartQtyDecrease(cartItem);
    }
  };

  return (
    <div
      onClick={() => router.push(`/productDetails/${data.id}`)}
      className="
        group
        bg-white
        rounded-2xl
        p-4
        border
        border-zinc-200/80
        hover:border-zinc-300
        hover:shadow-lg
        hover:-translate-y-0.5
        transition-all
        duration-300
        cursor-pointer
        flex
        flex-col
        justify-between
        h-full
      "
    >
      <div>
        {/* Image Box */}
        <div className="relative bg-zinc-50 rounded-xl aspect-square flex items-center justify-center p-4 overflow-hidden mb-3.5">
          {/* Badge: Category or Stock */}
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-zinc-800 border border-zinc-200/60 shadow-2xs">
              {data.category || "Tech"}
            </span>
          </div>

          {data.inStock === false ? (
            <span className="absolute top-2.5 right-2.5 z-10 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
              Out of stock
            </span>
          ) : cartItem ? (
            <span className="absolute top-2.5 right-2.5 z-10 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <FiCheck className="text-xs" /> In Cart
            </span>
          ) : null}

          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={firstImage.image}
              alt={data.name}
              fill
              unoptimized={firstImage.image?.startsWith("data:")}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Brand & Title */}
        <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
          {data.brand || "TechHub"}
        </div>

        <h3 className="text-sm font-bold text-zinc-900 line-clamp-1 group-hover:text-indigo-600 transition mb-1.5">
          {data.name}
        </h3>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-1.5 text-xs mb-3">
          <div className="flex items-center text-amber-400 text-xs">
            <AiFillStar />
            <span className="font-bold text-zinc-800 text-[11px] ml-1">
              {productRating.toFixed(1)}
            </span>
          </div>
          <span className="text-zinc-300 text-[11px]">•</span>
          <span className="text-[11px] text-zinc-400">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      {/* Price & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-2">
        <div>
          <span className="text-[10px] text-zinc-400 block font-medium">Price</span>
          <span className="text-base font-extrabold text-zinc-950">
            {formatPrice(data.price)}
          </span>
        </div>

        {/* Action Controls */}
        {data.inStock === false ? (
          <span className="text-xs font-semibold text-zinc-400 px-3 py-1.5 bg-zinc-100 rounded-lg">
            Unavailable
          </span>
        ) : cartItem ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 bg-zinc-100 border border-zinc-200/80 rounded-lg p-1"
          >
            <button
              onClick={handleDecrease}
              className="w-6 h-6 rounded bg-white hover:bg-zinc-200 text-zinc-800 flex items-center justify-center transition shadow-2xs text-xs font-bold"
              title="Decrease quantity"
            >
              <FiMinus />
            </button>
            <span className="text-xs font-bold text-zinc-900 min-w-[14px] text-center font-mono">
              {cartItem.quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="w-6 h-6 rounded bg-white hover:bg-zinc-200 text-zinc-800 flex items-center justify-center transition shadow-2xs text-xs font-bold"
              title="Increase quantity"
            >
              <FiPlus />
            </button>
          </div>
        ) : (
          <button
            onClick={handleQuickAdd}
            className="
              px-3.5
              py-1.5
              rounded-lg
              bg-zinc-900
              hover:bg-indigo-600
              text-white
              text-xs
              font-semibold
              transition
              flex
              items-center
              gap-1.5
              shadow-2xs
            "
            title="Add to cart"
          >
            <FiPlus className="text-xs" />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
