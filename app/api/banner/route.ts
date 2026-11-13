import { getCurrentUser } from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    // If storefront requests all banners without pagination
    if (all) {
      const banners = await prisma.banner.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(banners);
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "8", 10));
    const search = searchParams.get("search")?.trim() || "";
    const statusFilter = searchParams.get("statusFilter") || "all";

    const filterClauses: any[] = [];

    if (statusFilter === "active") {
      filterClauses.push({ active: true });
    } else if (statusFilter === "inactive") {
      filterClauses.push({ active: false });
    }

    if (search) {
      filterClauses.push({
        OR: [
          { title: { contains: search } },
          { subtitle: { contains: search } },
          { badge: { contains: search } },
          { discount: { contains: search } },
          { id: { contains: search } },
        ],
      });
    }

    const where: any = filterClauses.length > 0 ? { AND: filterClauses } : {};
    const skip = (page - 1) * limit;

    const [banners, totalCount, totalBanners, activeCount, inactiveCount] = await Promise.all([
      prisma.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.banner.count({ where }),
      prisma.banner.count(),
      prisma.banner.count({ where: { active: true } }),
      prisma.banner.count({ where: { active: false } }),
    ]);

    return NextResponse.json({
      banners,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      currentPage: page,
      limit,
      stats: {
        totalBanners,
        activeCount,
        inactiveCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load banners" },
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
    const { title, subtitle, badge, discount, link, image, active } = body;

    if (!title || !image) {
      return NextResponse.json(
        { error: "Title and banner image are required" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        badge: badge || null,
        discount: discount || null,
        link: link || null,
        image, // Can be Base64 data:image/... or URL
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json(banner);
  } catch (error: any) {
    console.error("Banner creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create banner" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, subtitle, badge, discount, link, image, active } = body;

    if (!id) {
      return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (badge !== undefined) updateData.badge = badge;
    if (discount !== undefined) updateData.discount = discount;
    if (link !== undefined) updateData.link = link;
    if (image !== undefined) updateData.image = image;
    if (active !== undefined) updateData.active = Boolean(active);

    const banner = await prisma.banner.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(banner);
  } catch (error: any) {
    console.error("Banner update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Banner ID is required" }, { status: 400 });
    }

    const deleted = await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json(deleted);
  } catch (error: any) {
    console.error("Banner deletion error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete banner" },
      { status: 500 }
    );
  }
}

