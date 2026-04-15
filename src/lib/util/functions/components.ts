import { container } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import {
	type APIActionRowComponent,
	type APIButtonComponent,
	ButtonStyle,
	ComponentType,
	OAuth2Scopes,
	PermissionFlagsBits
} from 'discord.js';

export function getActionRow(...components: APIButtonComponent[]): APIActionRowComponent<APIButtonComponent> {
	return { type: ComponentType.ActionRow, components };
}

export function getSupportComponent(label: string): APIButtonComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Link,
		emoji: { name: '🆘' },
		url: 'https://discord.gg/Bs9bSVe2Hf',
		label
	};
}

export function getInviteComponent(label: string): APIButtonComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Link,
		emoji: { name: '🎉' },
		url: getInvite(),
		label
	};
}

export function getGitHubComponent(label: string): APIButtonComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Link,
		emoji: { name: 'github2', id: '1229375525827645590' },
		url: 'https://github.com/BirthdayyBot/BirthdayyBot',
		label
	};
}

export function getPremiumComponent(label: string): APIButtonComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Link,
		emoji: { name: '🧡' },
		url: 'https://birthdayy.xyz/premium',
		label
	};
}

export function getDocumentationComponent(label: string): APIButtonComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Link,
		emoji: { name: '📚' },
		url: 'https://docs.birthdayy.xyz/',
		label
	};
}

export function getWebsiteComponent(label: string): APIButtonComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Link,
		emoji: { name: '🎂' },
		url: 'https://birthdayy.xyz/',
		label
	};
}

export const remindMeComponentCustomId = 'vote-reminder-button';

export function getRemindMeComponent(t: TFunction): APIButtonComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Primary,
		custom_id: remindMeComponentCustomId,
		emoji: { name: '⏰' },
		label: t('button:remindMe')
	};
}

export function getRemindMeDisabledComponent(t: TFunction): APIButtonComponent {
	return {
		...getRemindMeComponent(t),
		disabled: true
	};
}

function getInvite() {
	return container.client.generateInvite({
		scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
		permissions:
			PermissionFlagsBits.AddReactions |
			PermissionFlagsBits.AttachFiles |
			PermissionFlagsBits.EmbedLinks |
			PermissionFlagsBits.ManageRoles |
			PermissionFlagsBits.SendMessages |
			PermissionFlagsBits.SendMessagesInThreads |
			PermissionFlagsBits.UseExternalEmojis |
			PermissionFlagsBits.ViewChannel
	});
}
