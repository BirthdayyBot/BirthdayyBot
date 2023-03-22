import type { PrismaClient } from '@prisma/client';
import type { Guild } from '../../utilities/db/Guild';
import type { Birthday } from '../../utilities/db/Birthday';

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
			DB_URL: string;

			// REDIS
			REDIS_PORT: number;
			REDIS_HOST: string;
			REDIS_PASSWORD: string;
			REDIS_DB: number;

			// Other
			SENTRY_URL: string;
			STDLIB_SECRET_TOKEN: string;
			AUTOCODE_ENV: 'dev' | 'release';
			CUSTOM_BOT: 'TRUE' | 'FALSE' | 'true' | 'false' | '1' | '0' | 'yes' | 'no' | 'y' | 'n';
		}
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		prisma: PrismaClient;
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
	}
}

declare module '@sapphire/plugin-utilities-store' {
	export interface Utilities {
		guild: Guild;
		birthday: Birthday;
	}
}