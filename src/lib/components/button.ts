import { Emojis } from '#utils/constants';
import { resolveKey, type Target } from '@sapphire/plugin-i18next';
import { ButtonBuilder, ButtonStyle, ComponentType, type ButtonComponentData } from 'discord.js';

export const WebsiteUrl = (path?: string) => `https://birthdayy.xyz/${path ? `${path}` : ''}`;

export const enum ButtonID {
	voteReminder = 'vote-reminder-button',
	choiceBirthdayList = 'choice-birthday-list',
	choiceGuildConfig = 'choice-guild-config',
	choiceDiscordInformation = 'choice-discord-information'
}

export function defaultButtonBuilder(data?: ButtonComponentData) {
	return new ButtonBuilder({
		style: ButtonStyle.Link,
		type: ComponentType.Button,
		disabled: false,
		...data
	});
}

export async function inviteSupportDiscordButton(target: Target) {
	const label = await resolveKey(target, 'button:supportDiscord');
	return defaultButtonBuilder().setLabel(label).setURL(WebsiteUrl('discord')).setEmoji(Emojis.People);
}

export async function docsButtonBuilder(target: Target) {
	const label = await resolveKey(target, 'button:docsBirthday');
	return defaultButtonBuilder().setLabel(label).setURL(WebsiteUrl('docs')).setEmoji(Emojis.Book);
}

export async function remindMeButtonBuilder(target: Target) {
	const label = await resolveKey(target, 'button:remindeMe');
	return defaultButtonBuilder().setLabel(label).setCustomId(ButtonID.voteReminder).setEmoji(Emojis.Alarm);
}

export async function remindMeButtonDisabledBuilder(target: Target) {
	return (await remindMeButtonBuilder(target)).setDisabled(true);
}
