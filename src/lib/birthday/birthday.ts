import { API_SECRET, API_URL, AUTOCODE_ENV, DEBUG } from '../../helpers/provide/environment';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import type { BirthdayWithUserModel } from '../../lib/model';
import type { AutocodeAPIResponseModel } from '../model';
import { container } from '@sapphire/framework';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

export async function registerBirthday(date: string, guild_id: string, user: { user_id: string; username?: string; discriminator?: string }) {
	type BirthdayRegisterResponse = {
		success: boolean;
		error?: {
			code: string;
			message: string;
		};
	};
	const registerBirthdayUrl = new URL(`${API_URL}birthday/create`);
	registerBirthdayUrl.searchParams.append('guild_id', guild_id);
	registerBirthdayUrl.searchParams.append('user_id', user.user_id);
	registerBirthdayUrl.searchParams.append('date', date);
	if (user.username) registerBirthdayUrl.searchParams.append('username', user.username);
	if (user.discriminator) registerBirthdayUrl.searchParams.append('discriminator', user.discriminator);
	const request = await fetch<BirthdayRegisterResponse>(
		registerBirthdayUrl,
		{ method: FetchMethods.Post, headers: { Authorization: API_SECRET } },
		FetchResultTypes.JSON,
	);
	if (DEBUG && request.success) container.logger.debug(`Registered birthday for user ${user.user_id} in guild ${guild_id}`);
	return request;
}

export async function removeBirthday(user_id: string, guild_id: string): Promise<AutocodeAPIResponseModel> {
	const request = await lib.chillihero['birthday-api'][AUTOCODE_ENV].birthday.delete({
		user_id: user_id,
		guild_id: guild_id,
	});
	container.logger.debug(DEBUG ? `Removed birthday for user ${user_id} in guild ${guild_id}` : '');
	return request;
}

export async function getBirthdaysByGuild(guild_id: string): Promise<Array<BirthdayWithUserModel> | []> {
	type BirthdaysByGuildResponse = { amount: number; birthdays: Array<BirthdayWithUserModel> };
	const getBirthdaysUrl = new URL(`${API_URL}birthday/retrieve/entriesByGuild`);
	getBirthdaysUrl.searchParams.append('guild_id', guild_id);
	try {
		const request = await fetch<BirthdaysByGuildResponse>(
			getBirthdaysUrl,
			{ method: FetchMethods.Get, headers: { Authorization: API_SECRET } },
			FetchResultTypes.JSON,
		);
		return request.birthdays;
	} catch (error: any) {
		if (error.code === 404) {
			return [];
		}
		return [];
	}
}

export async function getBirthdayByGuildAndUser(guild_id: string, user_id: string): Promise<Array<BirthdayWithUserModel> | []> {
	type BirthdaysByGuildResponse = Array<BirthdayWithUserModel>;
	const getBirthdayUrl = new URL(`${API_URL}birthday/retrieve/entryByUserAndGuild`);
	getBirthdayUrl.searchParams.append('guild_id', guild_id);
	getBirthdayUrl.searchParams.append('user_id', user_id);
	try {
		const request = await fetch<BirthdaysByGuildResponse>(
			getBirthdayUrl,
			{ method: FetchMethods.Get, headers: { Authorization: API_SECRET } },
			FetchResultTypes.JSON,
		);
		return request;
	} catch (error: any) {
		container.logger.error('[getBirthdayByGuildAndUser] ', error.message);
		return [];
	}
}

export async function getBirthdaysByDateAndTimezone(
	date: string,
	timezone: string,
): Promise<{ amount: number; birthdays: Array<BirthdayWithUserModel> | [] }> {
	const getBirthdaysUrl = new URL(`${API_URL}birthday/retrieve/byDateAndTimezone`);
	getBirthdaysUrl.searchParams.append('date', date);
	getBirthdaysUrl.searchParams.append('timezone', timezone);
	return fetch<{ amount: number; birthdays: Array<BirthdayWithUserModel> }>(
		getBirthdaysUrl,
		{ method: FetchMethods.Get, headers: { Authorization: API_SECRET } },
		FetchResultTypes.JSON,
	)
		.then((response) => {
			return response;
		})
		.catch((error) => {
			container.logger.error('[getBirthdaysByDateAndTimezone] ', error.message);
			return { amount: 0, birthdays: [] };
		});
}
