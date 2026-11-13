"use client";

import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { FiShoppingBag } from "react-icons/fi";

const CartCount = () => {
  const { cartTotalQty } = useCart();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/cart")}
      className="relative p-2 rounded-full hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 transition flex items-center justify-center cursor-pointer outline-none"
      title="View Shopping Cart"
    >
      <FiShoppingBag className="text-xl" />
      {cartTotalQty > 0 && (
        <span className="absolute -top-1 -right-1 bg-zinc-950 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
          {cartTotalQty}
        </span>
      )}
    </button>
  );
};

export default CartCount;
