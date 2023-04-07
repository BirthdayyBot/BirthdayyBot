export interface BirthdayEventInfoModel {
	userId: string;
	guildId: string;
	error: string;
	announcement?: { sent: boolean; message: string };
	birthday_role?: { added: boolean; message: string };
}
