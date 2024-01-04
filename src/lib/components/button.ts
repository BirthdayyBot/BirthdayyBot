import { CustomButtonIdEnum } from '#lib/enum/CustomButtonId.enum';
import { DISCORD_INVITE, DOCS_URL, BIRTHDAYY_INVITE, WEBSITE_URL } from '#root/helpers/provide/environment';
import { ButtonStyle, ComponentType, type APIButtonComponent } from 'discord.js';

export const discordButton: APIButtonComponent = {
	type: ComponentType.Button,
	style: ButtonStyle.Link,
	label: 'Support Discord',
	url: `${DISCORD_INVITE}`,
	disabled: false,
	emoji: {
		id: '931267038574432308',
		name: 'people',
		animated: false
	}
};

export const docsButton: APIButtonComponent = {
	type: ComponentType.Button,
	style: ButtonStyle.Link,
	label: 'Docs',
	url: `${DOCS_URL}`,
	disabled: false,
	emoji: {
		id: '931267038662504508',
		name: 'book',
		animated: false
	}
};

export const inviteButton: APIButtonComponent = {
	type: ComponentType.Button,
	style: ButtonStyle.Link,
	label: 'Invite Birthdayy',
	url: `${BIRTHDAYY_INVITE}`,
	disabled: false,
	emoji: {
		id: '931267039094534175',
		name: 'gift',
		animated: false
	}
};

export const remindMeButton: APIButtonComponent = {
	type: ComponentType.Button,
	style: ButtonStyle.Success,
	label: '⏰ Remind Me in 12hrs',
	custom_id: CustomButtonIdEnum.VOTE_REMINDER,
	disabled: false
};

export const remindMeButtonDisabled: APIButtonComponent = {
	...remindMeButton,
	disabled: true
};

export const websiteButton: APIButtonComponent = {
	type: ComponentType.Button,
	style: ButtonStyle.Link,
	label: 'Website',
	url: `${WEBSITE_URL}`,
	disabled: false,
	emoji: {
		id: '931267039019020340',
		name: 'link',
		animated: false
	}
};

export const birthdayListChoice: APIButtonComponent = {
	type: ComponentType.Button,
	style: ButtonStyle.Secondary,
	label: 'Birthday List',
	custom_id: CustomButtonIdEnum.CHOICE_BIRTHDAY_LIST,
	disabled: false,
	emoji: {
		name: '🎂'
	}
};

export const guildConfigChoice: APIButtonComponent = {
	type: ComponentType.Button,
	style: ButtonStyle.Secondary,
	label: 'Guild Config',
	custom_id: CustomButtonIdEnum.CHOICE_GUILD_CONFIG,
	disabled: false,
	emoji: {
		name: '⚙️'
	}
};

export const discordInformationChoice: APIButtonComponent = {
	type: ComponentType.Button,
	style: ButtonStyle.Secondary,
	label: 'Discord Information',
	custom_id: CustomButtonIdEnum.CHOICE_DISCORD_INFORMATION,
	disabled: false,
	emoji: {
		name: 'ℹ️'
	}
};
