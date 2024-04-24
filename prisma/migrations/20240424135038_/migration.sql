/*
  Warnings:

  - You are about to alter the column `roles.notified` on the `guild` table. The data in that column could be lost. The data in that column will be cast from `VarChar(19)` to `VarChar(19)`.

*/
-- AlterTable
ALTER TABLE "birthday" ADD COLUMN     "day" INTEGER,
ADD COLUMN     "month" INTEGER,
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "guild" ALTER COLUMN "roles.notified" DROP NOT NULL,
ALTER COLUMN "roles.notified" DROP DEFAULT,
ALTER COLUMN "roles.notified" SET DATA TYPE VARCHAR(19);
