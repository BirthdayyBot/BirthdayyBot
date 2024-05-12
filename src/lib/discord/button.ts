import { container } from '@sapphire/framework';
import {
	type APIMessageActionRowComponent,
	type APIActionRowComponent,
	ComponentType,
	ButtonStyle,
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
