import { API_SECRET, API_URL } from './environment';
import { fetch, FetchResultTypes } from '@sapphire/fetch';

export async function leaveGuildRequest(guild_id: string) {
	const requestURL = new URL(`${API_URL}guild/leave`);
	requestURL.searchParams.append('guild_id', guild_id);
	const leaveGuildRequest = await fetch<FetchResultTypes.JSON>(requestURL, FetchResultTypes.JSON);
	console.log(leaveGuildRequest);
}

export async function isGuildDisabledRequest(guild_id: string): Promise<boolean> {
	const requestURL = new URL(`${API_URL}guild/retrieve/is-disabled`);
	requestURL.searchParams.append('guild_id', guild_id);
	const isGuildDisabled = await fetch<FetchResultTypes.JSON>(requestURL, FetchResultTypes.JSON);
	console.log(isGuildDisabled);
	const { is_disabled } = isGuildDisabled as unknown as { is_disabled: boolean };
	return is_disabled!;
}

export async function enableGuildRequest(guild_id: string) {
	const requestURL = new URL(`${API_URL}guild/enable`);
	requestURL.searchParams.append('guild_id', guild_id);
	const enableGuildRequest = await fetch<FetchResultTypes.JSON>(
		requestURL,
		{ method: 'POST', headers: { Authorization: API_SECRET } },
		FetchResultTypes.JSON
	);
	console.log(enableGuildRequest);
	return enableGuildRequest;
}

export async function createGuildRequest(guild_id: string, inviter: string | null) {
	const requestURL = new URL(`${API_URL}guild/create`);
	requestURL.searchParams.append('guild_id', guild_id);
	requestURL.searchParams.append('inviter', `${inviter}`);
	const createGuildRequest = await fetch<FetchResultTypes.JSON>(
		requestURL,
		{ method: 'POST', headers: { Authorization: API_SECRET } },
		FetchResultTypes.JSON
	);
	console.log(createGuildRequest);
	return createGuildRequest;
}
