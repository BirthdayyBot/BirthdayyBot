const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { API_URL, AUTOCODE_ENV } from './environment';
import type { APIResponseModel } from '../../lib/model/APIResponse.model';
import type { GuildConfigModel, GuildConfigRawModel } from '../../lib/model';

//  ! Autocode implementation, will be deprecated in favor of the fetch implementation
export async function getACConfig(guild_id: string): Promise<GuildConfigModel> {
	const req = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.retrieve.byGuild({
		guild_id: guild_id
	});
	return {
		GUILD_ID: req.result.guild_id,
		BIRTHDAY_ROLE: req.result.birthday_role,
		BIRTHDAY_PING_ROLE: req.result.birthday_ping_role,
		ANNOUNCEMENT_CHANNEL: req.result.announcement_channel,
		ANNOUNCEMENT_MESSAGE: req.result.birthday_message,
		OVERVIEW_CHANNEL: req.result.overview_channel,
		LOG_CHANNEL: req.result.log_channel,
		OVERVIEW_MESSAGE: req.result.overview_message,
		TIMEZONE: req.result.timezone,
		LANGUAGE: req.result.language,
		PREMIUM: req.result.premium === 1 ? true : false
	};
}

export async function getConfig(guild_id: string): Promise<GuildConfigModel> {
	const requestURL = new URL(`${API_URL}config/retrieve/byGuild`);
	requestURL.searchParams.append('guild_id', guild_id);
	const result = await fetch<GuildConfigRawModel>(requestURL, FetchResultTypes.JSON);
	return {
		GUILD_ID: result.guild_id,
		ANNOUNCEMENT_CHANNEL: result.announcement_channel,
		ANNOUNCEMENT_MESSAGE: result.announcement_message,
		OVERVIEW_CHANNEL: result.overview_channel,
		OVERVIEW_MESSAGE: result.overview_message,
		BIRTHDAY_ROLE: result.birthday_role,
		BIRTHDAY_PING_ROLE: result.birthday_ping_role,
		LOG_CHANNEL: result.log_channel,
		TIMEZONE: result.timezone,
		LANGUAGE: result.language,
		PREMIUM: result.premium === 1 ? true : false
	};
}

export async function setCompleteConfig(config: any, guild_id: string) {
	const {
		BIRTHDAY_ROLE,
		BIRTHDAY_PING_ROLE,
		ANNOUNCEMENT_CHANNEL,
		ANNOUNCEMENT_MESSAGE,
		OVERVIEW_CHANNEL,
		LOG_CHANNEL,
		OVERVIEW_MESSAGE,
		TIMEZONE
	} = config;
	if (BIRTHDAY_ROLE !== 'null') {
		await setBIRTHDAY_ROLE(BIRTHDAY_ROLE, guild_id);
	}
	if (BIRTHDAY_PING_ROLE !== 'null') {
		await setBIRTHDAY_PING_ROLE(BIRTHDAY_PING_ROLE, guild_id);
	}
	if (ANNOUNCEMENT_CHANNEL !== 'null') {
		await setANNOUNCEMENT_CHANNEL(ANNOUNCEMENT_CHANNEL, guild_id);
	}
	if (ANNOUNCEMENT_MESSAGE !== 'null') {
		await setANNOUNCEMENT_MESSAGE(ANNOUNCEMENT_MESSAGE, guild_id);
	}
	if (OVERVIEW_CHANNEL !== 'null') {
		await setOVERVIEW_CHANNEL(OVERVIEW_CHANNEL, guild_id);
	}
	if (LOG_CHANNEL !== 'null') {
		console.log('logchannel not null');
		await setLOG_CHANNEL(LOG_CHANNEL, guild_id);
	}
	if (OVERVIEW_MESSAGE !== 'null') {
		await setOVERVIEW_MESSAGE(OVERVIEW_MESSAGE, guild_id);
	}
	if (TIMEZONE !== 'null') {
		await setTIMEZONE(TIMEZONE, guild_id);
	}
	console.log('Set config for guild with id ', guild_id);
}

export async function removeConfig(config_name: string, guild_id: string) {
	switch (config_name) {
		case 'birthday_role':
			await setBIRTHDAY_ROLE('null', guild_id);
			break;
		case 'birthday_ping_role':
			await setBIRTHDAY_PING_ROLE('null', guild_id);
			break;
		case 'announcement_channel':
			await setANNOUNCEMENT_CHANNEL('null', guild_id);
			break;
		case 'overview_channel':
			await setOVERVIEW_CHANNEL('null', guild_id);
			break;
		case 'log_channel':
			await setLOG_CHANNEL('null', guild_id);
			break;
		case 'overview_message':
			await setOVERVIEW_MESSAGE('null', guild_id);
			break;
		case 'timezone':
			await setTIMEZONE('null', guild_id);
			break;
		case 'announcement_message':
			await setANNOUNCEMENT_MESSAGE('null', guild_id);
			break;
		default:
			console.log('config not defined: ', config_name);
			return false;
	}
	return true;
}

