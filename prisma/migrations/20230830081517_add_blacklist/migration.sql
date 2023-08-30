/*
  Warnings:

  - You are about to drop the `blocklist` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `guild` MODIFY `announcement_message` VARCHAR(512) NOT NULL DEFAULT '<:arrow_right_birthdayy:931267038746390578> Today is a special Day!{NEW_LINE}<:gift:931267039094534175> Please wish {MENTION} a happy Birthday <3';

-- DropTable
DROP TABLE `blocklist`;

-- CreateTable
CREATE TABLE `blacklist` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `guild_id` VARCHAR(32) NOT NULL,
    `user_id` VARCHAR(32) NOT NULL,
    `added_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `disabled` BOOLEAN NOT NULL DEFAULT false,

    INDEX `index_guild_id_blacklist`(`guild_id`),
    INDEX `index_user_id_blacklist`(`user_id`),
    UNIQUE INDEX `unique_user_guild_blacklist`(`user_id`, `guild_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
