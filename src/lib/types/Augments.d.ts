import type { PrismaClient } from '@prisma/client';
import type { ArrayString, BooleanString, IntegerString, NumberString } from '@skyra/env-utilities';

import { GuildMemberFetchQueue } from '#lib/discord/GuildMemberFetchQueue';
import { AnalyticsData } from '#lib/structures/AnalyticsData';
import 'discord.js';

import type { Events } from './Enums.js';

declare module 'discord.js' {
	interface Client {
		readonly analytics: AnalyticsData | null;
		computeGuilds(): Promise<number>;
		computeUsers(): Promise<number>;
		readonly dev: boolean;
		readonly guildMemberFetchQueue: GuildMemberFetchQueue;
		readonly webhookError: WebhookClient | null;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		prisma: PrismaClient;
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		Administrator: never;
		BotOwner: never;
		Everyone: never;
		GuildPremium: never;
		Manager: never;
		Moderator: never;
		RoleHigher: never;
		ServerOwner: never;
	}

	interface SapphireClient {
		emit(event: Events.Error, error: Error): boolean;
		emit(event: Events.PostStatsSuccess): boolean;
		emit(event: string | symbol, ...args: any[]): boolean;
	}
}

declare module '@skyra/env-utilities' {
	export interface Env {
		API_ENABLED: BooleanString;
		API_ORIGIN: string;
		API_PORT: IntegerString;
		API_PREFIX: string;
		APP_ENV: 'dev' | 'prd' | 'tst';
		BIRTHDAY_COMMAND_ID: string;
		CLIENT_COLOR: NumberString;
		CLIENT_ID: string;
		CLIENT_MAIN_GUILD: string;
		CLIENT_NAME: string;
		CLIENT_OWNERS: ArrayString;
		CLIENT_PRESENCE_NAME: string;
		CLIENT_PRESENCE_TYPE: string;
		CLIENT_VERSION: string;
		CONFIG_COMMAND_ID: string;
		CUSTOM_BOT: BooleanString;
		DATABASE_URL: string;
		DEBUG: BooleanString;
		DISCORD_BOT_LIST_TOKEN: string;
		DISCORD_LIST_GG_TOKEN: string;
		DISCORD_TOKEN: string;
		INFLUX_ENABLED: BooleanString;
		INFLUX_ORG: string;
		INFLUX_ORG_ANALYTICS_BUCKET: string;
		INFLUX_TOKEN: string;
		INFLUX_URL: string;
		LOG_CHANNEL_ADMIN: string;
		OAUTH_COOKIE: string;
		OAUTH_DOMAIN_OVERWRITE: string;
		OAUTH_REDIRECT_URI: string;
		OAUTH_SCOPE: ArrayString;
		OAUTH_SECRET: string;
		PRISMA_DEBUG_LOGS: BooleanString;
		REDIS_DB: IntegerString;
		REDIS_HOST: string;
		REDIS_PASSWORD: string;
		REDIS_PORT: NumberString;
		REDIS_TLS: BooleanString;
		REDIS_USERNAME: string;
		SENTRY_URL: string;
		TOP_GG_TOKEN: string;
		TOPGG_WEBHOOK_SECRET: string;
		WEBHOOK_ERROR_ID: string;
		WEBHOOK_ERROR_TOKEN: string;
	}
}
