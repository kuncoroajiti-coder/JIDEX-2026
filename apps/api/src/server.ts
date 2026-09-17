import "dotenv/config";

import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import { z } from "zod";
import { publicRoutes } from "./routes/public";
import { newsAdminRoutes } from "./routes/news-admin";
import { authRoutes } from "./routes/auth";
import { participantRoutes } from "./routes/participant";
import { importRoutes } from "./routes/import";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z
    .string()
    .url()
    .default("http://localhost:3000"),
});

const env = envSchema.parse(process.env);

const app = Fastify({
  logger: true,
});

const start = async () => {
  try {
    await app.register(helmet, {
      contentSecurityPolicy: false,
    });

    await app.register(cors, {
      origin: env.WEB_ORIGIN,
      credentials: true,
    });

    await app.register(cookie);

    await app.register(publicRoutes);
    await app.register(newsAdminRoutes);
    await app.register(authRoutes);
    await app.register(participantRoutes);
    await app.register(importRoutes);

    app.get("/health", async () => ({
      ok: true,
      service: "jidex-api",
      timestamp: new Date().toISOString(),
    }));

    app.setErrorHandler((error, request, reply) => {
      request.log.error(error);

      const statusCode =
        error instanceof Error &&
        "statusCode" in error &&
        typeof error.statusCode === "number"
          ? error.statusCode
          : 500;

      return reply.status(statusCode).send({
        error: "Internal Server Error",
      });
    });

    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
