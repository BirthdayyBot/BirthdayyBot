import { ApplicationCommandType, PermissionFlagsBits, type ChatInputApplicationCommandData } from 'discord.js';

export function HelpCMD(): ChatInputApplicationCommandData {
	return {
		name: 'help',
		description: 'Need help with my Commands?',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: true,
	};
}
