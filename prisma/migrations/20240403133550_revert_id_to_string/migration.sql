/*
  Warnings:

  - You are about to alter the column `user_id` on the `birthday` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `VarChar(19)`.
  - You are about to alter the column `guild_id` on the `birthday` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `VarChar(19)`.
  - The primary key for the `guild` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `guild` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `VarChar(19)`.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `user` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `VarChar(19)`.

*/
-- DropForeignKey
ALTER TABLE "birthday" DROP CONSTRAINT "birthday_guild_id_fkey";

-- DropForeignKey
ALTER TABLE "birthday" DROP CONSTRAINT "birthday_user_id_fkey";

-- AlterTable
ALTER TABLE "birthday" ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(19),
ALTER COLUMN "guild_id" SET DATA TYPE VARCHAR(19);

-- AlterTable
ALTER TABLE "guild" DROP CONSTRAINT "guild_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(19),
ALTER COLUMN "roles.notified" SET DEFAULT ARRAY[]::VARCHAR(19)[],
ADD CONSTRAINT "guild_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(19),
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "birthday" ADD CONSTRAINT "birthday_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "birthday" ADD CONSTRAINT "birthday_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
