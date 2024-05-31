-- DropIndex
DROP INDEX `index_birthday_birthday` ON `birthday`;

-- DropIndex
DROP INDEX `index_guild_id_birthday` ON `birthday`;

-- DropIndex
DROP INDEX `index_user_id_birthday` ON `birthday`;

-- DropIndex
DROP INDEX `index_last_updated_guild` ON `guild`;

-- DropIndex
DROP INDEX `index_user_birthday` ON `user`;

-- AlterTable
ALTER TABLE `guild` MODIFY `announcement_message` VARCHAR(512) NULL;

-- AddForeignKey
ALTER TABLE `birthday` ADD CONSTRAINT `birthday_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `birthday` ADD CONSTRAINT `birthday_guild_id_fkey` FOREIGN KEY (`guild_id`) REFERENCES `guild`(`guild_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
