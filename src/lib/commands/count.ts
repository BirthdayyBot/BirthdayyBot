import { ApplicationCommandType, PermissionFlagsBits, type ChatInputApplicationCommandData } from 'discord.js';

export function CountCMD(): ChatInputApplicationCommandData {
	return {
		name: 'count',
		description: 'The current count of Guilds, Birthdays and Users',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: true,
		options: [],
	};
}
