-- AlterTable
ALTER TABLE "OAuthToken" ADD COLUMN     "metadata" JSONB,
ALTER COLUMN "expiresAt" DROP NOT NULL;