export async function setDefaultConfigs(guild_id: string) {
	//TODO #12 Adjust default configs
	const config = {
		BIRTHDAY_ROLE: 'null',
		BIRTHDAY_PING_ROLE: 'null',
		ANNOUNCEMENT_CHANNEL: 'null',
		OVERVIEW_CHANNEL: 'null',
		LOG_CHANNEL: 'null',
		OVERVIEW_MESSAGE: 'null',
		TIMEZONE: 'UTC'
	};
	await setCompleteConfig(config, guild_id);
}

export async function setDefaultConfig(config_name: string, guild_id: string) {
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
			reset = await setANNOUNCEMENT_MESSAGE('DEFAULT', guild_id); //TODO: check how to set this to default
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
		case 'ping_role':
			reset = await setBIRTHDAY_PING_ROLE('null', guild_id);
			break;
		default:
			console.log('config not defined: ', config_name);
			break;
	}
	return reset;
}

export async function setBIRTHDAY_ROLE(role_id: string, guild_id: string): Promise<APIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.birthday_role({
		guild_id: guild_id,
		birthday_role: role_id
	});
	return result;
}

export async function setBIRTHDAY_PING_ROLE(role_id: string, guild_id: string): Promise<APIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.birthday_ping_role({
		guild_id: guild_id,
		birthday_ping_role: role_id
	});
	return result;
}

export async function setANNOUNCEMENT_CHANNEL(channel_id: string, guild_id: string): Promise<APIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.announcement_channel({
		guild_id: guild_id,
		announcement_channel: channel_id
	});
	return result;
}

export async function setANNOUNCEMENT_MESSAGE(announcement_message: string, guild_id: string): Promise<APIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.announcement_message({
		guild_id: guild_id,
		announcement_message: announcement_message
	});
	return result;
}

export async function setOVERVIEW_CHANNEL(channel_id: string, guild_id: string): Promise<APIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.overview_channel({
		guild_id: guild_id,
		overview_channel: channel_id
	});
	return result;
}

export async function setLOG_CHANNEL(channel_id: string, guild_id: string): Promise<APIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.log_channel({
		guild_id: guild_id,
		log_channel: channel_id
	});
	return result;
}

export async function setOVERVIEW_MESSAGE(message_id: string, guild_id: string): Promise<APIResponseModel> {
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.overview_message({
		guild_id: guild_id,
		overview_message: message_id
	});
	return result;
}

export async function setTIMEZONE(timezone: string, guild_id: string): Promise<APIResponseModel> {
	const tz = parseInt(timezone);
	const result = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.config.update.timezone({
		guild_id: guild_id,
		utc_offset: tz
	});
	return result;
}

// export async function setBulkConfig(guild_id, config) {
//   return await setCompleteConfig(config, guild_id);
// }

export function logAll(config: any) {
	console.log('===============================');
	if (config.GUILD_ID !== null) console.log('GUILD_ID: ', config.GUILD_ID);
	if (config.BIRTHDAY_ROLE !== null) console.log('BIRTHDAY_ROLE: ', config.BIRTHDAY_ROLE);
	if (config.BIRTHDAY_PING_ROLE !== null) console.log('BIRTHDAY_PING_ROLE: ', config.BIRTHDAY_PING_ROLE);
	if (config.ANNOUNCEMENT_CHANNEL !== null) console.log('ANNOUNCEMENT_CHANNEL: ', config.ANNOUNCEMENT_CHANNEL);
	if (config.OVERVIEW_CHANNEL !== null) console.log('OVERVIEW_CHANNEL: ', config.OVERVIEW_CHANNEL);
	if (config.LOG_CHANNEL !== null) console.log('LOG_CHANNEL: ', config.LOG_CHANNEL);
	if (config.OVERVIEW_MESSAGE !== null) console.log('OVERVIEW_MESSAGE: ', config.OVERVIEW_MESSAGE);
	if (config.TIMEZONE !== null) console.log('TIMEZONE: ', config.TIMEZONE);
	if (config.ANNOUNCEMENT_MESSAGE !== null) console.log('ANNOUNCEMENT_MESSAGE: ', config.ANNOUNCEMENT_MESSAGE);
	console.log('===============================');
	return;
}

export async function getGuildLanguage(guild_id: string): Promise<string> {
	const requestURL = new URL(`${API_URL}guild/retrieve/language`);
	requestURL.searchParams.append('guild_id', guild_id);
	const data = await fetch<{ guild_id: string; language: string }>(requestURL, FetchResultTypes.JSON);
	return data.language;
}

export async function getGuildPremium(guild_id: string): Promise<boolean> {
	const requestURL = new URL(`${API_URL}guild/retrieve/premium`);
	requestURL.searchParams.append('guild_id', guild_id);
	const data = await fetch<{ guild_id: string; premium: boolean }>(requestURL, FetchResultTypes.JSON);
	return data.premium;
}

/**
    const {
      BIRTHDAY_ANNOUNCEMENT_CHANNEL,
      BIRTHDAY_ROLE,
      BIRTHDAY_OVERVIEW_CHANNEL,
      BIRTHDAY_LOG_CHANNEL,
      BIRTHDAY_PING_ROLE,
      TIMEZONE,
      ANNOUNCEMENT_MESSAGE
    } = config;
 */
/**
     let size = Object.keys(config).length;
    let names = Object.getOwnPropertyNames(config);
 */
