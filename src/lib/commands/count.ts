import { ApplicationCommandType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';

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
