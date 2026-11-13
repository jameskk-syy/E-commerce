import prisma from "@/libs/prismadb";

export interface IProductParams {
  category?: string | null;
  searchTerm?: string | null;
  minPrice?: string | number | null;
  maxPrice?: string | number | null;
  rating?: string | number | null;
  color?: string | null;
  inStock?: string | boolean | null;
  sort?: string | null;
}

export default async function getProducts(params: IProductParams) {
  try {
    const {
      category,
      searchTerm,
      minPrice,
      maxPrice,
      rating,
      color,
      inStock,
      sort,
    } = params;

    const query: any = {};

    // Filter by Category
    if (category && category !== "All") {
      query.category = category;
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        query.price.gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        query.price.lte = Number(maxPrice);
      }
    }

    // Filter by Stock Status
    if (inStock === "true" || inStock === true) {
      query.inStock = true;
    }

    // Search query
    if (searchTerm && searchTerm.trim() !== "") {
      const searchString = searchTerm.trim();
      query.OR = [
        { name: { contains: searchString } },
        { description: { contains: searchString } },
        { brand: { contains: searchString } },
      ];
    }

    // Determine Prisma orderBy
    let orderBy: any = undefined;
    if (sort === "price-asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price-desc") {
      orderBy = { price: "desc" };
    }

    let products = await prisma.product.findMany({
      where: query,
      orderBy: orderBy,
      include: {
        reviews: {
          include: {
            user: true,
          },
          orderBy: {
            createdDate: "desc",
          },
        },
      },
    });

    // Post-filter by minimum customer rating
    if (rating && !isNaN(Number(rating))) {
      const minRating = Number(rating);
      products = products.filter((product) => {
        if (!product.reviews || product.reviews.length === 0) return false;
        const avgRating =
          product.reviews.reduce((acc, r) => acc + r.rating, 0) /
          product.reviews.length;
        return avgRating >= minRating;
      });
    }

    // Post-filter by available color
    if (color && typeof color === "string") {
      const targetColor = color.toLowerCase();
      products = products.filter((product) => {
        if (!Array.isArray(product.images)) return false;
        return product.images.some(
          (img: any) => img.color && img.color.toLowerCase() === targetColor
        );
      });
    }

    return products;
  } catch (error: any) {
    console.error("Error in getProducts:", error);
    throw new Error(error?.message || "Failed to load products");
  }
}
