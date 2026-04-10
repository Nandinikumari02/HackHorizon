/*
  Warnings:

  - You are about to drop the column `beforeImage` on the `Issue` table. All the data in the column will be lost.
  - The `afterImage` column on the `Issue` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Issue" DROP COLUMN "beforeImage",
ADD COLUMN     "beforeImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "afterImage",
ADD COLUMN     "afterImage" TEXT[] DEFAULT ARRAY[]::TEXT[];
