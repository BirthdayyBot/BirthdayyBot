import { BOT_ADMINS } from '../../helpers';

export function isBotAdmin(userId: string): boolean {
	return BOT_ADMINS.includes(userId);
}
