/*
  Warnings:

  - Added the required column `shortName` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Unit_name_key";

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "shortName" TEXT NOT NULL;
