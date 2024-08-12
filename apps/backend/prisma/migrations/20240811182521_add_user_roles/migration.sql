-- CreateEnum
CREATE TYPE "next_auth"."UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "next_auth"."users" ADD COLUMN     "role" "next_auth"."UserRole" NOT NULL DEFAULT 'USER';
