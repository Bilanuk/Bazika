-- AlterTable
ALTER TABLE "public"."Episode" ALTER COLUMN "episodeNumber" DROP DEFAULT;
DROP SEQUENCE "Episode_episodeNumber_seq";
