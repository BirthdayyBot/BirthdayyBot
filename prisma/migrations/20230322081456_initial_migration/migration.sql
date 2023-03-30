-- CreateTable
CREATE TABLE `birthday` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(32) NOT NULL,
    `guild_id` VARCHAR(32) NOT NULL,
    `birthday` VARCHAR(10) NOT NULL,
    `disabled` BOOLEAN NOT NULL DEFAULT false,

    INDEX `index_birthday_birthday`(`birthday`),
    INDEX `index_guild_id_birthday`(`guild_id`),
    INDEX `index_user_id_birthday`(`user_id`),
    UNIQUE INDEX `unique_user_guild`(`user_id`, `guild_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blocklist` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `guild_id` VARCHAR(32) NOT NULL,
    `user_id` VARCHAR(32) NOT NULL,
    `added_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `disabled` BOOLEAN NOT NULL DEFAULT false,

    INDEX `index_guild_id_blocklist`(`guild_id`),
    INDEX `index_user_id_blocklist`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guild` (
    `guild_id` VARCHAR(32) NOT NULL,
    `inviter` VARCHAR(20) NULL,
    `announcement_channel` VARCHAR(20) NULL,
    `announcement_message` VARCHAR(512) NOT NULL DEFAULT '<:arrwright:931267038746390578> Today is a special Day!{NEW_LINE}<:gift:931267039094534175> Please wish {MENTION} a happy Birthday <3',
    `overview_channel` VARCHAR(20) NULL,
    `overview_message` VARCHAR(20) NULL,
    `birthday_role` VARCHAR(20) NULL,
    `birthday_ping_role` VARCHAR(20) NULL,
    `log_channel` VARCHAR(20) NULL,
    `timezone` INTEGER NOT NULL DEFAULT 0,
    `premium` BOOLEAN NOT NULL DEFAULT false,
    `language` VARCHAR(5) NOT NULL DEFAULT 'en-US',
    `last_updated` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `disabled` BOOLEAN NOT NULL DEFAULT false,

    INDEX `index_last_updated_guild`(`last_updated`),
    PRIMARY KEY (`guild_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `premium` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(32) NOT NULL,
    `guild_id` VARCHAR(32) NULL,
    `tier` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tiers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(512) NULL,
    `last_updated` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `user_id` VARCHAR(32) NOT NULL,
    `username` VARCHAR(32) NULL,
    `discriminator` VARCHAR(4) NULL,
    `premium` BOOLEAN NOT NULL DEFAULT false,
    `last_updated` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `index_user_birthday`(`username`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
