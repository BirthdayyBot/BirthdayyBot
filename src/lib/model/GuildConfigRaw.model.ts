export type GuildConfigRawModel = {
	guild_id: string;
	birthday_role?: string;
	birthday_ping_role?: string;
	announcement_channel?: string;
	announcement_message: string; //TODO: #13 change to announcement_message once DP is deployed
	overview_channel?: string;
	log_channel?: string;
	overview_message?: any;
	timezone: number;
	language: string;
	premium: number;
};
