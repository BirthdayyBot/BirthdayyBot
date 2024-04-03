/*
  Warnings:

  - You are about to drop the column `last_updated` on the `birthday` table. All the data in the column will be lost.
  - You are about to drop the column `last_updated` on the `guild` table. All the data in the column will be lost.
  - You are about to drop the column `last_updated` on the `user` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `birthday` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `guild` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "birthday" DROP COLUMN "last_updated",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "guild" DROP COLUMN "last_updated",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "roles.notified" SET DEFAULT ARRAY[]::VARCHAR(19)[];

-- AlterTable
ALTER TABLE "user" DROP COLUMN "last_updated",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
