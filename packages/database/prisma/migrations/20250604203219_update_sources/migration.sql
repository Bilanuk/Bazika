/*
  Warnings:

  - You are about to drop the column `processed` on the `ContentItem` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- AlterTable
ALTER TABLE "ContentItem" DROP COLUMN "processed",
ADD COLUMN     "notificationSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'PENDING';
