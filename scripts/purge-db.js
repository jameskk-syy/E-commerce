const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Load .env
function loadEnv() {
  const envPaths = [
    path.join(__dirname, "..", ".env.local"),
    path.join(__dirname, "..", ".env"),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const firstEqual = trimmed.indexOf("=");
          if (firstEqual > 0) {
            const key = trimmed.slice(0, firstEqual).trim();
            let value = trimmed.slice(firstEqual + 1).trim();
            if (
              (value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))
            ) {
              value = value.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      });
      break;
    }
  }
}

loadEnv();

const prisma = new PrismaClient();

async function purgeDatabase() {
  console.log("\n=======================================================");
  console.log("  [Purge] Cleaning products, banners, categories & customers");
  console.log("=======================================================\n");

  try {
    // 1. Delete reviews
    const reviews = await prisma.review.deleteMany({});
    console.log(`  ✓ Removed ${reviews.count} review(s)`);

    // 2. Delete orders
    const orders = await prisma.order.deleteMany({});
    console.log(`  ✓ Removed ${orders.count} order(s)`);

    // 3. Delete products
    const products = await prisma.product.deleteMany({});
    console.log(`  ✓ Removed ${products.count} product(s)`);

    // 4. Delete banners
    const banners = await prisma.banner.deleteMany({});
    console.log(`  ✓ Removed ${banners.count} banner(s)`);

    // 5. Delete categories
    const categories = await prisma.category.deleteMany({});
    console.log(`  ✓ Removed ${categories.count} category(ies)`);

    // 6. Delete all non-admin users
    const customers = await prisma.user.deleteMany({
      where: {
        OR: [
          { role: { not: "ADMIN" } },
          { email: { not: "kirugjames@gmail.com" } },
        ],
      },
    });
    console.log(`  ✓ Removed ${customers.count} customer user(s)`);

    // 7. Ensure admin user exists with credentials
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
    console.log(`  ✓ Admin confirmed: ${admin.email} (Role: ${admin.role})`);

    console.log("\n[Purge Complete] All products, banners, categories, and customer records have been wiped. ONLY the admin account remains.\n");
  } catch (error) {
    console.error("[Purge Error]", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

purgeDatabase();

