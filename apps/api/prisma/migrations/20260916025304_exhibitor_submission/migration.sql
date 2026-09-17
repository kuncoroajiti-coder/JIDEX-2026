-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DECISION_MADE', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ArtworkStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'SELECTED', 'NOT_SELECTED');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'PORTFOLIO', 'OTHER');

-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "socialMedia" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "exhibitor_submissions" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "reviewerNote" TEXT,
    "declarationAccurate" BOOLEAN NOT NULL DEFAULT false,
    "declarationOriginal" BOOLEAN NOT NULL DEFAULT false,
    "declarationDeadline" BOOLEAN NOT NULL DEFAULT false,
    "declarationTechnical" BOOLEAN NOT NULL DEFAULT false,
    "declarationGuidelines" BOOLEAN NOT NULL DEFAULT false,
    "declarationIp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exhibitor_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artworks" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "status" "ArtworkStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "category" TEXT,
    "medium" TEXT,
    "dimensions" TEXT,
    "materials" TEXT,
    "duration" TEXT,
    "shortDescription" TEXT,
    "designConcept" TEXT,
    "keywords" TEXT,
    "physicalWidthCm" DECIMAL(10,2),
    "physicalHeightCm" DECIMAL(10,2),
    "physicalDepthCm" DECIMAL(10,2),
    "weightKg" DECIMAL(10,2),
    "installationType" TEXT,
    "installationHeight" TEXT,
    "viewingDistance" TEXT,
    "mountingMethod" TEXT,
    "lightingRequirements" TEXT,
    "powerRequirements" TEXT,
    "specialToolsEquipment" TEXT,
    "safetyConsiderations" TEXT,
    "installationArea" TEXT,
    "componentCount" INTEGER,
    "installationTime" TEXT,
    "technicalRequirements" TEXT,
    "hardwareRequirements" TEXT,
    "softwareRequirements" TEXT,
    "displayRequirements" TEXT,
    "internetRequirements" TEXT,
    "installationInstructions" TEXT,
    "userInteractionInstructions" TEXT,
    "selectionNote" TEXT,
    "selectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supporting_materials" (
    "id" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL,
    "title" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supporting_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exhibitor_submissions_participantId_key" ON "exhibitor_submissions"("participantId");

-- CreateIndex
CREATE INDEX "exhibitor_submissions_status_idx" ON "exhibitor_submissions"("status");

-- CreateIndex
CREATE INDEX "exhibitor_submissions_submittedAt_idx" ON "exhibitor_submissions"("submittedAt");

-- CreateIndex
CREATE INDEX "artworks_submissionId_idx" ON "artworks"("submissionId");

-- CreateIndex
CREATE INDEX "artworks_status_idx" ON "artworks"("status");

-- CreateIndex
CREATE INDEX "artworks_category_idx" ON "artworks"("category");

-- CreateIndex
CREATE UNIQUE INDEX "artworks_submissionId_sequence_key" ON "artworks"("submissionId", "sequence");

-- CreateIndex
CREATE INDEX "supporting_materials_artworkId_idx" ON "supporting_materials"("artworkId");

-- CreateIndex
CREATE INDEX "supporting_materials_type_idx" ON "supporting_materials"("type");

-- CreateIndex
CREATE INDEX "participants_country_idx" ON "participants"("country");

-- CreateIndex
CREATE INDEX "participants_city_idx" ON "participants"("city");

-- AddForeignKey
ALTER TABLE "exhibitor_submissions" ADD CONSTRAINT "exhibitor_submissions_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artworks" ADD CONSTRAINT "artworks_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "exhibitor_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supporting_materials" ADD CONSTRAINT "supporting_materials_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "artworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
