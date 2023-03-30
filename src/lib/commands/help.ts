import { ApplicationCommandType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';

export async function HelpCMD(): Promise<ChatInputApplicationCommandData> {
	return {
		name: 'help',
		description: 'Need help with my Commands?',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: true,
	};
}
