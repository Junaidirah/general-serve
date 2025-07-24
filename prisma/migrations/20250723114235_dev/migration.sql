/*
  Warnings:

  - The values [PLTD_MOUTONG_THAS,PLTD_MOUTONG_PLN] on the enum `PlantType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `DM` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `avg_max` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `avg_min` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `load` on the `Machine` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `Machine` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Plant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identifier` to the `Machine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlantType_new" AS ENUM ('PLTD_KOTARAYA', 'PLTM_TOMINI', 'THAS_POWER_PALASA', 'GSS_BOLANO', 'PLN_MOUTONG', 'THAS_POWER_MOUTONG');
ALTER TABLE "Plant" ALTER COLUMN "type" TYPE "PlantType_new" USING ("type"::text::"PlantType_new");
ALTER TYPE "PlantType" RENAME TO "PlantType_old";
ALTER TYPE "PlantType_new" RENAME TO "PlantType";
DROP TYPE "PlantType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Machine" DROP COLUMN "DM",
DROP COLUMN "avg_max",
DROP COLUMN "avg_min",
DROP COLUMN "load",
DROP COLUMN "number",
ADD COLUMN     "identifier" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "LoadReading" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "load" DOUBLE PRECISION NOT NULL,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoadReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySummary" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "maxLoad" DOUBLE PRECISION,
    "minLoad" DOUBLE PRECISION,
    "dmSiang" DOUBLE PRECISION,
    "dmMalam" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoadReading_machineId_timestamp_key" ON "LoadReading"("machineId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "DailySummary_machineId_date_key" ON "DailySummary"("machineId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Plant_name_key" ON "Plant"("name");

-- AddForeignKey
ALTER TABLE "LoadReading" ADD CONSTRAINT "LoadReading_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySummary" ADD CONSTRAINT "DailySummary_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
