export type BirthdayWithUserModel = {
	id: number;
	user_id: string;
	birthday: string;
	username?: string;
	discriminator?: string;
	guild_id: string;
};
