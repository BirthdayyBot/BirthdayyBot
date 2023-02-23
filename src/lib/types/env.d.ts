declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production';
			APP_ENV: 'dev' | 'stg' | 'prd';
			DEBUG: 'TRUE' | 'FALSE';
			API_URL: string;
			DISCORD_TOKEN: string;
			CLIENT_ID: string;
			BOT_OWNER: string;
			MAIN_DISCORD: string;
			BOT_NAME: string;
			BOT_AVATAR: string;
			BOT_COLOR: string;
			TOPGG_TOKEN: string;
			DISCORDLIST_TOKEN: string;
			DISCORDBOTLIST_TOKEN: string;
			MAX_BIRTHDAYS_PER_SITE: string;
			DB_NAME: string;
			DB_USERNAME: string;
			DB_HOST: string;
			DB_PASSWORD: string;
			STDLIB_SECRET_TOKEN: string;
			AUTOCODE_ENV: 'dev' | 'release';
			CUSTOM_BOT: 'TRUE' | 'FALSE' | 'true' | 'false' | '1' | '0' | 'yes' | 'no' | 'y' | 'n';
		}
	}
}

export {};
