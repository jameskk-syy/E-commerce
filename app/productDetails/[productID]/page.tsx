import React from "react";
import ProductDetailsComponent from "../ProductDetailsComponent";
import Container from "@/app/components/Container";
import ListRating from "../ListRating";
import getProductById from "@/actions/getProductById";
import NullData from "@/app/components/NullData";
import AddRating from "../AddRating";
import { getCurrentUser } from "@/actions/getCurrentUser";
import Link from "next/link";

interface IParams {
  productID?: string;
}

const ProductPage = async ({ params }: { params: IParams }) => {
  const user = await getCurrentUser();
  const product = await getProductById(params);

  if (!product) {
    return (
      <div className="py-16">
        <NullData title="Product not found or has been discontinued." />
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 bg-zinc-50/50 min-h-screen">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-zinc-800 transition">Store</Link>
          <span>/</span>
          <Link href={`/?category=${product.category}`} className="hover:text-zinc-800 transition capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-zinc-800 font-semibold line-clamp-1">{product.name}</span>
        </nav>

        {/* Main Product Details */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-10 shadow-xs mb-10">
          <ProductDetailsComponent product={product} />
        </div>

        {/* Customer Reviews & Feedback */}
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {user ? (
            <AddRating product={product} user={user} />
          ) : (
            <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white text-xs text-zinc-600 text-center shadow-xs">
              Want to share your experience?{" "}
              <Link href="/login" className="text-indigo-600 font-bold hover:underline">
                Sign in to rate and review this product
              </Link>
              .
            </div>
          )}
          <ListRating product={product} />
        </div>
      </Container>
    </div>
  );
};

export default ProductPage;
