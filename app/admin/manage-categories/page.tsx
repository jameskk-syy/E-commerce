import React from "react";
import prisma from "@/libs/prismadb";
import ManageCategoriesClient from "./ManageCategoriesClient";

export const dynamic = "force-dynamic";

const ManageCategoriesPage = async () => {
  let categoriesWithCount: any[] = [];

  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });

    categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        try {
          const count = await prisma.product.count({
            where: { category: cat.name },
          });
          return {
            id: cat.id,
            name: cat.name,
            createdAt: cat.createdAt.toISOString(),
            productCount: count,
          };
        } catch {
          return {
            id: cat.id,
            name: cat.name,
            createdAt: cat.createdAt.toISOString(),
            productCount: 0,
          };
        }
      })
    );
  } catch (error) {
    console.error("Error loading categories:", error);
  }

  return <ManageCategoriesClient initialCategories={categoriesWithCount} />;
};

export default ManageCategoriesPage;

