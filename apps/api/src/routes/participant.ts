import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { authenticate, requireRole } from "../lib/auth";

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  position: z.string().trim().max(160).optional().nullable(),
  institution: z.string().trim().max(200).optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  country: z.string().trim().max(120).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  website: z.string().trim().max(500).optional().nullable(),
  socialMedia: z.string().trim().max(500).optional().nullable(),
});

const submissionSchema = z.object({
  declarationAccurate: z.boolean().optional(),
  declarationOriginal: z.boolean().optional(),
  declarationDeadline: z.boolean().optional(),
  declarationTechnical: z.boolean().optional(),
  declarationGuidelines: z.boolean().optional(),
  declarationIp: z.boolean().optional(),
});

const artworkSchema = z.object({
  sequence: z.number().int().min(1).max(3),
  title: z.string().trim().min(1).max(300),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  category: z.string().trim().max(200).optional().nullable(),
  medium: z.string().trim().max(300).optional().nullable(),
  dimensions: z.string().trim().max(500).optional().nullable(),
  materials: z.string().trim().max(1000).optional().nullable(),
  duration: z.string().trim().max(120).optional().nullable(),
  shortDescription: z.string().trim().max(5000).optional().nullable(),
  designConcept: z.string().trim().max(10000).optional().nullable(),
  keywords: z.string().trim().max(500).optional().nullable(),

  physicalWidthCm: z.number().min(0).max(10000).optional().nullable(),
  physicalHeightCm: z.number().min(0).max(10000).optional().nullable(),
  physicalDepthCm: z.number().min(0).max(10000).optional().nullable(),
  weightKg: z.number().min(0).max(100000).optional().nullable(),

  installationType: z.string().trim().max(200).optional().nullable(),
  installationHeight: z.string().trim().max(200).optional().nullable(),
  viewingDistance: z.string().trim().max(200).optional().nullable(),
  mountingMethod: z.string().trim().max(500).optional().nullable(),
  lightingRequirements: z.string().trim().max(1000).optional().nullable(),
  powerRequirements: z.string().trim().max(1000).optional().nullable(),
  specialToolsEquipment: z.string().trim().max(1000).optional().nullable(),
  safetyConsiderations: z.string().trim().max(2000).optional().nullable(),
  installationArea: z.string().trim().max(500).optional().nullable(),
  componentCount: z.number().int().min(0).max(10000).optional().nullable(),
  installationTime: z.string().trim().max(200).optional().nullable(),

  technicalRequirements: z.string().trim().max(3000).optional().nullable(),
  hardwareRequirements: z.string().trim().max(3000).optional().nullable(),
  softwareRequirements: z.string().trim().max(3000).optional().nullable(),
  displayRequirements: z.string().trim().max(3000).optional().nullable(),
  internetRequirements: z.string().trim().max(1000).optional().nullable(),
  installationInstructions: z.string().trim().max(5000).optional().nullable(),
  userInteractionInstructions: z.string().trim().max(5000).optional().nullable(),
});

const materialSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO", "DOCUMENT", "PORTFOLIO", "OTHER"]),
  title: z.string().trim().max(300).optional().nullable(),
  fileName: z.string().trim().min(1).max(500),
  fileUrl: z.string().trim().url().max(2000),
  mimeType: z.string().trim().max(200).optional().nullable(),
  fileSize: z.number().int().min(0).max(524288000).optional().nullable(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
});

async function getParticipantId(userId: string) {
  const participant = await prisma.participant.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!participant) {
    throw new Error("Participant profile not found");
  }

  return participant.id;
}

