// Simple script to test database connection
const { PrismaClient } = require("@prisma/client");

async function testConnection() {
  const prisma = new PrismaClient({
    log: ["query", "error", "warn"],
  });

  try {
    console.log("Testing database connection...");

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ User count query successful: ${userCount} users`);

    // Test prepared statement handling
    console.log("Testing prepared statement handling...");
    for (let i = 0; i < 5; i++) {
      const users = await prisma.user.findMany({
        take: 1,
        select: { id: true, email: true },
      });
      console.log(`✅ Query ${i + 1} successful`);
    }

    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Database connection closed");
  }
}

testConnection();
