import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";

const importPayloadSchema = z.object({
  submissionId: z.string().trim().min(1).max(200),
  submittedAt: z.coerce.date(),

  participant: z.object({
    name: z.string().trim().min(2).max(160),
    professionalTitle: z.string().trim().max(160).optional().nullable(),
    institution: z.string().trim().max(200).optional().nullable(),
    country: z.string().trim().max(120).optional().nullable(),
    city: z.string().trim().max(120).optional().nullable(),
    email: z.string().trim().toLowerCase().email(),
    phoneWhatsapp: z.string().trim().max(50).optional().nullable(),
    websitePortfolio: z.string().trim().max(500).optional().nullable(),
    socialMedia: z.string().trim().max(500).optional().nullable(),
  }),

  artworks: z.array(z.object({
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
  })).min(1).max(3),

  supportingMaterials: z.array(z.object({
    artworkSequence: z.number().int().min(1).max(3),
    type: z.enum(["IMAGE", "VIDEO", "DOCUMENT", "PORTFOLIO", "OTHER"]),
    title: z.string().trim().max(300).optional().nullable(),
    fileName: z.string().trim().min(1).max(500),
    fileUrl: z.string().trim().url().max(2000),
    mimeType: z.string().trim().max(200).optional().nullable(),
    fileSize: z.number().int().min(0).max(524288000).optional().nullable(),
    sortOrder: z.number().int().min(0).max(1000).optional(),
  })).default([]),

  declarations: z.object({
    accurate: z.boolean(),
    original: z.boolean(),
    deadline: z.boolean(),
    technical: z.boolean(),
    guidelines: z.boolean(),
    ip: z.boolean(),
  }),
});

function requireImportKey(
  request: FastifyRequest,
  reply: FastifyReply,
): boolean {
  const expected = process.env.JIDEX_IMPORT_KEY;
  const supplied = request.headers["x-jidex-import-key"];

  if (!expected || typeof supplied !== "string" || supplied !== expected) {
    void reply.status(401).send({
      error: "Invalid import credentials",
    });
    return false;
  }

  return true;
}

