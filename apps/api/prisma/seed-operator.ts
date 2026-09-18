import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const email = process.env.JIDEX_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.JIDEX_ADMIN_PASSWORD;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!email) {
    throw new Error("JIDEX_ADMIN_EMAIL is not configured");
  }

  if (!password) {
    throw new Error("JIDEX_ADMIN_PASSWORD is not configured");
  }

  if (password.length < 8 || password.length > 128) {
    throw new Error("JIDEX_ADMIN_PASSWORD must be 8-128 characters");
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await hashPassword(password);

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
      },
    });

    if (
      existingUser &&
      existingUser.role !== "ADMIN"
    ) {
      throw new Error(
        `Refusing to promote existing non-admin account ${email}`,
      );
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: "JIDEX Administrator",
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
      create: {
        name: "JIDEX Administrator",
        email,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    console.log("JIDEX ADMIN READY");
    console.log(JSON.stringify(user, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
