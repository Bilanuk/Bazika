-- AlterTable
ALTER TABLE "Serial" ADD COLUMN     "anilistDescription" TEXT,
ADD COLUMN     "anilistId" INTEGER,
ADD COLUMN     "bannerImage" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "lastAnilistSync" TIMESTAMP(3),
ADD COLUMN     "titleEnglish" TEXT,
ADD COLUMN     "titleNative" TEXT,
ADD COLUMN     "titleRomaji" TEXT;
