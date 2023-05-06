import { ApplicationCommandType, PermissionFlagsBits, type ChatInputApplicationCommandData } from 'discord.js';

export function StatsCMD(): ChatInputApplicationCommandData {
	return {
		name: 'stats',
		description: 'Status Command',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: false,
	};
}
