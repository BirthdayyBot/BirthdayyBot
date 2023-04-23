export interface BirthdayEventInfoModel {
	userId: string;
	guildId: string;
	error?: string;
	message?: string;
	announcement?: string | { sent: boolean; message: string };
	birthday_role?: string | { added: boolean; message: string };
}
