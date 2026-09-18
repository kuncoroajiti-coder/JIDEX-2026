import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { authenticate, requireRole } from "../lib/auth";
import { prisma } from "../lib/prisma";
import {
  translateIdToEn,
  translateOptionalIdToEn,
} from "../lib/translation";

const newsInputSchema = z.object({
  slug: z.string().trim().min(1).max(200),
  titleId: z.string().trim().min(1).max(300),
  excerptId: z.string().trim().max(1000).nullable().optional(),
  contentId: z.string().trim().min(1),
  titleEn: z.string().trim().min(1).max(300).optional(),
  excerptEn: z.string().trim().max(1000).nullable().optional(),
  contentEn: z.string().trim().min(1).optional(),
  coverImage: z.string().trim().max(1000).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  publishedAt: z.coerce.date().nullable().optional(),
});

const newsUpdateSchema = newsInputSchema.partial();

const translateRequestSchema = z.object({
  titleId: z.string().trim().min(1).max(300),
  excerptId: z.string().trim().max(1000).nullable().optional(),
  contentId: z.string().trim().min(1),
});

const translateResponseSchema = z.object({
  titleEn: z.string().trim().min(1),
  excerptEn: z.string().trim().nullable(),
  contentEn: z.string().trim().min(1),
});

type NewsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

function normalizePublishedAt(
  status: NewsStatus,
  publishedAt: Date | null | undefined,
): Date | null {
  if (status === "PUBLISHED") {
    return publishedAt ?? new Date();
  }

  return null;
}

async function generateNewsEnglish(input: {
  titleId: string;
  excerptId?: string | null;
  contentId: string;
  titleEn?: string;
  excerptEn?: string | null;
  contentEn?: string;
}) {
  const [titleEn, excerptEn, contentEn] = await Promise.all([
    input.titleEn?.trim()
      ? input.titleEn.trim()
      : translateIdToEn(input.titleId),

    input.excerptEn !== undefined
      ? input.excerptEn?.trim() || null
      : translateOptionalIdToEn(input.excerptId),

    input.contentEn?.trim()
      ? input.contentEn.trim()
      : translateIdToEn(input.contentId),
  ]);

  return {
    titleEn,
    excerptEn,
    contentEn,
  };
}

