import { isAdmin } from '#utils/functions/permissions';
import { Time } from '@sapphire/cron';
import { createFunctionPrecondition } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ApiRequest, HttpCodes, LoginData, type ApiResponse } from '@sapphire/plugin-api';
import { RateLimitManager } from '@sapphire/ratelimits';
import { sleep } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import { PermissionFlagsBits, RESTAPIPartialCurrentUserGuild } from 'discord-api-types/v10';
import { Client, Guild, GuildMember, PermissionsBitField } from 'discord.js';
import { flattenGuild } from './ApiTransformers.js';
import type { OauthFlattenedGuild, PartialOauthFlattenedGuild, TransformedLoginData } from './types.js';

export const authenticated = (token = envParseString('API_SECRET')) =>
	createFunctionPrecondition(
		(request: ApiRequest) => Boolean(request.auth?.token) ?? request.headers.authorization === token,
		(_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized),
	);

/**
 * @param time The amount of milliseconds for the ratelimits from this manager to expire.
 * @param limit The amount of times a {@link RateLimit} can drip before it's limited.
 * @param auth Whether or not this should be auth-limited
 */
export function ratelimit(time: number, limit = 1, auth = false) {
	const manager = new RateLimitManager(time, limit);
	const xRateLimitLimit = time;
	return createFunctionPrecondition(
		(request: ApiRequest, response: ApiResponse) => {
			const id = (
				auth ? request.auth!.id : request.headers['x-forwarded-for'] || request.socket.remoteAddress
			) as string;
			const bucket = manager.acquire(id);

			response.setHeader('Date', new Date().toUTCString());
			if (bucket.limited) {
				response.setHeader('Retry-After', bucket.remainingTime.toString());
				return false;
			}

			try {
				bucket.consume();
			} catch {}

			response.setHeader('X-RateLimit-Limit', xRateLimitLimit);
			response.setHeader('X-RateLimit-Remaining', bucket.remaining.toString());
			response.setHeader('X-RateLimit-Reset', bucket.remainingTime.toString());

			return true;
		},
		(_request: ApiRequest, response: ApiResponse) => {
			response.error(HttpCodes.TooManyRequests);
		},
	);
}

export async function canManage(guild: Guild, member: GuildMember): Promise<boolean> {
	await sleep(Time.Second * 3);
	if (guild.ownerId === member.id) return true;
	return isAdmin(member);
}

async function getManageable(
	id: string,
	oauthGuild: RESTAPIPartialCurrentUserGuild,
	guild: Guild | undefined,
): Promise<boolean> {
	if (oauthGuild.owner) return true;
	if (typeof guild === 'undefined')
		return new PermissionsBitField(BigInt(oauthGuild.permissions)).has(PermissionFlagsBits.ManageGuild);

	const member = await guild.members.fetch(id).catch(() => null);
	if (!member) return false;

	return canManage(guild, member);
}

async function transformGuild(
	client: Client,
	userId: string,
	data: RESTAPIPartialCurrentUserGuild,
): Promise<OauthFlattenedGuild> {
	const guild = client.guilds.cache.get(data.id);
	const serialized: PartialOauthFlattenedGuild =
		typeof guild === 'undefined'
			? {
					afkChannelId: null,
					afkTimeout: 0,
					applicationId: null,
					approximateMemberCount: null,
					approximatePresenceCount: null,
					available: true,
					banner: null,
					channels: [],
					defaultMessageNotifications: 'ONLY_MENTIONS',
					description: null,
					widgetEnabled: false,
					explicitContentFilter: 'DISABLED',
					icon: data.icon,
					id: data.id,
					joinedTimestamp: null,
					mfaLevel: 'NONE',
					name: data.name,
					ownerId: data.owner ? userId : null,
					partnered: false,
					preferredLocale: 'en-US',
					premiumSubscriptionCount: null,
					premiumTier: 'NONE',
					roles: [],
					splash: null,
					systemChannelId: null,
					vanityURLCode: null,
					verificationLevel: 'NONE',
					verified: false,
				}
			: flattenGuild(guild);

	return {
		...serialized,
		permissions: data.permissions,
		manageable: await getManageable(userId, data, guild),
		botIsIn: typeof guild !== 'undefined',
	};
}

export async function transformOauthGuildsAndUser({ user, guilds }: LoginData): Promise<TransformedLoginData> {
	if (!user || !guilds) return { user, guilds };

	const { client } = container;
	const userId = user.id;

	const transformedGuilds = await Promise.all(guilds.map((guild) => transformGuild(client, userId, guild)));
	return { user, transformedGuilds };
}
