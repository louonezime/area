/*
  Warnings:

  - Added the required column `state` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceState" AS ENUM ('ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "state" "ServiceState" NOT NULL;
