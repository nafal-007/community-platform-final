const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting Phase 8 manual migration...");
    try {
        // Add lastUsernameChange to User
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "lastUsernameChange" TIMESTAMP(3);`);
        console.log("✅ Added lastUsernameChange to User table.");
    } catch (e) {
        console.log("⚠️ Error or column already exists for User:", e.message);
    }

    try {
        // Add avatarUrl to Community
        await prisma.$executeRawUnsafe(`ALTER TABLE "Community" ADD COLUMN "avatarUrl" TEXT;`);
        console.log("✅ Added avatarUrl to Community table.");
    } catch (e) {
        console.log("⚠️ Error or column already exists for Community:", e.message);
    }

    console.log("Migration finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
