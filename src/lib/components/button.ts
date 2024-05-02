import { Emojis } from '#lib/utils/constants';
import { Permission_Bits } from '#utils/environment';
import { container } from '@sapphire/framework';
import { resolveKey, type Target } from '@sapphire/plugin-i18next';
import { ButtonBuilder, ButtonStyle, ComponentType, OAuth2Scopes, type ButtonComponentData } from 'discord.js';

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

export async function inviteSupportDicordButton(target: Target) {
	const label = await resolveKey(target, 'button:supportDiscord');
	return defaultButtonBuilder().setLabel(label).setURL(WebsiteUrl('discord')).setEmoji(Emojis.People);
}

export async function docsButtonBuilder(target: Target) {
	const label = await resolveKey(target, 'button:docsBirthday');
	return defaultButtonBuilder().setLabel(label).setURL(WebsiteUrl('docs')).setEmoji(Emojis.Book);
}

export async function inviteBirthdayyButton(target: Target) {
	const label = await resolveKey(target, 'button:inviteBithdayy');
	return defaultButtonBuilder()
		.setLabel(label)
		.setURL(
			container.client.generateInvite({
				scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
				permissions: Permission_Bits
			})
		)
		.setEmoji(Emojis.Gift);
}

export async function remindMeButtonBuilder(target: Target) {
	const label = await resolveKey(target, 'button:remindeMe');
	return defaultButtonBuilder().setLabel(label).setCustomId(ButtonID.voteReminder).setEmoji(Emojis.Alarm);
}

export async function remindMeButtonDisabledBuilder(target: Target) {
	return (await remindMeButtonBuilder(target)).setDisabled(true);
}

export async function websiteButtonBuiler(target: Target) {
	const label = await resolveKey(target, 'button:website');
	return defaultButtonBuilder().setLabel(label).setEmoji(Emojis.Link).setURL(WebsiteUrl());
}

export async function birthdayListButtonBuilder(target: Target) {
	const label = await resolveKey(target, 'button:birthdayyList');
	return defaultButtonBuilder()
		.setStyle(ButtonStyle.Secondary)
		.setLabel(label)
		.setEmoji(Emojis.Cake)
		.setCustomId(ButtonID.choiceBirthdayList);
}

export async function guildConfigButtonBuilder(target: Target) {
	const label = await resolveKey(target, 'button:guildConfig');
	return defaultButtonBuilder()
		.setStyle(ButtonStyle.Secondary)
		.setLabel(label)
		.setEmoji(Emojis.Tools)
		.setCustomId(ButtonID.choiceGuildConfig);
}

export async function discordInformationButtonBuilder(target: Target) {
	const label = await resolveKey(target, 'button:discordInfo');
	return defaultButtonBuilder()
		.setStyle(ButtonStyle.Secondary)
		.setLabel(label)
		.setEmoji(Emojis.Support)
		.setCustomId(ButtonID.choiceDiscordInformation);
}
