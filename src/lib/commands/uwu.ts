import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	PermissionFlagsBits,
	type ChatInputApplicationCommandData,
} from 'discord.js';

export function UwUCMD(): ChatInputApplicationCommandData {
	return {
		name: 'uwu',
		description: 'UwU Command',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: false,
		options: [
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'once',
				description: 'Send one uwu',
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'times',
				description: 'Send multiple uwus',
				options: [
					{
						type: ApplicationCommandOptionType.Integer,
						name: 'times',
						description: 'How many UwUs to send',
					},
				],
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'random',
				description: 'Random added fields',
				options: [
					{
						type: ApplicationCommandOptionType.User,
						name: 'user',
						description: 'Send a UwU to a user',
						required: true,
					},
				],
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'fetch',
				description: 'Fetch a user',
			},
		],
	};
}
