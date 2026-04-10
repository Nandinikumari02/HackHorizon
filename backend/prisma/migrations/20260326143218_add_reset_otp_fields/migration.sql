/*
  Warnings:

  - You are about to drop the column `images` on the `Issue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Issue" DROP COLUMN "images",
ADD COLUMN     "afterImage" TEXT,
ADD COLUMN     "beforeImage" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "resetOtp" TEXT,
ADD COLUMN     "resetOtpExpires" TIMESTAMP(3);