export async function newsAdminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    await authenticate(request, reply);

    if (reply.sent) {
      return;
    }

    await requireRole("OPERATOR", "ADMIN")(request, reply);
  });

  app.get("/api/v1/admin/news", async () => {
    return prisma.news.findMany({
      orderBy: { updatedAt: "desc" },
    });
  });

  app.get<{ Params: { id: string } }>(
    "/api/v1/admin/news/:id",
    async (request, reply) => {
      const news = await prisma.news.findUnique({
        where: {
          id: request.params.id,
        },
      });

      if (!news) {
        return reply.status(404).send({
          error: "News not found",
        });
      }

      return news;
    },
  );

  app.post("/api/v1/admin/news", async (request, reply) => {
    const parsed = newsInputSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid news data",
        details: parsed.error.flatten(),
      });
    }

    const data = parsed.data;

    const existing = await prisma.news.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (existing) {
      return reply.status(409).send({
        error: "News slug already exists",
      });
    }

    try {
      const translated = await generateNewsEnglish(data);

      const publishedAt = normalizePublishedAt(
        data.status,
        data.publishedAt,
      );

      const news = await prisma.news.create({
        data: {
          slug: data.slug,
          titleId: data.titleId,
          titleEn: translated.titleEn,
          excerptId: data.excerptId ?? null,
          excerptEn: translated.excerptEn,
          contentId: data.contentId,
          contentEn: translated.contentEn,
          coverImage: data.coverImage ?? null,
          status: data.status,
          publishedAt,
        },
      });

      return reply.status(201).send(news);
    } catch (error) {
      request.log.error(
        {
          error:
            error instanceof Error ? error.message : String(error),
        },
        "JIDEX news translation failed",
      );

      return reply.status(502).send({
        error: "Translation service failed",
        details:
          error instanceof Error
            ? error.message
            : "Unknown translation error",
      });
    }
  });

  app.patch<{ Params: { id: string } }>(
    "/api/v1/admin/news/:id",
    async (request, reply) => {
      const parsed = newsUpdateSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Invalid news data",
          details: parsed.error.flatten(),
        });
      }

      const existing = await prisma.news.findUnique({
        where: {
          id: request.params.id,
        },
      });

      if (!existing) {
        return reply.status(404).send({
          error: "News not found",
        });
      }

      const data = parsed.data;

      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await prisma.news.findUnique({
          where: {
            slug: data.slug,
          },
        });

        if (slugExists) {
          return reply.status(409).send({
            error: "News slug already exists",
          });
        }
      }

      try {
        const titleId = data.titleId ?? existing.titleId;
        const excerptId =
          data.excerptId !== undefined
            ? data.excerptId
            : existing.excerptId;
        const contentId = data.contentId ?? existing.contentId;

        const translated = await generateNewsEnglish({
          titleId,
          excerptId,
          contentId,
          titleEn: data.titleEn ?? existing.titleEn,
          excerptEn:
            data.excerptEn !== undefined
              ? data.excerptEn
              : existing.excerptEn,
          contentEn: data.contentEn ?? existing.contentEn,
        });

        const nextStatus: NewsStatus =
          data.status ?? existing.status;

        const nextPublishedAt = normalizePublishedAt(
          nextStatus,
          data.publishedAt !== undefined
            ? data.publishedAt
            : existing.publishedAt,
        );

        const news = await prisma.news.update({
          where: {
            id: request.params.id,
          },
          data: {
            ...(data.slug !== undefined && {
              slug: data.slug,
            }),
            titleId,
            titleEn: translated.titleEn,
            excerptId,
            excerptEn: translated.excerptEn,
            contentId,
            contentEn: translated.contentEn,
            ...(data.coverImage !== undefined && {
              coverImage: data.coverImage,
            }),
            ...(data.status !== undefined && {
              status: data.status,
            }),
            publishedAt: nextPublishedAt,
          },
        });

        return news;
      } catch (error) {
        request.log.error(
          {
            error:
              error instanceof Error
                ? error.message
                : String(error),
          },
          "JIDEX news translation failed",
        );

        return reply.status(502).send({
          error: "Translation service failed",
          details:
            error instanceof Error
              ? error.message
              : "Unknown translation error",
        });
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/api/v1/admin/news/:id/translate",
    async (request, reply) => {
      const parsed = translateRequestSchema.safeParse(
        request.body,
      );

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Invalid translation data",
          details: parsed.error.flatten(),
        });
      }

      const news = await prisma.news.findUnique({
        where: {
          id: request.params.id,
        },
      });

      if (!news) {
        return reply.status(404).send({
          error: "News not found",
        });
      }

      try {
        const translated = await generateNewsEnglish({
          titleId: parsed.data.titleId,
          excerptId: parsed.data.excerptId,
          contentId: parsed.data.contentId,
        });

        const validated =
          translateResponseSchema.safeParse(translated);

        if (!validated.success) {
          return reply.status(502).send({
            error: "Translation provider returned invalid format",
            details: validated.error.flatten(),
          });
        }

        return reply.send(validated.data);
      } catch (error) {
        request.log.error(
          {
            error:
              error instanceof Error
                ? error.message
                : String(error),
          },
          "JIDEX translation request failed",
        );

        return reply.status(502).send({
          error: "Translation service failed",
          details:
            error instanceof Error
              ? error.message
              : "Unknown translation error",
        });
      }
    },
  );

  app.delete<{ Params: { id: string } }>(
    "/api/v1/admin/news/:id",
    async (request, reply) => {
      const existing = await prisma.news.findUnique({
        where: {
          id: request.params.id,
        },
      });

      if (!existing) {
        return reply.status(404).send({
          error: "News not found",
        });
      }

      await prisma.news.delete({
        where: {
          id: request.params.id,
        },
      });

      return reply.status(204).send();
    },
  );
}
