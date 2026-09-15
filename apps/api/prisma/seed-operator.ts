import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const email = process.env.JIDEX_OPERATOR_EMAIL;
  const password = process.env.JIDEX_OPERATOR_PASSWORD;

  if (!databaseUrl) throw new Error("DATABASE_URL is not configured");
  if (!email) throw new Error("JIDEX_OPERATOR_EMAIL is not configured");
  if (!password) throw new Error("JIDEX_OPERATOR_PASSWORD is not configured");

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: "JIDEX Operator",
        passwordHash,
        role: "OPERATOR",
        status: "ACTIVE",
      },
      create: {
        name: "JIDEX Operator",
        email,
        passwordHash,
        role: "OPERATOR",
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

    console.log("JIDEX OPERATOR READY");
    console.log(JSON.stringify(user, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
