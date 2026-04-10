/*
  Warnings:

  - You are about to drop the column `staffId` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the column `changedBy` on the `IssueTimeline` table. All the data in the column will be lost.
  - Added the required column `userId` to the `IssueTimeline` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'SUPER_ADMIN';

-- DropForeignKey
ALTER TABLE "public"."Issue" DROP CONSTRAINT "Issue_staffId_fkey";

-- AlterTable
ALTER TABLE "public"."Issue" DROP COLUMN "staffId";

-- AlterTable
ALTER TABLE "public"."IssueTimeline" DROP COLUMN "changedBy",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."IssueTimeline" ADD CONSTRAINT "IssueTimeline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
