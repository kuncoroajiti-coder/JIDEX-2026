import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "./prisma";
import {
  hashSessionToken,
  SESSION_COOKIE_NAME,
} from "./session";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: "PARTICIPANT" | "OPERATOR" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
};

declare module "fastify" {
  interface FastifyRequest {
    user: AuthenticatedUser | null;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const token = request.cookies[SESSION_COOKIE_NAME];

  if (!token) {
    request.user = null;
    await reply.status(401).send({
      error: "Authentication required",
    });
    return;
  }

  const tokenHash = hashSessionToken(token);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) {
    request.user = null;
    await reply.status(401).send({
      error: "Authentication required",
    });
    return;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: { id: session.id },
    });

    request.user = null;

    return reply.status(401).send({
      error: "Session expired",
    });
  }

  if (session.user.status !== "ACTIVE") {
    request.user = null;

    return reply.status(403).send({
      error: "User account is inactive",
    });
  }

  await prisma.session.update({
    where: { id: session.id },
    data: {
      lastUsedAt: new Date(),
    },
  });

  request.user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
  };
}

export function requireRole(
  ...roles: AuthenticatedUser["role"][]
) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    if (!request.user) {
      await reply.status(401).send({
        error: "Authentication required",
      });
      return;
    }

    if (!roles.includes(request.user.role)) {
      await reply.status(403).send({
        error: "Insufficient permissions",
      });
    }
  };
}
