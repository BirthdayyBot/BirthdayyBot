import { ApplicationCommandType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';

export function SupportCMD(): ChatInputApplicationCommandData {
	return {
		name: 'support',
		description: 'Need help? Join my Support Discord Server!',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: true,
		options: [],
	};
}
