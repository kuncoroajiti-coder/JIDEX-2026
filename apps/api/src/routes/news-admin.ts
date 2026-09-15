import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const newsInputSchema = z.object({
  slug: z.string().trim().min(1).max(200),
  titleId: z.string().trim().min(1).max(300),
  titleEn: z.string().trim().min(1).max(300),
  excerptId: z.string().trim().max(1000).nullable().optional(),
  excerptEn: z.string().trim().max(1000).nullable().optional(),
  contentId: z.string().trim().min(1),
  contentEn: z.string().trim().min(1),
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

async function translateText(
  text: string,
): Promise<string> {
  const trimmed = text.trim();

  if (!trimmed) {
    return "";
  }

  const params = new URLSearchParams({
    q: trimmed,
    langpair: "id|en",
  });

  const response = await fetch(
    `https://api.mymemory.translated.net/get?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "JIDEX-2026/1.0",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Translation provider returned HTTP ${response.status}`,
    );
  }

  const data: unknown = await response.json();

  const parsed = z
    .object({
      responseStatus: z.number().optional(),
      responseData: z
        .object({
          translatedText: z.string(),
        })
        .optional(),
    })
    .safeParse(data);

  if (!parsed.success || !parsed.data.responseData?.translatedText) {
    throw new Error("Translation provider returned invalid data");
  }

  if (
    parsed.data.responseStatus !== undefined &&
    parsed.data.responseStatus !== 200
  ) {
    throw new Error(
      `Translation provider returned status ${parsed.data.responseStatus}`,
    );
  }

  return parsed.data.responseData.translatedText.trim();
}

export async function newsAdminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    const { authenticate, requireRole } = await import("../lib/auth");

    await authenticate(request, reply);

    if (reply.sent) {
      return;
    }

    await requireRole("OPERATOR", "ADMIN")(request, reply);
  });

  app.get("/api/v1/admin/news", async () =>
    prisma.news.findMany({
      orderBy: { updatedAt: "desc" },
    }),
  );

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

    const publishedAt = normalizePublishedAt(
      data.status,
      data.publishedAt,
    );

    const news = await prisma.news.create({
      data: {
        slug: data.slug,
        titleId: data.titleId,
        titleEn: data.titleEn,
        excerptId: data.excerptId ?? null,
        excerptEn: data.excerptEn ?? null,
        contentId: data.contentId,
        contentEn: data.contentEn,
        coverImage: data.coverImage ?? null,
        status: data.status,
        publishedAt,
      },
    });

    return reply.status(201).send(news);
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
          ...(data.titleId !== undefined && {
            titleId: data.titleId,
          }),
          ...(data.titleEn !== undefined && {
            titleEn: data.titleEn,
          }),
          ...(data.excerptId !== undefined && {
            excerptId: data.excerptId,
          }),
          ...(data.excerptEn !== undefined && {
            excerptEn: data.excerptEn,
          }),
          ...(data.contentId !== undefined && {
            contentId: data.contentId,
          }),
          ...(data.contentEn !== undefined && {
            contentEn: data.contentEn,
          }),
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
        const [titleEn, excerptEn, contentEn] =
          await Promise.all([
            translateText(parsed.data.titleId),
            translateText(parsed.data.excerptId ?? ""),
            translateText(parsed.data.contentId),
          ]);

        const translated = {
          titleEn,
          excerptEn: excerptEn || null,
          contentEn,
        };

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
