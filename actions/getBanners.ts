import prisma from "@/libs/prismadb";

export default async function getBanners() {
  try {
    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    return banners;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

