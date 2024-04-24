import { Emojis } from '#lib/utils/constants';
import { type Target, resolveKey } from '@sapphire/plugin-i18next';
import { ButtonBuilder } from 'discord.js';

export const WebsiteUrl = (path?: string) => `https://birthdayy.xyz/${path ? `${path}` : ''}`;

export const enum ButtonID {
	voteReminder = 'vote-reminder-button'
}

export async function remindMeButtonBuilder(target: Target) {
	const label = await resolveKey(target, 'button:remindeMe');
	return new ButtonBuilder().setLabel(label).setCustomId(ButtonID.voteReminder).setEmoji(Emojis.Alarm);
}
