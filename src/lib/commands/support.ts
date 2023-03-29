import { ApplicationCommandType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';

export async function SupportCMD(): Promise<ChatInputApplicationCommandData> {
	return {
		name: 'support',
		description: 'Need help? Join my Support Discord Server!',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: true,
		options: [],
	};
}
