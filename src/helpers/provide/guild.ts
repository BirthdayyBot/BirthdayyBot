import { API_URL } from './environment';
import { fetch, FetchResultTypes } from '@sapphire/fetch';

export async function leaveGuild(guild_id: string) {
	const requestURL = new URL(`${API_URL}/guild/leave`);
	requestURL.searchParams.append('guild_id', guild_id);
	const leaveGuildRequest = await fetch<FetchResultTypes.JSON>(requestURL, FetchResultTypes.JSON);
	console.log(leaveGuildRequest);
}

export async function isGuildDisabled(guild_id: string): Promise<boolean> {
	const requestURL = new URL(`${API_URL}/guild/retrieve/is-disabled`);
	requestURL.searchParams.append('guild_id', guild_id);
	const isGuildDisabledRequest = await fetch<FetchResultTypes.JSON>(requestURL, FetchResultTypes.JSON);
	console.log(isGuildDisabledRequest);
	const { is_disabled } = isGuildDisabledRequest as unknown as { is_disabled: boolean };
	console.log('is_disabled', is_disabled);
	return is_disabled!;
}
