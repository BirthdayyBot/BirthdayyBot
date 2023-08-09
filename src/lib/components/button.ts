import { container } from '@sapphire/framework';
import { resolveKey, type Target } from '@sapphire/plugin-i18next';
import { ButtonBuilder, ButtonStyle, ComponentType, OAuth2Scopes } from 'discord.js';
import { BirthdayyEmojis, Permission_Bits } from '../../helpers/provide/environment';

export const WebsiteUrl = (path?: string) => `https://birthdayy.xyz/${path ? `${path}` : ''}`;

export const enum ButtonID {
	voteReminder = 'vote-reminder-button',
	choiceBirthdayList = 'choice-birthday-list',
	choiceGuildConfig = 'choice-guild-config',
	choiceDiscordInformation = 'choice-discord-information',
}

export function defaultButtonBuilder(data?: import('discord.js').ButtonComponentData) {
	return new ButtonBuilder({
		style: ButtonStyle.Link,
		type: ComponentType.Button,
		disabled: false,
		...data,
	});
}

export async function inviteSupportDicordButton(target: Target) {
	return defaultButtonBuilder()
		.setLabel(await resolveKey(target, 'button.supportDiscord'))
		.setURL(WebsiteUrl('discord'))
		.setEmoji(BirthdayyEmojis.People);
}

export async function docsButtonBuilder(target: Target) {
	return defaultButtonBuilder()
		.setLabel(await resolveKey(target, 'button.docsBirthday'))
		.setURL(WebsiteUrl('docs'))
		.setEmoji(BirthdayyEmojis.Book);
}

export async function inviteBirthdayyButton(target: Target) {
	return defaultButtonBuilder()
		.setLabel(await resolveKey(target, 'button.inviteBithdayy'))
		.setURL(
			container.client.generateInvite({
				scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
				permissions: Permission_Bits,
			}),
		)
		.setEmoji(BirthdayyEmojis.Gift);
}

export async function remindMeButtonBuilder(target: Target) {
	return defaultButtonBuilder()
		.setLabel(await resolveKey(target, 'button.remindeMe'))
		.setCustomId(ButtonID.voteReminder)
		.setEmoji(BirthdayyEmojis.Alarm);
}

export async function remindMeButtonDisabledBuilder(target: Target) {
	return (await remindMeButtonBuilder(target)).setDisabled(true);
}

export async function websiteButtonBuiler(target: Target) {
	return defaultButtonBuilder()
		.setLabel(await resolveKey(target, 'button.supportDiscord'))
		.setEmoji(BirthdayyEmojis.Link)
		.setURL(WebsiteUrl());
}

export async function birthdayListButtonBuilder(target: Target) {
	return defaultButtonBuilder()
		.setStyle(ButtonStyle.Secondary)
		.setLabel(await resolveKey(target, 'button.birthdayyList'))
		.setEmoji(BirthdayyEmojis.Cake)
		.setCustomId(ButtonID.choiceBirthdayList);
}

export async function guildConfigButtonBuilder(target: Target) {
	return defaultButtonBuilder()
		.setStyle(ButtonStyle.Secondary)
		.setLabel(await resolveKey(target, 'button.guildConfig'))
		.setEmoji(BirthdayyEmojis.Tools)
		.setCustomId(ButtonID.choiceGuildConfig);
}

export async function discordInformationButtonBuilder(target: Target) {
	return defaultButtonBuilder()
		.setStyle(ButtonStyle.Secondary)
		.setLabel(await resolveKey(target, 'button.discordInfo'))
		.setEmoji(BirthdayyEmojis.Support)
		.setCustomId(ButtonID.choiceDiscordInformation);
}
