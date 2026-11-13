import { getCurrentUser } from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    // If requested for dropdown selection without pagination
    if (all) {
      const allCategories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });
      return NextResponse.json(allCategories);
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "8", 10));
    const search = searchParams.get("search")?.trim() || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { id: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [categories, totalCount, allCategoriesForStats] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.count({ where }),
      prisma.category.findMany({
        select: { id: true, name: true },
      }),
    ]);

    // Count products associated with paginated categories
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        try {
          const count = await prisma.product.count({
            where: { category: cat.name },
          });
          return {
            id: cat.id,
            name: cat.name,
            createdAt: cat.createdAt,
            productCount: count,
          };
        } catch {
          return {
            id: cat.id,
            name: cat.name,
            createdAt: cat.createdAt,
            productCount: 0,
          };
        }
      })
    );

    // Compute overall stats across all categories
    let totalAssignedProducts = 0;
    let inUseCount = 0;
    let emptyCount = 0;

    await Promise.all(
      allCategoriesForStats.map(async (c) => {
        try {
          const cnt = await prisma.product.count({ where: { category: c.name } });
          totalAssignedProducts += cnt;
          if (cnt > 0) inUseCount++;
          else emptyCount++;
        } catch {
          emptyCount++;
        }
      })
    );

    return NextResponse.json({
      categories: categoriesWithCount,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      currentPage: page,
      limit,
      stats: {
        totalCategories: allCategoriesForStats.length,
        totalAssignedProducts,
        inUseCount,
        emptyCount,
      },
    });
  } catch (error: any) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if category already exists
    const existing = await prisma.category.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Category "${trimmedName}" already exists` },
        { status: 409 }
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        name: trimmedName,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error("Category creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
