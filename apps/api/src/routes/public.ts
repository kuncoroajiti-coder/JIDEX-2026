import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function publicRoutes(app: FastifyInstance) {
  app.get("/api/v1/events", async () => {
    return prisma.event.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        startAt: "asc",
      },
    });
  });

  app.get("/api/v1/schedules", async () => {
    return prisma.schedule.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [
        {
          startAt: "asc",
        },
        {
          sortOrder: "asc",
        },
      ],
    });
  });

  app.get("/api/v1/news", async () => {
    return prisma.news.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: {
        publishedAt: "desc",
      },
    });
  });

  app.get<{ Params: { slug: string } }>(
    "/api/v1/pages/:slug",
    async (request, reply) => {
      const page = await prisma.page.findFirst({
        where: {
          slug: request.params.slug,
          status: "PUBLISHED",
        },
      });

      if (!page) {
        return reply.status(404).send({
          error: "Page not found",
        });
      }

      return page;
    },
  );
}
