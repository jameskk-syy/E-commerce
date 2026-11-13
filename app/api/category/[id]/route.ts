import { getCurrentUser } from "@/actions/getCurrentUser";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const category = await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Category deletion error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}

