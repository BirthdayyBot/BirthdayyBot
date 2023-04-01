import type { Prisma } from '@prisma/client';
import { EmbedLimits } from '@sapphire/discord.js-utilities';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { container } from '@sapphire/framework';
import type { ConfigName } from '../../lib/database';
import { API_SECRET, API_URL } from './environment';

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
		await container.utilities.guild.set.AnnouncementChannel(guildId, null);
		break;
	case 'overviewChannel':
		await container.utilities.guild.set.OverviewChannel(guildId, null);
		break;
	case 'logChannel':
		await container.utilities.guild.set.LogChannel(guildId, null);
		break;
	case 'announcementMessage':
		await container.utilities.guild.set.AnnouncementMessage(guildId, undefined);
		break;
	case 'overviewMessage':
		await container.utilities.guild.set.OverviewMessage(guildId, null);
		break;
	case 'timezone':
		await container.utilities.guild.set.Timezone(guildId, undefined);
		break;
	case 'birthdayRole':
		await container.utilities.guild.set.BirthdayRole(guildId, null);
		break;
	case 'birthdayPingRole':
		await container.utilities.guild.set.BirthdayPingRole(guildId, null);
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
	if (config.announcementChannel !== null) container.logger.debug('ANNOUNCEMENT_CHANNEL: ', config.announcementChannel);
	if (config.overviewChannel !== null) container.logger.debug('OVERVIEW_CHANNEL: ', config.overviewChannel);
	if (config.logChannel !== null) container.logger.debug('LOG_CHANNEL: ', config.logChannel);
	if (config.overviewMessage !== null) container.logger.debug('OVERVIEW_MESSAGE: ', config.overviewMessage);
	if (config.timezone !== null) container.logger.debug('TIMEZONE: ', config.timezone);
	if (config.announcementMessage !== null) container.logger.debug('ANNOUNCEMENT_MESSAGE: ', config.announcementMessage);
	container.logger.debug('⩲===============================⩲');
	return;
}

export async function getGuildLanguage(guildId: string): Promise<string> {
	const requestURL = new URL(`${API_URL}guild/retrieve/language`);
	requestURL.searchParams.append('guildId', guildId);
	const data = await fetch<{ guildId: string; language: string }>(
		requestURL,
		{ method: FetchMethods.Get, headers: { Authorization: API_SECRET } },
		FetchResultTypes.JSON,
	);
	return data.language;
}

export async function getGuildPremium(guildId: string): Promise<boolean> {
	const requestURL = new URL(`${API_URL}guild/retrieve/premium`);
	requestURL.searchParams.append('guildId', guildId);
	const data = await fetch<{ guildId: string; premium: boolean }>(
		requestURL,
		{ method: FetchMethods.Get, headers: { Authorization: API_SECRET } },
		FetchResultTypes.JSON,
	);
	return data.premium;
}

/**
 * Checks if the given message is a valid birthday message.
 * @param message - The message to check.
 * @returns The validity of the message.
 */
export function isValidBirthdayMessage(message: string): { valid: boolean; error?: string } {
	// * If this feature is not premium only, enable the following line
	// if (message.match(/<a?:[a-zA-Z0-9_]+:[0-9]+>/g)) {
	// 	return {
	// 		valid: false,
	// 		error: 'NO_CUSTOM_EMOJIS',
	// 	};
	// }

	if (message.length > EmbedLimits.MaximumDescriptionLength - 500) {
		return {
			valid: false,
			error: 'MESSAGE_TOO_LONG',
		};
	}

	return { valid: true };
}
