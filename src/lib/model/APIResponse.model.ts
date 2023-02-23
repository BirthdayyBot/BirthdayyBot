export type APIResponseModel = {
	success: boolean;
	code: number;
	message: string;
	data: {
		guild_id: string;
		birthday_role?: string;
		birthday_ping_role?: string;
		announcement_channel?: string;
		announcement_message?: string;
		overview_channel?: string;
		overview_message?: string;
		log_channel?: string;
		timezone?: string;
	};
};
