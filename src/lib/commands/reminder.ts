import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	PermissionFlagsBits,
	type ChatInputApplicationCommandData,
} from 'discord.js';

export function ReminderCMD(): ChatInputApplicationCommandData {
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
