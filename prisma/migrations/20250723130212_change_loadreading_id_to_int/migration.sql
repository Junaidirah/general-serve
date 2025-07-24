/*
  Warnings:

  - The primary key for the `DailySummary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `DailySummary` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `LoadReading` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `LoadReading` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "DailySummary" DROP CONSTRAINT "DailySummary_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "DailySummary_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "LoadReading" DROP CONSTRAINT "LoadReading_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "LoadReading_pkey" PRIMARY KEY ("id");
