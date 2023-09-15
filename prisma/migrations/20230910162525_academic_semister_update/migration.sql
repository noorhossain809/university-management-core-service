/*
  Warnings:

  - Made the column `isCurrent` on table `academic_semesters` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "academic_semesters" ALTER COLUMN "isCurrent" SET NOT NULL;
