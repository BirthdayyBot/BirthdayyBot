import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { API_SECRET, API_URL, AUTOCODE_ENV } from './environment';
import type { AutocodeAPIResponseModel } from '../../lib/model/AutocodeAPIResponseModel.model';
import { container } from '@sapphire/framework';
import type { Prisma } from '@prisma/client';
import type { ConfigName } from '../utils/string';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

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
			[config_name]: null,
		},
	});
}

export async function setDefaultConfigs(guild_id: string) {
	return container.prisma.guild.update({
		where: {
			guild_id: guild_id,
		},
		data: {
			birthday_role: 'null',
			birthday_ping_role: 'null',
			announcement_channel: 'null',
			overview_channel: 'null',
			log_channel: 'null',
			overview_message: 'null',
			timezone: parseInt('UTC'),
			announcement_message: '',
		},
	});
}

export async function setDefaultConfig(config_name: ConfigName, guild_id: string) {
	let reset;
	switch (config_name) {
	case 'announcement_channel':
		reset = await setANNOUNCEMENT_CHANNEL('null', guild_id);
		break;
	case 'overview_channel':
		reset = await setOVERVIEW_CHANNEL('null', guild_id);
		break;
	case 'log_channel':
		reset = await setLOG_CHANNEL('null', guild_id);
		break;
	case 'announcement_message':
		reset = await setANNOUNCEMENT_MESSAGE('DEFAULT', guild_id); // TODO: check how to set this to default
		break;
	case 'overview_message':
		reset = await setOVERVIEW_MESSAGE('null', guild_id);
		break;
	case 'timezone':
		reset = await setTIMEZONE('0', guild_id);
		break;
	case 'birthday_role':
		reset = await setBIRTHDAY_ROLE('null', guild_id);
		break;
	case 'birthday_ping_role':
		reset = await setBIRTHDAY_PING_ROLE('null', guild_id);
		break;
	default:
		container.logger.info('config not defined: ', config_name);
		break;
	}
	return reset;
}

export async function setBIRTHDAY_ROLE(role_id: string, guild_id: string): Promise<AutocodeAPIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.birthday_role({
		guild_id: guild_id,
		birthday_role: role_id,
	});
	return result;
}

export async function setBIRTHDAY_PING_ROLE(role_id: string, guild_id: string): Promise<AutocodeAPIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.birthday_ping_role({
		guild_id: guild_id,
		birthday_ping_role: role_id,
	});
	return result;
}

export async function setANNOUNCEMENT_CHANNEL(channel_id: string, guild_id: string): Promise<AutocodeAPIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.announcement_channel({
		guild_id: guild_id,
		announcement_channel: channel_id,
	});
	return result;
}

export async function setANNOUNCEMENT_MESSAGE(announcement_message: string, guild_id: string): Promise<AutocodeAPIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.announcement_message({
		guild_id: guild_id,
		announcement_message: announcement_message,
	});
	return result;
}

export async function setOVERVIEW_CHANNEL(channel_id: string, guild_id: string): Promise<AutocodeAPIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.overview_channel({
		guild_id: guild_id,
		overview_channel: channel_id,
	});
	return result;
}

export async function setLOG_CHANNEL(channel_id: string, guild_id: string): Promise<AutocodeAPIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.log_channel({
		guild_id: guild_id,
		log_channel: channel_id,
	});
	return result;
}

export async function setOVERVIEW_MESSAGE(message_id: string, guild_id: string): Promise<AutocodeAPIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.overview_message({
		guild_id: guild_id,
		overview_message: message_id,
	});
	return result;
}

export async function setTIMEZONE(timezone: string, guild_id: string): Promise<AutocodeAPIResponseModel> {
	const tz = parseInt(timezone);
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.timezone({
		guild_id: guild_id,
		utc_offset: tz,
	});
	return result;
}

// export async function setBulkConfig(guild_id, config) {
//   return await setCompleteConfig(config, guild_id);
// }

export function logAll(config: any) {
	container.logger.debug('⩱⁼===============================⩱');
	if (config.GUILD_ID !== null) container.logger.debug('GUILD_ID: ', config.GUILD_ID);
	if (config.BIRTHDAY_ROLE !== null) container.logger.debug('BIRTHDAY_ROLE: ', config.BIRTHDAY_ROLE);
	if (config.BIRTHDAY_PING_ROLE !== null) container.logger.debug('BIRTHDAY_PING_ROLE: ', config.BIRTHDAY_PING_ROLE);
	if (config.ANNOUNCEMENT_CHANNEL !== null) container.logger.debug('ANNOUNCEMENT_CHANNEL: ', config.ANNOUNCEMENT_CHANNEL);
	if (config.OVERVIEW_CHANNEL !== null) container.logger.debug('OVERVIEW_CHANNEL: ', config.OVERVIEW_CHANNEL);
	if (config.LOG_CHANNEL !== null) container.logger.debug('LOG_CHANNEL: ', config.LOG_CHANNEL);
	if (config.OVERVIEW_MESSAGE !== null) container.logger.debug('OVERVIEW_MESSAGE: ', config.OVERVIEW_MESSAGE);
	if (config.TIMEZONE !== null) container.logger.debug('TIMEZONE: ', config.TIMEZONE);
	if (config.ANNOUNCEMENT_MESSAGE !== null) container.logger.debug('ANNOUNCEMENT_MESSAGE: ', config.ANNOUNCEMENT_MESSAGE);
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
