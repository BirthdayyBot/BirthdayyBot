import { BOT_ADMINS } from '#root/helpers/provide/environment';

export function isBotAdmin(userId: string): boolean {
	return BOT_ADMINS.includes(userId);
}
