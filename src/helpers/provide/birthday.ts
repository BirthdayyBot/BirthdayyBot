import { fetch, FetchResultTypes } from '@sapphire/fetch';

export async function getBirthdaysByGuild(guild_id: string): Promise<Array<BirthdaWithUserModel> | []> {
	type BirthdayListResponse = Array<BirthdaWithUserModel>;
	const getBirthdaysUrl = new URL(`${process.env.API_URL}/birthday/retrieve/entriesByGuild`);
	getBirthdaysUrl.searchParams.append('guild_id', guild_id);
	try {
		const request = await fetch<BirthdayListResponse>(getBirthdaysUrl, FetchResultTypes.JSON);
		return request;
	} catch (error: any) {
		if (error.code === 404) {
			return [];
		}
		return [];
	}
}

export async function getBirthdayByGuildAndUser(guild_id: string, user_id: string): Promise<Array<BirthdaWithUserModel> | []> {
	type BirthdayListResponse = Array<BirthdaWithUserModel>;
	const getBirthdayUrl = new URL(`${process.env.API_URL}/birthday/retrieve/entryByUserAndGuild`);
	getBirthdayUrl.searchParams.append('guild_id', guild_id);
	getBirthdayUrl.searchParams.append('user_id', user_id);
	try {
		const request = await fetch<BirthdayListResponse>(getBirthdayUrl, FetchResultTypes.JSON);
		return request;
	} catch (error: any) {
		if (error.code === 404) {
			return [];
		}
		return [];
	}
}
