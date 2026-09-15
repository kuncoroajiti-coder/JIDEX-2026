import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import {
  createSessionToken,
  getSessionExpiry,
  hashSessionToken,
  SESSION_COOKIE_NAME,
} from "../lib/session";
import { authenticate } from "../lib/auth";

const authSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/",
    expires: getSessionExpiry(),
  };
}

function getSafeUser(user: {
  id: string;
  name: string;
  email: string;
  role: "PARTICIPANT" | "OPERATOR" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

async function createSession(userId: string) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = getSessionExpiry();

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/api/v1/auth/register", async (request, reply) => {
    const parsed = authSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid registration data",
        details: parsed.error.flatten(),
      });
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply.status(409).send({
        error: "Email already registered",
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "PARTICIPANT",
        status: "ACTIVE",
      },
    });

    const { token, expiresAt } = await createSession(user.id);

    return reply
      .setCookie(SESSION_COOKIE_NAME, token, {
        ...getCookieOptions(),
        expires: expiresAt,
      })
      .status(201)
      .send({
        user: getSafeUser(user),
      });
  });

  app.post("/api/v1/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid login data",
        details: parsed.error.flatten(),
      });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.status(401).send({
        error: "Invalid email or password",
      });
    }

    const validPassword = await verifyPassword(password, user.passwordHash);

    if (!validPassword) {
      return reply.status(401).send({
        error: "Invalid email or password",
      });
    }

    if (user.status !== "ACTIVE") {
      return reply.status(403).send({
        error: "User account is inactive",
      });
    }

    const { token, expiresAt } = await createSession(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    return reply
      .setCookie(SESSION_COOKIE_NAME, token, {
        ...getCookieOptions(),
        expires: expiresAt,
      })
      .status(200)
      .send({
        user: getSafeUser(user),
      });
  });

  app.post("/api/v1/auth/logout", async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE_NAME];

    if (token) {
      const tokenHash = hashSessionToken(token);

      await prisma.session.deleteMany({
        where: { tokenHash },
      });
    }

    return reply
      .clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
          process.env.NODE_ENV === "production"
            ? ("none" as const)
            : ("lax" as const),
        path: "/",
      })
      .status(204)
      .send();
  });

  app.get("/api/v1/auth/me", async (request, reply) => {
    await authenticate(request, reply);

    if (reply.sent) {
      return;
    }

    return reply.status(200).send({
      user: request.user,
    });
  });
}