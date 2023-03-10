import { API_URL, AUTOCODE_ENV } from '../../helpers/provide/environment';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import type { BirthdaWithUserModel } from '../../lib/model';
import type { AutocodeAPIResponseModel } from '../model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

export async function removeBirthday(user_id: string, guild_id: string): Promise<AutocodeAPIResponseModel> {
    const request = await lib.chillihero['birthday-api'][AUTOCODE_ENV].birthday.delete({
        user_id: user_id,
        guild_id: guild_id,
    });
    return request;
}

export async function getBirthdaysByGuild(guild_id: string): Promise<Array<BirthdaWithUserModel> | []> {
	type BirthdayListResponse = { amount: number; birthdays: Array<BirthdaWithUserModel> };
	const getBirthdaysUrl = new URL(`${API_URL}birthday/retrieve/entriesByGuild`);
	getBirthdaysUrl.searchParams.append('guild_id', guild_id);
	try {
	    const request = await fetch<BirthdayListResponse>(getBirthdaysUrl, FetchResultTypes.JSON);
	    return request.birthdays;
	} catch (error: any) {
	    if (error.code === 404) {
	        return [];
	    }
	    return [];
	}
}

export async function getBirthdayByGuildAndUser(guild_id: string, user_id: string): Promise<Array<BirthdaWithUserModel> | []> {
	type BirthdayListResponse = Array<BirthdaWithUserModel>;
	const getBirthdayUrl = new URL(`${API_URL}birthday/retrieve/entryByUserAndGuild`);
	getBirthdayUrl.searchParams.append('guild_id', guild_id);
	getBirthdayUrl.searchParams.append('user_id', user_id);
	try {
	    const request = await fetch<BirthdayListResponse>(getBirthdayUrl, FetchResultTypes.JSON);
	    return request;
	} catch (error: any) {
	    console.log('error', error);
	    return [];
	}
}
