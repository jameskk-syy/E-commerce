import { getCurrentUser } from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "8", 10));
    const search = searchParams.get("search")?.trim() || "";
    const statusFilter = searchParams.get("statusFilter") || "all";

    const filterClauses: any[] = [];

    // Status Filter
    if (statusFilter === "delivered") {
      filterClauses.push({ deliveryStatus: "delivered" });
    } else if (statusFilter === "dispatched") {
      filterClauses.push({ deliveryStatus: "dispatched" });
    } else if (statusFilter === "pending") {
      filterClauses.push({
        OR: [
          { deliveryStatus: "pending" },
          { deliveryStatus: null },
        ],
      });
    } else if (statusFilter === "mpesa") {
      filterClauses.push({
        paymentMethod: { contains: "kopokopo" },
        status: "complete",
      });
    }

    // Search Query (Phone, Name, Email, M-Pesa receipt, ID)
    if (search) {
      filterClauses.push({
        OR: [
          { phoneNumber: { contains: search } },
          { customerName: { contains: search } },
          { customerEmail: { contains: search } },
          { mpesaReceipt: { contains: search } },
          { id: { contains: search } },
        ],
      });
    }

    const where: any = filterClauses.length > 0 ? { AND: filterClauses } : {};
    const skip = (page - 1) * limit;

    const [
      orders,
      totalCount,
      totalOrders,
      revenueAgg,
      deliveredCount,
      pendingDeliveryCount,
      mpesaPaidCount,
    ] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createDate: "desc" },
        include: { user: true },
      }),
      prisma.order.count({ where }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: "complete" },
        _sum: { amount: true },
      }),
      prisma.order.count({
        where: { deliveryStatus: "delivered" },
      }),
      prisma.order.count({
        where: {
          OR: [
            { deliveryStatus: { not: "delivered" } },
            { deliveryStatus: null },
          ],
        },
      }),
      prisma.order.count({
        where: {
          paymentMethod: { contains: "kopokopo" },
          status: "complete",
        },
      }),
    ]);

    return NextResponse.json({
      orders,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      currentPage: page,
      limit,
      stats: {
        totalOrders,
        totalRevenue: revenueAgg._sum.amount || 0,
        deliveredCount,
        pendingDeliveryCount,
        mpesaPaidCount,
      },
    });
  } catch (error: any) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, deliveryStatus } = body;

  const order = await prisma.order.update({
    where: { id: id },
    data: { deliveryStatus },
  });

  return NextResponse.json(order);
}
