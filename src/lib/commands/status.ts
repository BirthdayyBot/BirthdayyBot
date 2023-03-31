import { ApplicationCommandType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';

export async function StatusCMD(): Promise<ChatInputApplicationCommandData> {
	return {
		name: 'status',
		description: 'Status Command',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: false,
	};
}
