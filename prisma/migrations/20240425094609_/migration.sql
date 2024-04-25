/*
  Warnings:

  - You are about to drop the column `birthday` on the `birthday` table. All the data in the column will be lost.
  - Made the column `day` on table `birthday` required. This step will fail if there are existing NULL values in that column.
  - Made the column `month` on table `birthday` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "birthday" DROP COLUMN "birthday",
ALTER COLUMN "day" SET NOT NULL,
ALTER COLUMN "month" SET NOT NULL;
