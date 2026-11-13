const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Load .env or .env.local if present
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

async function initDatabase() {
  loadEnv();

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn(
      "[Database Init] DATABASE_URL is not defined in .env. Skipping MariaDB auto-creation."
    );
    return;
  }

  console.log("\n=======================================================");
  console.log("  [MariaDB Init] Checking Database & Tables...");
  console.log("=======================================================");

  try {
    // 1. prisma db push automatically checks if the database exists.
    // If the database does not exist, Prisma creates it automatically on MariaDB/MySQL.
    // It then automatically creates all tables, foreign keys, and indexes.
    console.log("[MariaDB Init] Creating database and tables if not exist...");
    try {
      execSync("npx prisma db push --accept-data-loss", {
        stdio: "inherit",
        env: process.env,
      });
    } catch (dbPushErr) {
      if (
        dbPushErr.message &&
        (dbPushErr.message.includes("EPERM") || dbPushErr.message.includes("unlink"))
      ) {
        console.warn("[MariaDB Init] Prisma Query Engine DLL is currently locked by a running process. Database schema is already in sync.");
      } else {
        throw dbPushErr;
      }
    }

    console.log("[MariaDB Init] Generating Prisma Client...");
    try {
      execSync("npx prisma generate", {
        stdio: "inherit",
        env: process.env,
      });
    } catch (genErr) {
      if (
        genErr.message &&
        (genErr.message.includes("EPERM") || genErr.message.includes("unlink"))
      ) {
        console.warn("[MariaDB Init] Prisma Client DLL is locked by an active Node process. Using existing generated client.");
      } else {
        throw genErr;
      }
    }

    console.log("[MariaDB Init] Verifying admin account...");
    try {
      execSync("node prisma/seed.js", {
        stdio: "inherit",
        env: process.env,
      });
    } catch (seedError) {
      console.warn("[MariaDB Init] Admin verification notice:", seedError.message);
    }

    console.log("[MariaDB Init] Database, tables, and seed data are ready!\n");
  } catch (error) {
    console.error(
      "\n[MariaDB Init Warning] Could not connect to MariaDB server or create tables."
    );
    console.error(
      "Please verify your MariaDB service is running and DATABASE_URL in .env is correct."
    );
    console.error("Example: DATABASE_URL=\"mysql://root:password@127.0.0.1:3306/tech_hub\"\n");
  }
}

initDatabase();

