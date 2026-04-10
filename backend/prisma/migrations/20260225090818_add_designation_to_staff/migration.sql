-- AlterTable
ALTER TABLE "public"."Department" ADD COLUMN     "supportedRoles" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."Staff" ADD COLUMN     "designation" TEXT NOT NULL DEFAULT 'Field Staff';
