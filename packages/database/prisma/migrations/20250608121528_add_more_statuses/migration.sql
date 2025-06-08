/*
  Warnings:

  - The values [PENDING,QUEUED,COMPLETED,FAILED,SKIPPED] on the enum `ProcessingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProcessingStatus_new" AS ENUM ('NONE', 'DOWNLOAD_QUEUED', 'DOWNLOADING', 'DOWNLOAD_COMPLETED', 'DOWNLOAD_FAILED', 'PROCESSING_QUEUED', 'PROCESSING', 'PROCESSING_COMPLETED', 'PROCESSING_FAILED', 'PROCESSING_SKIPPED');
ALTER TABLE "ContentItem" ALTER COLUMN "processingStatus" DROP DEFAULT;
ALTER TABLE "ContentItem" ALTER COLUMN "processingStatus" TYPE "ProcessingStatus_new" USING ("processingStatus"::text::"ProcessingStatus_new");
ALTER TYPE "ProcessingStatus" RENAME TO "ProcessingStatus_old";
ALTER TYPE "ProcessingStatus_new" RENAME TO "ProcessingStatus";
DROP TYPE "ProcessingStatus_old";
ALTER TABLE "ContentItem" ALTER COLUMN "processingStatus" SET DEFAULT 'NONE';
COMMIT;

-- AlterTable
ALTER TABLE "ContentItem" ALTER COLUMN "processingStatus" SET DEFAULT 'NONE';
