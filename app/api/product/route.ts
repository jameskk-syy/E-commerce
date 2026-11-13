import { getCurrentUser } from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "8", 10));
    const search = searchParams.get("search")?.trim() || "";
    const stockFilter = searchParams.get("stockFilter") || "all";

    const where: any = {};

    // Stock Filter
    if (stockFilter === "in_stock") {
      where.inStock = true;
      where.stockQuantity = { gt: 0 };
    } else if (stockFilter === "low_stock") {
      where.stockQuantity = { gt: 0, lte: 5 };
    } else if (stockFilter === "out_of_stock") {
      where.OR = [
        { inStock: false },
        { stockQuantity: { lte: 0 } },
      ];
    }

    // Search term
    if (search) {
      const searchConditions = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { category: { contains: search } },
        { id: { contains: search } },
      ];
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions },
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const skip = (page - 1) * limit;

    const [
      products,
      totalCount,
      totalProducts,
      totalUnitsAgg,
      inStockCount,
      lowStockCount,
      outOfStockCount,
    ] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.product.count({ where }),
      prisma.product.count(),
      prisma.product.aggregate({
        _sum: { stockQuantity: true },
      }),
      prisma.product.count({
        where: { inStock: true, stockQuantity: { gt: 0 } },
      }),
      prisma.product.count({
        where: { stockQuantity: { gt: 0, lte: 5 } },
      }),
      prisma.product.count({
        where: {
          OR: [
            { inStock: false },
            { stockQuantity: { lte: 0 } },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      currentPage: page,
      limit,
      stats: {
        totalProducts,
        totalUnits: totalUnitsAgg._sum.stockQuantity || 0,
        inStockCount,
        lowStockCount,
        outOfStockCount,
      },
    });
  } catch (error: any) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    description,
    price,
    brand,
    category,
    inStock,
    stockQuantity,
    images,
  } = body;

  const parsedQty = stockQuantity !== undefined ? parseInt(stockQuantity) : 0;
  const parsedPrice = price !== undefined && price !== "" ? parseFloat(price) : 0.0;
  const isAvailable = inStock !== undefined ? Boolean(inStock) : parsedQty > 0;

  const product = await prisma.product.create({
    data: {
      name,
      description: description || "",
      price: parsedPrice,
      brand: brand || "General",
      category: category || "Uncategorized",
      inStock: isAvailable,
      stockQuantity: Math.max(0, parsedQty),
      images,
    },
  });

  // Also ensure category exists in Category table if dynamic
  if (category) {
    await prisma.category.upsert({
      where: { name: category },
      update: {},
      create: { name: category },
    });
  }

  return NextResponse.json(product);
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, inStock, stockQuantity, addStock, price, name } = body;

  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const updateData: any = {};

  if (inStock !== undefined) {
    updateData.inStock = Boolean(inStock);
  }

  if (price !== undefined) {
    updateData.price = parseFloat(price);
  }

  if (name !== undefined) {
    updateData.name = name;
  }

  // Stock management: addStock or set direct stockQuantity
  if (addStock !== undefined && !isNaN(parseInt(addStock))) {
    const newQty = (existingProduct.stockQuantity || 0) + parseInt(addStock);
    updateData.stockQuantity = Math.max(0, newQty);
    updateData.inStock = updateData.stockQuantity > 0;
  } else if (stockQuantity !== undefined && !isNaN(parseInt(stockQuantity))) {
    const qty = parseInt(stockQuantity);
    updateData.stockQuantity = Math.max(0, qty);
    if (inStock === undefined) {
      updateData.inStock = qty > 0;
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updatedProduct);
}
