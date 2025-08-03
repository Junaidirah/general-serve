/*
  Warnings:

  - You are about to drop the `DailySummary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DailySummary" DROP CONSTRAINT "DailySummary_machineId_fkey";

-- AlterTable
ALTER TABLE "LoadReading" ADD COLUMN     "avgLoad" DOUBLE PRECISION,
ADD COLUMN     "dmMalam" DOUBLE PRECISION,
ADD COLUMN     "dmMesin" DOUBLE PRECISION,
ADD COLUMN     "dmSiang" DOUBLE PRECISION,
ADD COLUMN     "maxLoad" DOUBLE PRECISION,
ADD COLUMN     "minLoad" DOUBLE PRECISION,
ADD COLUMN     "surplus" DOUBLE PRECISION,
ALTER COLUMN "createdAt" DROP DEFAULT;

-- DropTable
DROP TABLE "DailySummary";
