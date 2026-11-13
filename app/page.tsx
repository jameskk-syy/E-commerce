export const revalidate = 0;

import Container from "./components/Container";
import HomeBunner from "./components/HomeBunner";
import ProductCard from "./components/products/ProductCard";
import FilterSidebar from "./components/products/FilterSidebar";
import ProductGridHeader from "./components/products/ProductGridHeader";
import getProducts, { IProductParams } from "@/actions/getProducts";
import getCategories from "@/actions/getCategories";
import getBanners from "@/actions/getBanners";
import Link from "next/link";
import { FiInbox } from "react-icons/fi";

interface HomeProps {
  searchParams: IProductParams;
}

export default async function Home({ searchParams }: HomeProps) {
  const [products, categories, banners] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
    getBanners(),
  ]);

  const hasBanners = Boolean(banners && banners.length > 0);

  return (
    <div className="py-6 md:py-8 bg-zinc-50/50 min-h-screen">
      <Container>
        {/* Dynamic Neo-minimalist Hero Banner Carousel */}
        {hasBanners && <HomeBunner banners={banners} />}

        {/* Storefront Content with Sidebar on Left */}
        <div
          id="products-section"
          className={`flex flex-col lg:flex-row gap-8 items-start ${
            hasBanners ? "pt-4" : "pt-0"
          }`}
        >
          {/* Left Column: Filter Sidebar */}
          <FilterSidebar categories={categories} totalCount={products?.length || 0} />

          {/* Right Column: Header & Product Grid */}
          <main className="flex-1 w-full">
            <ProductGridHeader totalCount={products?.length || 0} />

            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product: any) => (
                  <ProductCard data={product} key={product.id} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center flex flex-col items-center justify-center my-6">
                <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-2xl mb-4">
                  <FiInbox />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 mb-1">
                  No products found
                </h3>
                <p className="text-sm text-zinc-500 max-w-sm mb-6">
                  No devices matched your selected filters. Try loosening your criteria or search term.
                </p>
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition"
                >
                  Reset All Filters
                </Link>
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}
