const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanupAccounts() {
  try {
    console.log("🧹 Cleaning up duplicate accounts...");

    // Find users with multiple accounts
    const usersWithMultipleAccounts = await prisma.user.findMany({
      include: {
        accounts: true,
      },
      where: {
        accounts: {
          some: {},
        },
      },
    });

    console.log(
      `Found ${usersWithMultipleAccounts.length} users with accounts`
    );

    for (const user of usersWithMultipleAccounts) {
      console.log(`\n👤 User: ${user.email}`);
      console.log(`   Accounts: ${user.accounts.length}`);

      // Show account details
      user.accounts.forEach((account) => {
        console.log(
          `   - Provider: ${account.provider}, ID: ${account.providerAccountId}`
        );
      });

      // If user has GitHub accounts, remove them since we only use Google now
      const githubAccounts = user.accounts.filter(
        (acc) => acc.provider === "github"
      );
      if (githubAccounts.length > 0) {
        console.log(
          `   🗑️  Removing ${githubAccounts.length} GitHub account(s)`
        );
        await prisma.account.deleteMany({
          where: {
            id: {
              in: githubAccounts.map((acc) => acc.id),
            },
          },
        });
      }
    }

    console.log("\n✅ Cleanup completed!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAccounts();
