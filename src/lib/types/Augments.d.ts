import type { PrismaClient } from '@prisma/client';
import type { WebhookClient } from 'discord.js';
import type { Birthday } from '../../utilities/db/Birthday';
import type { Guild } from '../../utilities/db/Guild';

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			// Environment
			NODE_ENV: 'development' | 'production';
			APP_ENV: 'dev' | 'tst' | 'prd';
			DEBUG: 'TRUE' | 'FALSE';

			// API
			API_URL: string;
			API_BASE_URL: string;
			API_SECRET: string;
			API_EXTENSION: string;
			API_PORT: string;

			// Discord
			DISCORD_TOKEN: string;
			CLIENT_ID: string;
			BOT_OWNER: string;
			BOT_NAME: string;
			BOT_AVATAR: string;
			BOT_COLOR: string;
			TOPGG_TOKEN: string;
			DISCORDLIST_TOKEN: string;
			DISCORDBOTLIST_TOKEN: string;
			MAX_BIRTHDAYS_PER_SITE: string;
			WEBHOOK_SECRET: string;

			// Database
			DB_NAME: string;
			DB_USER: string;
			DB_PASSWORD: string;
			DB_HOST: string;
			DB_PORT: string;
			DB_URL: string;

			// REDIS
			REDIS_PORT: string;
			REDIS_HOST: string;
			REDIS_PASSWORD: string;
			REDIS_DB: string;
			REDIS_USERNAME: string;

			// Other
			SENTRY_DSN: string;
			STDLIB_SECRET_TOKEN: string;
			AUTOCODE_ENV: 'dev' | 'release';
			CUSTOM_BOT: 'TRUE' | 'FALSE' | 'true' | 'false' | '1' | '0' | 'yes' | 'no' | 'y' | 'n';

			// Logging
			LOG_CHANNEL_ADMIN: string;
			LOG_CHANNEL_SERVER: string;

			// Webhooks
			WEBHOOK_ID?: string;
			WEBHOOK_TOKEN?: string;
		}
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
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		BirthdayReminderTask: never;
		BirthdayRoleRemoverTask: never;
		VoteReminderTask: never;
		CleanDatabaseTask: never;
	}
}

declare module '@sapphire/plugin-utilities-store' {
	export interface Utilities {
		guild: Guild;
		birthday: Birthday;
	}
}
