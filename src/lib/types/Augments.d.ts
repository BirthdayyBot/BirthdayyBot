import type { Sequelize } from 'sequelize';

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			// ENVIRONMENT
			NODE_ENV: 'development' | 'production';
			APP_ENV: 'dev' | 'tst' | 'prd';
			DEBUG: 'TRUE' | 'FALSE';

			// API
			API_URL: string;
			API_BASE_URL: string;
			API_SECRET: string;
			API_EXTENSION: string;
			API_PORT: string;

			// BOT
			CLIENT_ID: string;
			BOT_OWNER: string;
			BOT_NAME: string;
			BOT_AVATAR: string;
			BOT_COLOR: string;

			// TOKEN
			DISCORD_TOKEN: string;
			TOPGG_TOKEN: string;
			DISCORDLIST_TOKEN: string;
			DISCORDBOTLIST_TOKEN: string;
			WEBHOOK_SECRET: string;

			// DATABASE
			DB_NAME: string;
			DB_USERNAME: string;
			DB_HOST: string;
			DB_PASSWORD: string;

			// REDIS
			REDIS_PORT: number;
			REDIS_HOST: string;
			REDIS_PASSWORD: string;
			REDIS_DB: number;

			MAX_BIRTHDAYS_PER_SITE: string;
			STDLIB_SECRET_TOKEN: string;
			AUTOCODE_ENV: 'dev' | 'release';
			CUSTOM_BOT: 'TRUE' | 'FALSE' | 'true' | 'false' | '1' | '0' | 'yes' | 'no' | 'y' | 'n';
		}
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		db: Sequelize;
	}
}
