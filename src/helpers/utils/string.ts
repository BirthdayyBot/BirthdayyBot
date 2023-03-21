import type { Prisma } from '@prisma/client';
import { container } from '@sapphire/framework';

export function useCorrectDayFormat(number: number | string): string {
	return number.toString().length < 2 ? `0${number}` : `${number}`;
}

export function getConfigName(config: string): string {
	switch (config) {
	case 'birthday_role':
		return 'Birthday Role';
	case 'ping_role':
		return 'Birthday Ping Role';
	case 'announcement_channel':
		return 'Announcement Channel';
	case 'announcement_message':
		return 'Announcement Message';
	case 'overview_channel':
		return 'Overview Channel';
	case 'overview_message':
		return 'Overview Message';
	case 'timezone':
		return 'Timezone';
	case 'log_channel':
		return 'Log Channel';
	case 'language':
		return 'Language';
	default:
		return 'Unknown';
	}
}

export type ConfigName = Exclude<Prisma.GuildScalarFieldEnum, 'disabled' | 'guild_id' | 'inviter' | 'last_updated' | 'premium'>

export const configNameExtended: Record<ConfigName, string> = {
	birthday_role: 'Birthday Role',
	birthday_ping_role: 'Birthday Ping Role',
	announcement_channel: 'Announcement Channel',
	announcement_message: 'Announcement Message',
	overview_channel: 'Overview Channel',
	overview_message: 'Overview Message',
	timezone: 'Timezone',
	log_channel: 'Log Channel',
	language: 'Language',
};

export function checkIfLengthIsTwo(number: string) {
	return number.length < 2 ? `0${number}` : number;
}

export function logLimiter() {
	container.logger.info('===============================');
	return;
}

export function checkLength(length: number, string: string) {
	return string.toString().length === length;
}
