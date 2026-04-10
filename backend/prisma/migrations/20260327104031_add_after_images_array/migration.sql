/*
  Warnings:

  - You are about to drop the column `afterImage` on the `Issue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Issue" DROP COLUMN "afterImage",
ADD COLUMN     "afterImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
