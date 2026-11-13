import prisma from "@/libs/prismadb";

export interface CategoryItem {
  label: string;
  count?: number;
}

export default async function getCategories(): Promise<CategoryItem[]> {
  try {
    // 1. Get explicit categories created in the Category model
    const dbCategories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    // 2. Get distinct categories from products
    const productCategories = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    // 3. Collect all category names
    const categorySet = new Set<string>();

    // Defaults
    ["Phone", "Laptop", "Desktop", "Watch", "Tv", "Accessories"].forEach((c) =>
      categorySet.add(c)
    );

    dbCategories.forEach((c) => categorySet.add(c.name));
    productCategories.forEach((p) => {
      if (p.category) categorySet.add(p.category);
    });

    // Convert to sorted list
    const categoryList = Array.from(categorySet).sort();

    return [
      { label: "All" },
      ...categoryList.map((label) => ({ label })),
    ];
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Fallback to defaults
    return [
      { label: "All" },
      { label: "Phone" },
      { label: "Laptop" },
      { label: "Desktop" },
      { label: "Watch" },
      { label: "Tv" },
      { label: "Accessories" },
    ];
  }
}

