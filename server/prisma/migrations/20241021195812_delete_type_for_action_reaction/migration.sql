/*
  Warnings:

  - You are about to drop the column `type` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Reaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Action" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "type";
