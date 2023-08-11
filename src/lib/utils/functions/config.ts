import type { ConfigName } from '#lib/database';
import { DEFAULT_ANNOUNCEMENT_MESSAGE } from '#lib/utils/environment';
import type { Prisma } from '@prisma/client';
import { container } from '@sapphire/framework';

export async function setCompleteConfig(data: Prisma.GuildUpdateInput, guildId: string) {
	await container.prisma.guild.update({
		where: {
			guildId,
		},
		data,
	});
	container.logger.info('Set config for guild with id ', guildId);
}

export async function removeConfig(config_name: keyof Prisma.GuildScalarFieldEnum, guildId: string) {
	return container.prisma.guild.update({
		where: {
			guildId,
		},
		data: {
			[config_name]: undefined,
		},
	});
}

export async function setDefaultConfigs(guildId: string) {
	return container.prisma.guild.update({
		where: {
			guildId,
		},
		data: {
			birthdayRole: null,
			birthdayPingRole: null,
			announcementChannel: null,
			overviewChannel: null,
			logChannel: null,
			overviewMessage: null,
			timezone: 0,
			announcementMessage: {
				set: DEFAULT_ANNOUNCEMENT_MESSAGE,
			},
		},
	});
}

/**
 * Sets the default config value for a specific config name.
 * @param config_name - the config name to set
 * @param guildId - the guild id to set the config for
 */
export async function setDefaultConfig(config_name: ConfigName, guildId: string) {
	switch (config_name) {
		case 'announcementChannel':
			return container.utilities.guild.reset.AnnouncementChannel(guildId);
		case 'overviewChannel':
			return container.utilities.guild.reset.OverviewChannel(guildId);
		case 'logChannel':
			return container.utilities.guild.reset.LogChannel(guildId);
		case 'announcementMessage':
			return container.utilities.guild.reset.AnnouncementMessage(guildId);
		case 'overviewMessage':
			return container.utilities.guild.reset.OverviewMessage(guildId);
		case 'timezone':
			return container.utilities.guild.reset.Timezone(guildId);
		case 'birthdayRole':
			return container.utilities.guild.reset.BirthdayRole(guildId);
		case 'birthdayPingRole':
			return container.utilities.guild.reset.BirthdayPingRole(guildId);
	}
}

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
