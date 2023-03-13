declare global {
	namespace NodeJS {
		interface ProcessEnv {
			API_BASE_URL: string;
			API_EXTENSION: string;
			API_PORT: string;
			API_SECRET: string;
			API_URL: string;
			APP_ENV: 'dev' | 'tst' | 'prd';
			AUTOCODE_ENV: 'dev' | 'release';
			BOT_AVATAR: string;
			BOT_COLOR: string;
			BOT_NAME: string;
			BOT_OWNER: string;
			CLIENT_ID: string;
			CUSTOM_BOT: 'TRUE' | 'FALSE' | 'true' | 'false' | '1' | '0' | 'yes' | 'no' | 'y' | 'n';
			DB_HOST: string;
			DB_NAME: string;
			DB_PASSWORD: string;
			DB_USERNAME: string;
			DEBUG: 'TRUE' | 'FALSE';
			DISCORD_TOKEN: string;
			DISCORDLIST_TOKEN: string;
			DISCORDBOTLIST_TOKEN: string;
			MAX_BIRTHDAYS_PER_SITE: string;
			NODE_ENV: 'development' | 'production';
			REDIS_DB: string;
			REDIS_HOST: string;
			REDIS_PASSWORD: string;
			REDIS_PORT: string;
			STDLIB_SECRET_TOKEN: string;
			TOPGG_TOKEN: string;
			WEBHOOK_SECRET: string;
		}
	}
}

export {};
