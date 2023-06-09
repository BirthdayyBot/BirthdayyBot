import type { PrismaClient } from '@prisma/client';
import type { ArrayString, BooleanString, IntegerString, NumberString } from '@skyra/env-utilities';
import type { WebhookClient } from 'discord.js';
import type { Birthday } from '../../utilities/db/Birthday';
import type { Guild } from '../../utilities/db/Guild';
import type { User } from '../../utilities/db/User';

declare module '@skyra/env-utilities' {
	interface Env {
		// Environment
		NODE_ENV: 'development' | 'production';
		APP_ENV: 'dev' | 'tst' | 'prd';
		DEBUG: BooleanString;

		// API
		API_URL: string;
		API_BASE_URL: string;
		API_SECRET: string;
		API_EXTENSION?: string;
		API_PORT: NumberString;

		// Discord
		DISCORD_TOKEN: string;
		CLIENT_ID: string;
		BOT_OWNER: ArrayString;
		BOT_NAME: string;
		BOT_AVATAR: string;
		BOT_COLOR: IntegerString;
		MAX_BIRTHDAYS_PER_SITE: NumberString;
		MAIN_DISCORD: string;

		// Voting
		TOPGG_TOKEN?: string;
		DISCORDLIST_TOKEN?: string;
		DISCORDBOTLIST_TOKEN?: string;
		TOPGG_WEBHOOK_SECRET: string;

		// Database
		DB_NAME: string;
		DB_USERNAME: string;
		DB_PASSWORD: string;
		DB_HOST: string;
		DB_PORT: NumberString;
		DB_URL: string;

		// REDIS
		REDIS_PORT: NumberString;
		REDIS_HOST: string;
		REDIS_PASSWORD: string;
		REDIS_DB: NumberString;
		REDIS_USERNAME: string;

		// Other
		SENTRY_DSN: string;
		CUSTOM_BOT: BooleanString;

		// Logging
		LOG_CHANNEL_ADMIN: string;
		LOG_CHANNEL_SERVER: string;

		// Webhooks
		DISCORD_ERROR_WEBHOOK_ID?: string;
		DISCORD_ERROR_WEBHOOK_TOKEN?: string;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		prisma: PrismaClient;
		webhook: WebhookClient | null;
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		IsPremium: never;
		OwnerOnly: never;
		CanManageRoles: never;
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		BirthdayReminderTask: never;
		BirthdayRoleRemoverTask: never;
		VoteReminderTask: never;
		CleanDatabaseTask: never;
		PostStats: never;
	}
}

declare module '@sapphire/plugin-utilities-store' {
	export interface Utilities {
		guild: Guild;
		birthday: Birthday;
		user: User;
	}
}