export async function importRoutes(app: FastifyInstance) {
  app.post("/api/v1/import/submission", async (request, reply) => {
    if (!requireImportKey(request, reply)) {
      return;
    }

    const parsed = importPayloadSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid import data",
        details: parsed.error.flatten(),
      });
    }

    const data = parsed.data;
    const sequences = data.artworks.map((artwork) => artwork.sequence);

    if (new Set(sequences).size !== sequences.length) {
      return reply.status(400).send({
        error: "Artwork sequences must be unique",
      });
    }

    const artworkSequenceSet = new Set(sequences);

    for (const material of data.supportingMaterials) {
      if (!artworkSequenceSet.has(material.artworkSequence)) {
        return reply.status(400).send({
          error: "Supporting material references an unknown artwork sequence",
          sequence: material.artworkSequence,
        });
      }
    }

    const requiredDeclarations = Object.values(data.declarations);

    if (requiredDeclarations.some((value) => value !== true)) {
      return reply.status(422).send({
        error: "All declarations must be confirmed",
      });
    }

    for (const artwork of data.artworks) {
      const hasImage = data.supportingMaterials.some(
        (material) =>
          material.artworkSequence === artwork.sequence &&
          material.type === "IMAGE",
      );

      if (!hasImage) {
        return reply.status(422).send({
          error: "Each artwork must have at least one IMAGE supporting material",
          sequence: artwork.sequence,
        });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: {
          email: data.participant.email,
        },
        include: {
          participant: {
            include: {
              submissions: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (existingUser?.participant?.submissions.length) {
        return {
          duplicate: true as const,
          submissionId: existingUser.participant.submissions[0].id,
        };
      }

      const userId = existingUser?.id ?? (
        await tx.user.create({
          data: {
            name: data.participant.name,
            email: data.participant.email,
            passwordHash: await hashPassword(
              randomBytes(32).toString("hex"),
            ),
            role: "PARTICIPANT",
            status: "ACTIVE",
          },
        })
      ).id;

      const participant = await tx.participant.upsert({
        where: {
          userId,
        },
        create: {
          userId,
          fullName: data.participant.name,
          position: data.participant.professionalTitle ?? null,
          institution: data.participant.institution ?? null,
          phone: data.participant.phoneWhatsapp ?? null,
          country: data.participant.country ?? null,
          city: data.participant.city ?? null,
          website: data.participant.websitePortfolio ?? null,
          socialMedia: data.participant.socialMedia ?? null,
        },
        update: {
          fullName: data.participant.name,
          position: data.participant.professionalTitle ?? null,
          institution: data.participant.institution ?? null,
          phone: data.participant.phoneWhatsapp ?? null,
          country: data.participant.country ?? null,
          city: data.participant.city ?? null,
          website: data.participant.websitePortfolio ?? null,
          socialMedia: data.participant.socialMedia ?? null,
        },
      });

      const existingSubmission = await tx.exhibitorSubmission.findUnique({
        where: {
          participantId: participant.id,
        },
      });

      if (existingSubmission) {
        return {
          duplicate: true as const,
          submissionId: existingSubmission.id,
        };
      }

      const submission = await tx.exhibitorSubmission.create({
        data: {
          participantId: participant.id,
          status: "SUBMITTED",
          submittedAt: data.submittedAt,
          declarationAccurate: data.declarations.accurate,
          declarationOriginal: data.declarations.original,
          declarationDeadline: data.declarations.deadline,
          declarationTechnical: data.declarations.technical,
          declarationGuidelines: data.declarations.guidelines,
          declarationIp: data.declarations.ip,
        },
      });

      const artworkIds = new Map<number, string>();

      for (const artwork of data.artworks) {
        const created = await tx.artwork.create({
          data: {
            submissionId: submission.id,
            sequence: artwork.sequence,
            status: "SUBMITTED",
            title: artwork.title,
            year: artwork.year ?? null,
            category: artwork.category ?? null,
            medium: artwork.medium ?? null,
            dimensions: artwork.dimensions ?? null,
            materials: artwork.materials ?? null,
            duration: artwork.duration ?? null,
            shortDescription: artwork.shortDescription ?? null,
            designConcept: artwork.designConcept ?? null,
            keywords: artwork.keywords ?? null,
            physicalWidthCm: artwork.physicalWidthCm ?? null,
            physicalHeightCm: artwork.physicalHeightCm ?? null,
            physicalDepthCm: artwork.physicalDepthCm ?? null,
            weightKg: artwork.weightKg ?? null,
            installationType: artwork.installationType ?? null,
            installationHeight: artwork.installationHeight ?? null,
            viewingDistance: artwork.viewingDistance ?? null,
            mountingMethod: artwork.mountingMethod ?? null,
            lightingRequirements: artwork.lightingRequirements ?? null,
            powerRequirements: artwork.powerRequirements ?? null,
            specialToolsEquipment: artwork.specialToolsEquipment ?? null,
            safetyConsiderations: artwork.safetyConsiderations ?? null,
            installationArea: artwork.installationArea ?? null,
            componentCount: artwork.componentCount ?? null,
            installationTime: artwork.installationTime ?? null,
            technicalRequirements: artwork.technicalRequirements ?? null,
            hardwareRequirements: artwork.hardwareRequirements ?? null,
            softwareRequirements: artwork.softwareRequirements ?? null,
            displayRequirements: artwork.displayRequirements ?? null,
            internetRequirements: artwork.internetRequirements ?? null,
            installationInstructions: artwork.installationInstructions ?? null,
            userInteractionInstructions:
              artwork.userInteractionInstructions ?? null,
          },
        });

        artworkIds.set(artwork.sequence, created.id);
      }

      for (const material of data.supportingMaterials) {
        const artworkId = artworkIds.get(material.artworkSequence);

        if (!artworkId) {
          throw new Error(
            "Supporting material references an unknown artwork sequence",
          );
        }

        await tx.supportingMaterial.create({
          data: {
            artworkId,
            type: material.type,
            title: material.title ?? null,
            fileName: material.fileName,
            fileUrl: material.fileUrl,
            mimeType: material.mimeType ?? null,
            fileSize: material.fileSize ?? null,
            sortOrder: material.sortOrder ?? 0,
          },
        });
      }

      return {
        duplicate: false as const,
        submissionId: submission.id,
        participantId: participant.id,
        artworkCount: data.artworks.length,
      };
    });

    if (result.duplicate) {
      return reply.status(200).send({
        ok: true,
        status: "ALREADY_SYNCED",
        duplicate: true,
        submissionId: result.submissionId,
      });
    }

    return reply.status(201).send({
      ok: true,
      status: "SYNCED",
      duplicate: false,
      submissionId: result.submissionId,
      participantId: result.participantId,
      artworkCount: result.artworkCount,
    });
  });
}
