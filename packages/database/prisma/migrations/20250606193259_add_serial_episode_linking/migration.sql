/*
  Warnings:

  - A unique constraint covering the columns `[serialId,episodeNumber]` on the table `Episode` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN     "episodeId" TEXT,
ADD COLUMN     "infoHash" TEXT,
ADD COLUMN     "serialId" TEXT;

-- AlterTable
ALTER TABLE "Episode" ALTER COLUMN "url" SET DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Episode_serialId_episodeNumber_key" ON "Episode"("serialId", "episodeNumber");

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_serialId_fkey" FOREIGN KEY ("serialId") REFERENCES "Serial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
