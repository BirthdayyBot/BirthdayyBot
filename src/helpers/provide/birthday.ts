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
