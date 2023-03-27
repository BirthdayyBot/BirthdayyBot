import type { Prisma } from '@prisma/client';
import { EmbedLimits } from '@sapphire/discord.js-utilities';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { container } from '@sapphire/framework';
import type { ConfigName } from '../../lib/database';
import { API_SECRET, API_URL } from './environment';

export async function setCompleteConfig(data: Prisma.GuildUpdateInput, guild_id: string) {
	await container.prisma.guild.update({
		where: {
			guild_id: guild_id,
		},
		data,
	});
	container.logger.info('Set config for guild with id ', guild_id);
}

export async function removeConfig(config_name: keyof Prisma.GuildScalarFieldEnum, guild_id: string) {
	return container.prisma.guild.update({
		where: {
			guild_id: guild_id,
		},
		data: {
			[config_name]: undefined,
		},
	});
}

export async function setDefaultConfigs(guild_id: string) {
	return container.prisma.guild.update({
		where: {
			guild_id: guild_id,
		},
		data: {
			birthday_role: undefined,
			birthday_ping_role: undefined,
			announcement_channel: undefined,
			overview_channel: undefined,
			log_channel: undefined,
			overview_message: undefined,
			timezone: undefined,
			announcement_message: undefined,
		},
	});
}

/**
 * Sets the default config value for a specific config name.
 * @param config_name - the config name to set
 * @param guild_id - the guild id to set the config for
 */
export async function setDefaultConfig(config_name: ConfigName, guild_id: string) {
	switch (config_name) {
	case 'announcement_channel':
		await container.utilities.guild.set.AnnouncementChannel(guild_id, null);
		break;
	case 'overview_channel':
		await container.utilities.guild.set.OverviewChannel(guild_id, null);
		break;
	case 'log_channel':
		await container.utilities.guild.set.LogChannel(guild_id, null);
		break;
	case 'announcement_message':
		await container.utilities.guild.set.AnnouncementMessage(guild_id, undefined);
		break;
	case 'overview_message':
		await container.utilities.guild.set.OverviewMessage(guild_id, null);
		break;
	case 'timezone':
		await container.utilities.guild.set.Timezone(guild_id, undefined);
		break;
	case 'birthday_role':
		await container.utilities.guild.set.BirthdayRole(guild_id, null);
		break;
	case 'birthday_ping_role':
		await container.utilities.guild.set.BirthdayPingRole(guild_id, null);
		break;
	default:
		throw new Error(`Unknown config ${config_name}`);
	}
}

export function logAll(config: Prisma.GuildUpdateInput) {
	container.logger.debug('⩱⁼===============================⩱');
	if (config.guild_id !== null) container.logger.debug('GUILD_ID: ', config.guild_id);
	if (config.birthday_role !== null) container.logger.debug('BIRTHDAY_ROLE: ', config.birthday_role);
	if (config.birthday_ping_role !== null) container.logger.debug('BIRTHDAY_PING_ROLE: ', config.birthday_ping_role);
	if (config.announcement_channel !== null) container.logger.debug('ANNOUNCEMENT_CHANNEL: ', config.announcement_channel);
	if (config.overview_channel !== null) container.logger.debug('OVERVIEW_CHANNEL: ', config.overview_channel);
	if (config.log_channel !== null) container.logger.debug('LOG_CHANNEL: ', config.log_channel);
	if (config.overview_message !== null) container.logger.debug('OVERVIEW_MESSAGE: ', config.overview_message);
	if (config.timezone !== null) container.logger.debug('TIMEZONE: ', config.timezone);
	if (config.announcement_message !== null) container.logger.debug('ANNOUNCEMENT_MESSAGE: ', config.announcement_message);
	container.logger.debug('⩲===============================⩲');
	return;
}

export async function getGuildLanguage(guild_id: string): Promise<string> {
	const requestURL = new URL(`${API_URL}guild/retrieve/language`);
	requestURL.searchParams.append('guild_id', guild_id);
	const data = await fetch<{ guild_id: string; language: string }>(
		requestURL,
		{ method: FetchMethods.Get, headers: { Authorization: API_SECRET } },
		FetchResultTypes.JSON,
	);
	return data.language;
}

export async function getGuildPremium(guild_id: string): Promise<boolean> {
	const requestURL = new URL(`${API_URL}guild/retrieve/premium`);
	requestURL.searchParams.append('guild_id', guild_id);
	const data = await fetch<{ guild_id: string; premium: boolean }>(
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
