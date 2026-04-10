/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Issue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Issue" DROP COLUMN "imageUrl",
ADD COLUMN     "images" TEXT,
ADD COLUMN     "staffId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Issue" ADD CONSTRAINT "Issue_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
