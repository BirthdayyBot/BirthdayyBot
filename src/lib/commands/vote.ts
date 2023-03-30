import { ApplicationCommandType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';

export async function VoteCMD(): Promise<ChatInputApplicationCommandData> {
	return {
		name: 'vote',
		description: 'Vote for Birthdayy <3',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: true,
		options: [],
	};
}
