/*
Warnings:
- The primary key for the `birthday` table will be changed. If it partially fails, the table could be left without primary key constraint.
- You are about to drop the column `disabled` on the `birthday` table. All the data in the column will be lost.
- You are about to drop the column `id` on the `birthday` table. All the data in the column will be lost.
- The primary key for the `guild` table will be changed. If it partially fails, the table could be left without primary key constraint.
- You are about to drop the column `announcement_channel` on the `guild` table. All the data in the column will be lost.
- You are about to drop the column `announcement_message` on the `guild` table. All the data in the column will be lost.
- You are about to drop the column `birthday_ping_role` on the `guild` table. All the data in the column will be lost.
- You are about to drop the column `birthday_role` on the `guild` table. All the data in the column will be lost.
- You are about to drop the column `disabled` on the `guild` table. All the data in the column will be lost.
- You are about to drop the column `guild_id` on the `guild` table. All the data in the column will be lost.
- You are about to drop the column `log_channel` on the `guild` table. All the data in the column will be lost.
- You are about to drop the column `overview_channel` on the `guild` table. All the data in the column will be lost.
- You are about to drop the column `overview_message` on the `guild` table. All the data in the column will be lost.
- The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
- You are about to drop the column `user_id` on the `user` table. All the data in the column will be lost.
- You are about to drop the `premium` table. If the table is not empty, all the data it contains will be lost.
- You are about to drop the `tiers` table. If the table is not empty, all the data it contains will be lost.
- Added the required column `last_updated` to the `birthday` table without a default value. This is not possible if the table is not empty.
- Changed the type of `user_id` on the `birthday` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
- Changed the type of `guild_id` on the `birthday` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
- Added the required column `id` to the `guild` table without a default value. This is not possible if the table is not empty.
- Made the column `last_updated` on table `guild` required. This step will fail if there are existing NULL values in that column.
- Added the required column `id` to the `user` table without a default value. This is not possible if the table is not empty.
*/
-- DropForeignKey
ALTER TABLE "birthday" DROP CONSTRAINT "birthday_guild_id_fkey";

-- DropForeignKey
ALTER TABLE "birthday" DROP CONSTRAINT "birthday_user_id_fkey";

-- DropIndex
DROP INDEX "index_birthday_birthday";

-- DropIndex
DROP INDEX "index_guild_id_birthday";

-- DropIndex
DROP INDEX "index_user_id_birthday";

-- DropIndex
DROP INDEX "index_last_updated_guild";

-- DropIndex
DROP INDEX "index_user_birthday";

-- AlterTable
ALTER TABLE "birthday"
DROP CONSTRAINT "birthday_pkey",
DROP COLUMN "disabled",
DROP COLUMN "id",
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "in_delete_queue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "last_updated" TIMESTAMP(3) NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN "user_id" BIGINT NOT NULL,
DROP COLUMN "guild_id",
ADD COLUMN "guild_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "guild" DROP CONSTRAINT "guild_pkey",
DROP COLUMN "announcement_channel",
DROP COLUMN "announcement_message",
DROP COLUMN "birthday_ping_role",
DROP COLUMN "birthday_role",
DROP COLUMN "disabled",
DROP COLUMN "guild_id",
DROP COLUMN "log_channel",
DROP COLUMN "overview_channel",
DROP COLUMN "overview_message",
ADD COLUMN     "channels.announcement" VARCHAR(19),
ADD COLUMN     "channels.logs" VARCHAR(19),
ADD COLUMN     "channels.overview" VARCHAR(19),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" BIGINT NOT NULL,
ADD COLUMN     "in_delete_queue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "messages.announcement" VARCHAR(200),
ADD COLUMN     "messages.overview" VARCHAR(19),
ADD COLUMN     "roles.birthday" VARCHAR(19),
ADD COLUMN     "roles.notified" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
ALTER COLUMN "last_updated" SET NOT NULL,
ALTER COLUMN "last_updated" DROP DEFAULT,
ALTER COLUMN "last_updated" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "guild_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user"
DROP CONSTRAINT "user_pkey",
DROP COLUMN "user_id",
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "id" BIGINT NOT NULL,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "premium";

-- DropTable
DROP TABLE "tiers";

-- CreateIndex
CREATE UNIQUE INDEX "birthday_user_id_guild_id_key" ON "birthday" ("user_id", "guild_id");

-- AddForeignKey
ALTER TABLE "birthday"
ADD CONSTRAINT "birthday_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "birthday"
ADD CONSTRAINT "birthday_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;