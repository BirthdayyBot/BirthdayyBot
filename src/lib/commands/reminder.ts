import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';

export async function ReminderCMD(): Promise<ChatInputApplicationCommandData> {
	return {
		name: 'reminder',
		description: 'Reminder Command',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: false,
		options: [
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'test',
				description: 'its a test',
			},
		],
	};
}
