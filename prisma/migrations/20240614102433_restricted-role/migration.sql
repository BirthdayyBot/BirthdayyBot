/*
  Warnings:

  - The primary key for the `birthday` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `birthday` table. All the data in the column will be lost.
  - You are about to alter the column `user_id` on the `birthday` table. The data in that column could be lost. The data in that column will be cast from `VarChar(32)` to `VarChar(19)`.
  - You are about to alter the column `guild_id` on the `birthday` table. The data in that column could be lost. The data in that column will be cast from `VarChar(32)` to `VarChar(19)`.
  - The primary key for the `guild` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `last_updated` on the `guild` table. All the data in the column will be lost.
  - You are about to alter the column `guild_id` on the `guild` table. The data in that column could be lost. The data in that column will be cast from `VarChar(32)` to `VarChar(19)`.
  - You are about to alter the column `inviter` on the `guild` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(19)`.
  - You are about to alter the column `announcement_channel` on the `guild` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(19)`.
  - You are about to alter the column `overview_channel` on the `guild` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(19)`.
  - You are about to alter the column `overview_message` on the `guild` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(19)`.
  - You are about to alter the column `birthday_role` on the `guild` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(19)`.
  - You are about to alter the column `birthday_ping_role` on the `guild` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(19)`.
  - You are about to alter the column `log_channel` on the `guild` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(19)`.
  - You are about to alter the column `user_id` on the `premium` table. The data in that column could be lost. The data in that column will be cast from `VarChar(32)` to `VarChar(19)`.
  - You are about to alter the column `guild_id` on the `premium` table. The data in that column could be lost. The data in that column will be cast from `VarChar(32)` to `VarChar(19)`.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `last_updated` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `user_id` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(32)` to `VarChar(19)`.
  - You are about to alter the column `username` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(32)` to `VarChar(19)`.
  - Added the required column `updated_at` to the `birthday` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `guild` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `birthday` DROP FOREIGN KEY `birthday_guild_id_fkey`;

-- DropForeignKey
ALTER TABLE `birthday` DROP FOREIGN KEY `birthday_user_id_fkey`;

-- AlterTable
ALTER TABLE `birthday` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `user_id` VARCHAR(19) NOT NULL,
    MODIFY `guild_id` VARCHAR(19) NOT NULL;

-- AlterTable
ALTER TABLE `guild` DROP PRIMARY KEY,
    DROP COLUMN `last_updated`,
    ADD COLUMN `announcement_restricted_mode` ENUM('AUTHORIZED', 'PROHIBITED') NOT NULL DEFAULT 'AUTHORIZED',
    ADD COLUMN `announcement_restricted_role` JSON NOT NULL,
    ADD COLUMN `birthday_restricted_mode` ENUM('AUTHORIZED', 'PROHIBITED') NOT NULL DEFAULT 'AUTHORIZED',
    ADD COLUMN `birthday_restricted_role` JSON NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `guild_id` VARCHAR(19) NOT NULL,
    MODIFY `inviter` VARCHAR(19) NULL,
    MODIFY `announcement_channel` VARCHAR(19) NULL,
    MODIFY `overview_channel` VARCHAR(19) NULL,
    MODIFY `overview_message` VARCHAR(19) NULL,
    MODIFY `birthday_role` VARCHAR(19) NULL,
    MODIFY `birthday_ping_role` VARCHAR(19) NULL,
    MODIFY `log_channel` VARCHAR(19) NULL,
    ADD PRIMARY KEY (`guild_id`);

-- AlterTable
ALTER TABLE `premium` MODIFY `user_id` VARCHAR(19) NOT NULL,
    MODIFY `guild_id` VARCHAR(19) NULL;

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `last_updated`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `user_id` VARCHAR(19) NOT NULL,
    MODIFY `username` VARCHAR(19) NULL,
    ADD PRIMARY KEY (`user_id`);

-- CreateIndex
CREATE INDEX `index_birthday` ON `birthday`(`birthday`);

-- CreateIndex
CREATE INDEX `index_guild_id` ON `guild`(`guild_id`);

-- CreateIndex
CREATE INDEX `index_user_id` ON `user`(`user_id`);

-- AddForeignKey
ALTER TABLE `birthday` ADD CONSTRAINT `birthday_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `birthday` ADD CONSTRAINT `birthday_guild_id_fkey` FOREIGN KEY (`guild_id`) REFERENCES `guild`(`guild_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
