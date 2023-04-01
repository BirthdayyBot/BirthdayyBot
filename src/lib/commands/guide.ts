import { ApplicationCommandType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';

export function GuideCMD(): ChatInputApplicationCommandData {
	return {
		name: 'guide',
		description: "Need a quick setup Guide! Don't worry, this will help you!",
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: true,
		options: []
	};
}
