const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const isCleanRequested = process.argv.includes("--clean") || process.env.CLEAN_SEED === "true";

  if (isCleanRequested) {
    console.log("[Seed] Purging existing products, banners, categories, and customer data...");
    try {
      await prisma.review.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.product.deleteMany({});
      await prisma.banner.deleteMany({});
      await prisma.category.deleteMany({});
      await prisma.user.deleteMany({
        where: {
          OR: [
            { role: { not: "ADMIN" } },
            { email: { not: "kirugjames@gmail.com" } },
          ],
        },
      });
      console.log("  ✓ Purge complete: Non-admin data cleared.");
    } catch (err) {
      console.warn("  Could not complete purge:", err.message);
    }
  }

  console.log("[Seed] Ensuring authorized administrator account...");
  const adminHashedPassword = await bcrypt.hash("Admin@254!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "kirugjames@gmail.com" },
    update: {
      role: "ADMIN",
      hashedPassword: adminHashedPassword,
    },
    create: {
      name: "James Kirugu (Admin)",
      email: "kirugjames@gmail.com",
      hashedPassword: adminHashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`  ✓ Synced admin user: ${admin.email} (Role: ${admin.role})`);
  console.log("[Seed] Seeding completed: No sample products, banners, or categories seeded.");
}

main()
  .catch((e) => {
    console.error("[Seed Error]", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
