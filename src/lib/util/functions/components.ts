import { container } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import {
	type APIActionRowComponent,
	type APIMessageActionRowComponent,
	ButtonStyle,
	ComponentType,
	OAuth2Scopes,
	PermissionFlagsBits
} from 'discord.js';

export function getActionRow(
	...components: APIMessageActionRowComponent[]
): APIActionRowComponent<APIMessageActionRowComponent> {
	return { type: ComponentType.ActionRow, components };
}

export function getSupportComponent(label: string): APIMessageActionRowComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Link,
		emoji: { name: '🆘' },
		url: 'https://discord.gg/Bs9bSVe2Hf',
		label
	};
}

export function getInviteComponent(label: string): APIMessageActionRowComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Link,
		emoji: { name: '🎉' },
		url: getInvite(),
		label
	};
}

export function getGitHubComponent(label: string): APIMessageActionRowComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Link,
		emoji: { name: 'github2', id: '1229375525827645590' },
		url: 'https://github.com/BirthdayyBot/BirthdayyBot',
		label
	};
}

export function getPremiumComponent(label: string): APIMessageActionRowComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Link,
		emoji: { name: '🧡' },
		url: 'https://birthdayy.xyz/premium',
		label
	};
}

export function getDocumentationComponent(label: string): APIMessageActionRowComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Link,
		emoji: { name: '📚' },
		url: 'https://docs.birthdayy.xyz/',
		label
	};
}

export function getWebsiteComponent(label: string): APIMessageActionRowComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Link,
		emoji: { name: '🎂' },
		url: 'https://birthdayy.xyz/',
		label
	};
}

export function getRemindMeComponent(t: TFunction): APIMessageActionRowComponent {
	return {
		type: ComponentType.Button,
		style: ButtonStyle.Primary,
		custom_id: 'vote-reminder-button',
		emoji: { name: '⏰' },
		label: t('button:remindMe')
	};
}

export function getRemindMeDisabledComponent(t: TFunction): APIMessageActionRowComponent {
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
