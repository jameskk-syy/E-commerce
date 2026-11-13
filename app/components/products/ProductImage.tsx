"use client";

import React from "react";
import Image from "next/image";
import {
  CartProductType,
  selectedImageType,
} from "@/app/productDetails/ProductDetailsComponent";

interface ProductImageProps {
  cartProduct: CartProductType;
  product: any;
  handleColorSelect: (value: selectedImageType) => void;
}

const ProductImage: React.FC<ProductImageProps> = ({
  cartProduct,
  product,
  handleColorSelect,
}) => {
  const images = Array.isArray(product?.images) ? product.images : [];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 items-center md:items-start w-full">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[480px] shrink-0 p-1">
          {images.map((image: selectedImageType) => {
            const isSelected = cartProduct.selectedImg.color === image.color;

            return (
              <button
                type="button"
                key={image.color}
                onClick={() => handleColorSelect(image)}
                className={`
                  relative
                  w-16
                  h-16
                  sm:w-20
                  sm:h-20
                  rounded-xl
                  bg-zinc-50
                  p-1.5
                  border-2
                  transition
                  overflow-hidden
                  cursor-pointer
                  hover:border-zinc-400
                  ${
                    isSelected
                      ? "border-zinc-950 shadow-sm"
                      : "border-zinc-200/80 opacity-70 hover:opacity-100"
                  }
                `}
                title={image.color}
              >
                <Image
                  src={image.image}
                  alt={image.color}
                  fill
                  unoptimized={image.image?.startsWith("data:")}
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Preview Box */}
      <div className="relative w-full aspect-square max-h-[480px] bg-zinc-50 rounded-2xl border border-zinc-200/80 flex items-center justify-center p-8 overflow-hidden group">
        {/* Selected Color Pill */}
        <span className="absolute top-4 left-4 z-10 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-zinc-700 border border-zinc-200 shadow-2xs">
          Color: <span className="text-zinc-950 font-bold">{cartProduct.selectedImg.color}</span>
        </span>

        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={cartProduct.selectedImg.image || "/placeholder.png"}
            alt={cartProduct.name}
            fill
            priority
            unoptimized={cartProduct.selectedImg.image?.startsWith("data:")}
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductImage;
