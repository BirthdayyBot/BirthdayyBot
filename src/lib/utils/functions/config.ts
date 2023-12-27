import type { Prisma } from '@prisma/client';
import { container } from '@sapphire/framework';

export function logAll(config: Prisma.GuildUpdateInput) {
	container.logger.debug('⩱⁼===============================⩱');
	if (config.guildId !== null) container.logger.debug('GUILD_ID: ', config.guildId);
	if (config.birthdayRole !== null) container.logger.debug('BIRTHDAY_ROLE: ', config.birthdayRole);
	if (config.birthdayPingRole !== null) container.logger.debug('BIRTHDAY_PING_ROLE: ', config.birthdayPingRole);
	if (config.announcementChannel !== null)
		container.logger.debug('ANNOUNCEMENT_CHANNEL: ', config.announcementChannel);
	if (config.overviewChannel !== null) container.logger.debug('OVERVIEW_CHANNEL: ', config.overviewChannel);
	if (config.logChannel !== null) container.logger.debug('LOG_CHANNEL: ', config.logChannel);
	if (config.overviewMessage !== null) container.logger.debug('OVERVIEW_MESSAGE: ', config.overviewMessage);
	if (config.timezone !== null) container.logger.debug('TIMEZONE: ', config.timezone);
	if (config.announcementMessage !== null)
		container.logger.debug('ANNOUNCEMENT_MESSAGE: ', config.announcementMessage);
	container.logger.debug('⩲===============================⩲');
}
