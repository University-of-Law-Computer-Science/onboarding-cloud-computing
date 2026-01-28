/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const email = process.argv[2];

async function main() {
  if (!email) {
    console.log("Please provide an email address.");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "staff" },
    });
    console.log(`Successfully promoted ${user.email} to staff.`);
  } catch (e) {
    console.error("Error promoting user:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
