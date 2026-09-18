import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { authenticate, requireRole } from "../lib/auth";
import { hashPassword } from "../lib/password";
import { prisma } from "../lib/prisma";

const roleSchema = z.enum(["PARTICIPANT", "OPERATOR", "ADMIN"]);
const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  role: roleSchema,
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    password: z.string().min(8).max(128).optional(),
    role: roleSchema.optional(),
    status: statusSchema.optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.email !== undefined ||
      value.password !== undefined ||
      value.role !== undefined ||
      value.status !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

const updateParticipantSchema = z.object({
  fullName: z.string().trim().min(2).max(160).optional(),
  position: z.string().trim().max(160).nullable().optional(),
  institution: z.string().trim().max(240).nullable().optional(),
  phone: z.string().trim().max(80).nullable().optional(),
  country: z.string().trim().max(120).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  website: z.string().trim().max(500).nullable().optional(),
  socialMedia: z.string().trim().max(500).nullable().optional(),
});

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  participant: {
    select: {
      id: true,
      fullName: true,
      position: true,
      institution: true,
      phone: true,
      country: true,
      city: true,
      website: true,
      socialMedia: true,
    },
  },
} as const;

export async function adminUsersRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get(
    "/api/v1/admin/users",
    {
      preHandler: [requireRole("ADMIN", "OPERATOR")],
    },
    async (request, reply) => {
      const users = await prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: safeUserSelect,
      });

      return reply.send({
        data: users,
      });
    },
  );

  app.get(
    "/api/v1/admin/users/:id",
    {
      preHandler: [requireRole("ADMIN", "OPERATOR")],
    },
    async (request, reply) => {
      const params = z
        .object({
          id: z.string().min(1),
        })
        .parse(request.params);

      const user = await prisma.user.findUnique({
        where: {
          id: params.id,
        },
        select: safeUserSelect,
      });

      if (!user) {
        return reply.status(404).send({
          error: "User not found",
        });
      }

      return reply.send({
        data: user,
      });
    },
  );

  app.post(
    "/api/v1/admin/users",
    {
      preHandler: [requireRole("ADMIN")],
    },
    async (request, reply) => {
      const input = createUserSchema.parse(request.body);

      if (
        input.role !== "PARTICIPANT" &&
        request.user?.role !== "ADMIN"
      ) {
        return reply.status(403).send({
          error: "Only ADMIN can create administrative accounts",
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
        select: {
          id: true,
        },
      });

      if (existingUser) {
        return reply.status(409).send({
          error: "Email already registered",
        });
      }

      const passwordHash = await hashPassword(input.password);

      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
          role: input.role,
          status: "ACTIVE",
          ...(input.role === "PARTICIPANT"
            ? {
                participant: {
                  create: {
                    fullName: input.name,
                  },
                },
              }
            : {}),
        },
        select: safeUserSelect,
      });

      return reply.status(201).send({
        data: user,
      });
    },
  );

  app.patch(
    "/api/v1/admin/users/:id",
    {
      preHandler: [requireRole("ADMIN")],
    },
    async (request, reply) => {
      const params = z
        .object({
          id: z.string().min(1),
        })
        .parse(request.params);

      const input = updateUserSchema.parse(request.body);

      const existingUser = await prisma.user.findUnique({
        where: {
          id: params.id,
        },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (!existingUser) {
        return reply.status(404).send({
          error: "User not found",
        });
      }

      if (params.id === request.user?.id && input.status === "INACTIVE") {
        return reply.status(400).send({
          error: "You cannot deactivate your own account",
        });
      }

      if (params.id === request.user?.id && input.role && input.role !== "ADMIN") {
        return reply.status(400).send({
          error: "You cannot remove ADMIN role from your own account",
        });
      }

      if (input.email && input.email !== existingUser.email) {
        const emailOwner = await prisma.user.findUnique({
          where: {
            email: input.email,
          },
          select: {
            id: true,
          },
        });

        if (emailOwner && emailOwner.id !== params.id) {
          return reply.status(409).send({
            error: "Email already registered",
          });
        }
      }

      if (
        input.role === "PARTICIPANT" &&
        existingUser.role !== "PARTICIPANT"
      ) {
        const participant = await prisma.participant.findUnique({
          where: {
            userId: params.id,
          },
          select: {
            id: true,
          },
        });

        if (!participant) {
          const currentUser = await prisma.user.findUnique({
            where: {
              id: params.id,
            },
            select: {
              name: true,
            },
          });

          await prisma.participant.create({
            data: {
              userId: params.id,
              fullName: currentUser?.name ?? input.name ?? "Participant",
            },
          });
        }
      }

      const passwordHash = input.password
        ? await hashPassword(input.password)
        : undefined;

      const user = await prisma.user.update({
        where: {
          id: params.id,
        },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.email !== undefined ? { email: input.email } : {}),
          ...(passwordHash ? { passwordHash } : {}),
          ...(input.role !== undefined ? { role: input.role } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
        },
        select: safeUserSelect,
      });

      if (input.status === "INACTIVE") {
        await prisma.session.deleteMany({
          where: {
            userId: params.id,
          },
        });
      }

      return reply.send({
        data: user,
      });
    },
  );

  app.patch(
    "/api/v1/admin/users/:id/participant",
    {
      preHandler: [requireRole("ADMIN", "OPERATOR")],
    },
    async (request, reply) => {
      const params = z
        .object({
          id: z.string().min(1),
        })
        .parse(request.params);

      const input = updateParticipantSchema.parse(request.body);

      const participant = await prisma.participant.findUnique({
        where: {
          userId: params.id,
        },
        select: {
          id: true,
        },
      });

      if (!participant) {
        return reply.status(404).send({
          error: "Participant profile not found",
        });
      }

      const updated = await prisma.participant.update({
        where: {
          userId: params.id,
        },
        data: {
          ...(input.fullName !== undefined
            ? { fullName: input.fullName }
            : {}),
          ...(input.position !== undefined
            ? { position: input.position }
            : {}),
          ...(input.institution !== undefined
            ? { institution: input.institution }
            : {}),
          ...(input.phone !== undefined
            ? { phone: input.phone }
            : {}),
          ...(input.country !== undefined
            ? { country: input.country }
            : {}),
          ...(input.city !== undefined
            ? { city: input.city }
            : {}),
          ...(input.website !== undefined
            ? { website: input.website }
            : {}),
          ...(input.socialMedia !== undefined
            ? { socialMedia: input.socialMedia }
            : {}),
        },
      });

      return reply.send({
        data: updated,
      });
    },
  );
}
