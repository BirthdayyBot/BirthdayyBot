import type { Prisma } from '@prisma/client';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { container } from '@sapphire/framework';
import type { ConfigName } from '../../lib/database';
import { envParseString } from '@skyra/env-utilities';

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
			timezone: undefined,
			announcementMessage: undefined,
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
			await container.utilities.guild.reset.AnnouncementChannel(guildId);
			break;
		case 'overviewChannel':
			await container.utilities.guild.reset.OverviewChannel(guildId);
			break;
		case 'logChannel':
			await container.utilities.guild.reset.LogChannel(guildId);
			break;
		case 'announcementMessage':
			await container.utilities.guild.reset.AnnouncementMessage(guildId);
			break;
		case 'overviewMessage':
			await container.utilities.guild.reset.OverviewMessage(guildId);
			break;
		case 'timezone':
			await container.utilities.guild.reset.Timezone(guildId);
			break;
		case 'birthdayRole':
			await container.utilities.guild.reset.BirthdayRole(guildId);
			break;
		case 'birthdayPingRole':
			await container.utilities.guild.reset.BirthdayPingRole(guildId);
			break;
		default:
			throw new Error(`Unknown config ${config_name}`);
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

export async function getGuildLanguage(guildId: string): Promise<string> {
	const requestURL = new URL(`${envParseString('API_URL')}guild/retrieve/language`);
	requestURL.searchParams.append('guildId', guildId);
	const data = await fetch<{ guildId: string; language: string }>(
		requestURL,
		{ method: FetchMethods.Get, headers: { Authorization: envParseString('API_SECRET') } },
		FetchResultTypes.JSON,
	);
	return data.language;
}

export async function getGuildPremium(guildId: string): Promise<boolean> {
	const requestURL = new URL(`${envParseString('API_URL')}guild/retrieve/premium`);
	requestURL.searchParams.append('guildId', guildId);
	const data = await fetch<{ guildId: string; premium: boolean }>(
		requestURL,
		{ method: FetchMethods.Get, headers: { Authorization: envParseString('API_SECRET') } },
		FetchResultTypes.JSON,
	);
	return data.premium;
}
