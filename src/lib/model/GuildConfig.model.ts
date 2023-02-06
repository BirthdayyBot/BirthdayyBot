export type GuildConfigModel = {
	GUILD_ID: string;
	BIRTHDAY_ROLE?: string;
	BIRTHDAY_PING_ROLE?: string;
	ANNOUNCEMENT_CHANNEL?: string;
	OVERVIEW_CHANNEL?: string;
	LOG_CHANNEL?: string;
	OVERVIEW_MESSAGE?: any;
	TIMEZONE: number;
	LANGUAGE: string;
	PREMIUM: boolean;
};