async function getSubmission(participantId: string) {
  return prisma.exhibitorSubmission.findUnique({
    where: { participantId },
    include: {
      artworks: {
        orderBy: { sequence: "asc" },
        include: {
          supportingMaterials: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });
}

function isCompleteSubmission(
  submission: NonNullable<Awaited<ReturnType<typeof getSubmission>>>,
) {
  if (submission.artworks.length < 1 || submission.artworks.length > 3) {
    return false;
  }

  const declarations = [
    submission.declarationAccurate,
    submission.declarationOriginal,
    submission.declarationDeadline,
    submission.declarationTechnical,
    submission.declarationGuidelines,
    submission.declarationIp,
  ];

  if (declarations.some((value) => !value)) {
    return false;
  }

  return submission.artworks.every((artwork) => {
    const hasImage = artwork.supportingMaterials.some(
      (material) => material.type === "IMAGE",
    );

    return (
      artwork.title.trim().length > 0 &&
      Boolean(artwork.category?.trim()) &&
      Boolean(artwork.medium?.trim()) &&
      Boolean(artwork.shortDescription?.trim()) &&
      Boolean(artwork.designConcept?.trim()) &&
      Boolean(artwork.keywords?.trim()) &&
      hasImage
    );
  });
}

export async function participantRoutes(app: FastifyInstance) {
  const participantOnly = {
    preHandler: [authenticate, requireRole("PARTICIPANT")],
  };

  app.get(
    "/api/v1/participant/profile",
    participantOnly,
    async (request, reply) => {
      const participant = await prisma.participant.findUnique({
        where: { userId: request.user!.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
            },
          },
          submissions: {
            select: {
              id: true,
              status: true,
              submittedAt: true,
              reviewedAt: true,
              decidedAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!participant) {
        return reply.status(404).send({
          error: "Participant profile not found",
        });
      }

      return reply.send({
        participant,
      });
    },
  );

  app.put(
    "/api/v1/participant/profile",
    participantOnly,
    async (request, reply) => {
      const parsed = profileSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Invalid participant profile",
          details: parsed.error.flatten(),
        });
      }

      const participant = await prisma.participant.upsert({
        where: {
          userId: request.user!.id,
        },
        create: {
          userId: request.user!.id,
          ...parsed.data,
        },
        update: parsed.data,
      });

      await prisma.user.update({
        where: { id: request.user!.id },
        data: {
          name: parsed.data.fullName,
        },
      });

      return reply.send({
        participant,
      });
    },
  );

  app.get(
    "/api/v1/exhibitor/submission",
    participantOnly,
    async (request, reply) => {
      const participantId = await getParticipantId(request.user!.id);
      const submission = await getSubmission(participantId);

      return reply.send({
        submission,
      });
    },
  );

  app.post(
    "/api/v1/exhibitor/submission",
    participantOnly,
    async (request, reply) => {
      const participantId = await getParticipantId(request.user!.id);

      const existing = await prisma.exhibitorSubmission.findUnique({
        where: { participantId },
      });

      if (existing) {
        return reply.status(409).send({
          error: "Exhibitor submission already exists",
          submissionId: existing.id,
        });
      }

      const parsed = submissionSchema.safeParse(request.body ?? {});

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Invalid submission data",
          details: parsed.error.flatten(),
        });
      }

      const submission = await prisma.exhibitorSubmission.create({
        data: {
          participantId,
          ...parsed.data,
        },
        include: {
          artworks: true,
        },
      });

      return reply.status(201).send({
        submission,
      });
    },
  );

  app.put(
    "/api/v1/exhibitor/submission",
    participantOnly,
    async (request, reply) => {
      const participantId = await getParticipantId(request.user!.id);

      const submission = await prisma.exhibitorSubmission.findUnique({
        where: { participantId },
      });

      if (!submission) {
        return reply.status(404).send({
          error: "Exhibitor submission not found",
        });
      }

      if (submission.status !== "DRAFT") {
        return reply.status(409).send({
          error: "Submitted exhibition applications cannot be edited",
        });
      }

      const parsed = submissionSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Invalid submission data",
          details: parsed.error.flatten(),
        });
      }

      const updated = await prisma.exhibitorSubmission.update({
        where: { id: submission.id },
        data: parsed.data,
        include: {
          artworks: {
            orderBy: { sequence: "asc" },
            include: {
              supportingMaterials: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      });

      return reply.send({
        submission: updated,
      });
    },
  );

  app.post(
    "/api/v1/exhibitor/submission/artworks",
    participantOnly,
    async (request, reply) => {
      const participantId = await getParticipantId(request.user!.id);

      const submission = await prisma.exhibitorSubmission.findUnique({
        where: { participantId },
      });

      if (!submission) {
        return reply.status(404).send({
          error: "Exhibitor submission not found",
        });
      }

      if (submission.status !== "DRAFT") {
        return reply.status(409).send({
          error: "Submitted exhibition applications cannot be edited",
        });
      }

      const parsed = artworkSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Invalid artwork data",
          details: parsed.error.flatten(),
        });
      }

      const artworkCount = await prisma.artwork.count({
        where: { submissionId: submission.id },
      });

      if (artworkCount >= 3) {
        return reply.status(409).send({
          error: "Maximum 3 artworks are allowed",
        });
      }

      const existingSequence = await prisma.artwork.findUnique({
        where: {
          submissionId_sequence: {
            submissionId: submission.id,
            sequence: parsed.data.sequence,
          },
        },
      });

      if (existingSequence) {
        return reply.status(409).send({
          error: "Artwork sequence already exists",
        });
      }

      const artwork = await prisma.artwork.create({
        data: {
          submissionId: submission.id,
          ...parsed.data,
        },
      });

      return reply.status(201).send({
        artwork,
      });
    },
  );

  app.put(
    "/api/v1/exhibitor/submission/artworks/:id",
    participantOnly,
    async (request, reply) => {
      const participantId = await getParticipantId(request.user!.id);
      const artworkId = (request.params as { id?: string }).id;

      if (!artworkId) {
        return reply.status(400).send({
          error: "Artwork ID is required",
        });
      }

      const artwork = await prisma.artwork.findFirst({
        where: {
          id: artworkId,
          submission: {
            participantId,
          },
        },
        include: {
          submission: true,
        },
      });

      if (!artwork) {
        return reply.status(404).send({
          error: "Artwork not found",
        });
      }

      if (artwork.submission.status !== "DRAFT") {
        return reply.status(409).send({
          error: "Submitted exhibition applications cannot be edited",
        });
      }

      const parsed = artworkSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Invalid artwork data",
          details: parsed.error.flatten(),
        });
      }

      if (parsed.data.sequence !== artwork.sequence) {
        const sequenceOwner = await prisma.artwork.findUnique({
          where: {
            submissionId_sequence: {
              submissionId: artwork.submissionId,
              sequence: parsed.data.sequence,
            },
          },
        });

        if (sequenceOwner) {
          return reply.status(409).send({
            error: "Artwork sequence already exists",
          });
        }
      }

      const updated = await prisma.artwork.update({
        where: { id: artwork.id },
        data: parsed.data,
      });

      return reply.send({
        artwork: updated,
      });
    },
  );

  app.delete(
    "/api/v1/exhibitor/submission/artworks/:id",
    participantOnly,
    async (request, reply) => {
      const participantId = await getParticipantId(request.user!.id);
      const artworkId = (request.params as { id?: string }).id;

      if (!artworkId) {
        return reply.status(400).send({
          error: "Artwork ID is required",
        });
      }

      const artwork = await prisma.artwork.findFirst({
        where: {
          id: artworkId,
          submission: {
            participantId,
          },
        },
        include: {
          submission: true,
        },
      });

      if (!artwork) {
        return reply.status(404).send({
          error: "Artwork not found",
        });
      }

      if (artwork.submission.status !== "DRAFT") {
        return reply.status(409).send({
          error: "Submitted exhibition applications cannot be edited",
        });
      }

      await prisma.artwork.delete({
        where: { id: artwork.id },
      });

      return reply.status(204).send();
    },
  );

  app.post(
    "/api/v1/exhibitor/artworks/:id/materials",
    participantOnly,
    async (request, reply) => {
      const participantId = await getParticipantId(request.user!.id);
      const artworkId = (request.params as { id?: string }).id;

      if (!artworkId) {
        return reply.status(400).send({
          error: "Artwork ID is required",
        });
      }

      const artwork = await prisma.artwork.findFirst({
        where: {
          id: artworkId,
          submission: {
            participantId,
          },
        },
        include: {
          submission: true,
        },
      });

      if (!artwork) {
        return reply.status(404).send({
          error: "Artwork not found",
        });
      }

      if (artwork.submission.status !== "DRAFT") {
        return reply.status(409).send({
          error: "Submitted exhibition applications cannot be edited",
        });
      }

      const parsed = materialSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: "Invalid supporting material",
          details: parsed.error.flatten(),
        });
      }

      const material = await prisma.supportingMaterial.create({
        data: {
          artworkId,
          ...parsed.data,
        },
      });

      return reply.status(201).send({
        material,
      });
    },
  );

  app.delete(
    "/api/v1/exhibitor/materials/:id",
    participantOnly,
    async (request, reply) => {
      const participantId = await getParticipantId(request.user!.id);
      const materialId = (request.params as { id?: string }).id;

      if (!materialId) {
        return reply.status(400).send({
          error: "Material ID is required",
        });
      }

      const material = await prisma.supportingMaterial.findFirst({
        where: {
          id: materialId,
          artwork: {
            submission: {
              participantId,
            },
          },
        },
        include: {
          artwork: {
            include: {
              submission: true,
            },
          },
        },
      });

      if (!material) {
        return reply.status(404).send({
          error: "Supporting material not found",
        });
      }

      if (material.artwork.submission.status !== "DRAFT") {
        return reply.status(409).send({
          error: "Submitted exhibition applications cannot be edited",
        });
      }

      await prisma.supportingMaterial.delete({
        where: { id: material.id },
      });

      return reply.status(204).send();
    },
  );

  app.post(
    "/api/v1/exhibitor/submission/submit",
    participantOnly,
    async (request, reply) => {
      const participantId = await getParticipantId(request.user!.id);

      const submission = await getSubmission(participantId);

      if (!submission) {
        return reply.status(404).send({
          error: "Exhibitor submission not found",
        });
      }

      if (submission.status !== "DRAFT") {
        return reply.status(409).send({
          error: "Exhibitor submission has already been submitted",
        });
      }

      if (!isCompleteSubmission(submission)) {
        return reply.status(422).send({
          error: "Exhibitor submission is incomplete",
          message:
            "Complete the required declarations, at least one artwork, artwork information, and at least one high-resolution image for each artwork before submitting.",
        });
      }

      const updated = await prisma.exhibitorSubmission.update({
        where: { id: submission.id },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
          artworks: {
            updateMany: {
              where: {
                status: "DRAFT",
              },
              data: {
                status: "SUBMITTED",
              },
            },
          },
        },
        include: {
          artworks: {
            orderBy: { sequence: "asc" },
            include: {
              supportingMaterials: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      });

      return reply.send({
        submission: updated,
      });
    },
  );
}
