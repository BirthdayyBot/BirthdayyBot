import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';

export async function ConfigCMD(): Promise<ChatInputApplicationCommandData> {
	return {
		name: 'config',
		type: ApplicationCommandType.ChatInput,
		description: 'Configure your Server configurations. - MANAGER ONLY',
		defaultMemberPermissions: [PermissionFlagsBits.ManageRoles],
		dmPermission: false,
		options: [
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'list',
				description: 'Get a overview over your current server configurations',
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'announcement-channel',
				description: 'Announce if its somebody\'s birthday today',
				options: [
					{
						type: ApplicationCommandOptionType.Channel,
						name: 'channel',
						description: 'Channel where the announcement should get sent',
						required: true,
					},
				],
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'overview-channel',
				description: 'List all Birthdays on the Server in that channel and updates it on changes',
				options: [
					{
						type: ApplicationCommandOptionType.Channel,
						name: 'channel',
						description: 'Channel where the overview should get sent and updated in',
						required: true,
					},
				],
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'birthday-role',
				description: 'Give the birthday child a special role for one day. Gets assigned and removed automatically',
				options: [
					{
						type: ApplicationCommandOptionType.Role,
						name: 'role',
						description: 'Role that should get assigned on a birthday',
						required: true,
					},
				],
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'ping-role',
				description: 'Ping a role on someones birthday',
				options: [
					{
						type: ApplicationCommandOptionType.Role,
						name: 'role',
						description: 'Role that should get pinged on someones birthday',
						required: true,
					},
				],
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'timezone',
				description: 'Change the Timezone when Birthdayy wishes Happy Birthday.',
				options: [
					{
						type: ApplicationCommandOptionType.String,
						name: 'timezone',
						description: 'The Timezone of your Discord server',
						choices: [
							{
								name: 'Greenwich Mean Time | GMT | UTC',
								value: '0',
							},
							{
								name: 'European Central Time | ECT | UTC+1:00',
								value: '1',
							},
							{
								name: 'Eastern European Time | EET | UTC+2:00',
								value: '2',
							},
							{
								name: 'Eastern African Time | EAT | UTC+3:00',
								value: '3',
							},
							{
								name: 'Near East Time | NET | UTC+4:00',
								value: '4',
							},
							{
								name: 'Pakistan Lahore Time | PLT | UTC+5:00',
								value: '5',
							},
							{
								name: 'Bangladesh Standard Time | BST | UTC+6:00',
								value: '6',
							},
							{
								name: 'Vietnam Standard Time | VST | UTC+7:00',
								value: '7',
							},
							{
								name: 'China Taiwan Time | CTT | UTC+8:00',
								value: '8',
							},
							{
								name: 'Japan Standard Time | JST | UTC+9:00',
								value: '9',
							},
							{
								name: 'Australia Eastern Time | AET | UTC+10:00',
								value: '10',
							},
							{
								name: 'Solomon Standard Time | SST | UTC+11:00',
								value: '11',
							},
							{
								name: 'New Zealand Standard Time | NST | UTC+12:00',
								value: '12',
							},
							{
								name: 'Midway Islands Time | MIT | UTC-11:00',
								value: '-11',
							},
							{
								name: 'Hawaii Standard Time | HST | UTC-10:00',
								value: '-10',
							},
							{
								name: 'Alaska Standard Time | AST | UTC-9:00',
								value: '-9',
							},
							{
								name: 'Pacific Standard Time | PST | UTC-8:00',
								value: '-8',
							},
							{
								name: 'Phoenix Standard Time | PNT | UTC-7:00',
								value: '-7',
							},
							{
								name: 'Central Standard Time | CST | UTC-6:00',
								value: '-6',
							},
							{
								name: 'Eastern Standard Time | EST | UTC-5:00',
								value: '-5',
							},
							{
								name: 'Puerto Rico and US Virgin Islands Time | PRT | UTC-4:00',
								value: '-4',
							},
							{
								name: 'Brazil Eastern Time | BET | UTC-2:00',
								value: '-2',
							},
						],
						required: true,
					},
				],
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'announcement-message',
				description: 'Add a custom birthday announcement message.',
				options: [
					{
						type: ApplicationCommandOptionType.String,
						name: 'message',
						description: '{MENTION}, {USERNAME}, {DISCRIMINATOR}, {LINE_BREAK}, {SERVERNAME}',
						required: true,
					},
				],
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'reset',
				description: 'Reset settings from your server config',
				options: [
					{
						type: ApplicationCommandOptionType.String,
						name: 'config',
						description: 'Config that you want to remove',
						choices: [
							{
								name: 'Announcement Channel',
								value: 'announcement_channel',
							},
							{
								name: 'Overview Channel',
								value: 'overview_channel',
							},
							{
								name: 'Birthday Role',
								value: 'birthday_role',
							},
							{
								name: 'Ping Role',
								value: 'birthday_ping_role',
							},
							{
								name: 'Announcement Message',
								value: 'announcement_message',
							},
							// {
							// 	name: 'Logs',
							// 	value: 'logs'
							// }
						],
						required: true,
					},
				],
			},
			// {
			// 	type: ApplicationCommandOptionType.Subcommand,
			// 	name: 'logs',
			// 	description: 'Log all birthday events (adding, updating, removal etc.) in a Channel. (recommended)',
			// 	options: [
			// 		{
			// 			type: ApplicationCommandOptionType.Channel,
			// 			name: 'channel',
			// 			description: 'Channel where the logs shold get sent',
			// 			required: true
			// 		}
			// 	]
			// }
		],
	};
}
