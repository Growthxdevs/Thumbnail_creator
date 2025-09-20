// Environment check script for debugging deployment issues
console.log("🔍 Environment Check");
console.log("==================");

const requiredEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXTAUTH_URL",
];

console.log("Required Environment Variables:");
requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar];
  if (value) {
    // Mask sensitive values
    const maskedValue =
      envVar.includes("SECRET") || envVar.includes("URL")
        ? value.substring(0, 8) + "..."
        : value;
    console.log(`✅ ${envVar}: ${maskedValue}`);
  } else {
    console.log(`❌ ${envVar}: NOT SET`);
  }
});

console.log("\nBuild Environment:");
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`VERCEL: ${process.env.VERCEL}`);
console.log(`VERCEL_ENV: ${process.env.VERCEL_ENV}`);

console.log("\nPrisma Configuration:");
console.log(
  `PRISMA_QUERY_ENGINE_LIBRARY: ${process.env.PRISMA_QUERY_ENGINE_LIBRARY}`
);

// Check if we can import Prisma
try {
  const { PrismaClient } = require("@prisma/client");
  console.log("✅ Prisma Client can be imported");
} catch (error) {
  console.log("❌ Prisma Client import failed:", error.message);
}
