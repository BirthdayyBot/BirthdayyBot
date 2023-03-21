import { ApplicationCommandOptionType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';
import { getLocalizedString } from '../../helpers/utils/translate';

export async function BirthdayCMD(): Promise<ChatInputApplicationCommandData> {
	return {
		// https://discord.js.org/#/docs/discord.js/v13/typedef/ApplicationCommandData
		name: await getLocalizedString('en-US', 'commands/birthday:name'),
		nameLocalizations: {
			de: await getLocalizedString('de-DE', 'commands/birthday:name'),
		},
		description: await getLocalizedString('en-US', 'commands/birthday:description'),
		descriptionLocalizations: {
			de: await getLocalizedString('de-DE', 'commands/birthday:description'),
		},
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: false,
		options: [
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: await getLocalizedString('en-US', 'commands/birthday:subcommand.register.name'),
				nameLocalizations: {
					de: await getLocalizedString('de-DE', 'commands/birthday:subcommand.register.name'),
				},
				description: await getLocalizedString('en-US', 'commands/birthday:subcommand.register.description'),
				descriptionLocalizations: {
					de: await getLocalizedString('de-DE', 'commands/birthday:subcommand.register.descriptionde'),
				},
				options: [
					// https://discord.js.org/#/docs/discord.js/v13/typedef/ApplicationCommandOptionData
					{
						type: ApplicationCommandOptionType.Integer,
						name: 'day',
						description: 'Day of birthday',
						required: true,
						min_value: 1,
						max_value: 31,
					},
					{
						type: ApplicationCommandOptionType.String,
						name: 'month',
						description: 'Month of birthday',
						choices: [
							{
								name: 'January',
								value: '01',
							},
							{
								name: 'February',
								value: '02',
							},
							{
								name: 'March',
								value: '03',
							},
							{
								name: 'April',
								value: '04',
							},
							{
								name: 'May',
								value: '05',
							},
							{
								name: 'June',
								value: '06',
							},
							{
								name: 'July',
								value: '07',
							},
							{
								name: 'August',
								value: '08',
							},
							{
								name: 'September',
								value: '09',
							},
							{
								name: 'October',
								value: '10',
							},
							{
								name: 'November',
								value: '11',
							},
							{
								name: 'December',
								value: '12',
							},
						],
						required: true,
					},
					{
						type: ApplicationCommandOptionType.Integer,
						name: 'year',
						description: 'Year of birthday',
					},
					{
						type: ApplicationCommandOptionType.User,
						name: 'user',
						description: 'Set a birthday for another Person - MANAGER ONLY',
					},
				],
			},
			{
				type: 1,
				name: 'update',
				description: 'Update your birthday - MANAGER ONLY',
				defaultMemberPermissions: [PermissionFlagsBits.ManageRoles], // https://discord.js.org/#/docs/discord.js/v13/typedef/PermissionResolvable
				options: [
					{
						type: ApplicationCommandOptionType.User,
						name: 'user',
						description: 'Update a Birthday for a Person - MANAGER ONLY',
						required: true,
					},
					{
						type: ApplicationCommandOptionType.Integer,
						name: 'day',
						description: 'Day of birthday',
						required: true,
					},
					{
						type: ApplicationCommandOptionType.String,
						name: 'month',
						description: 'Month of birthday',
						choices: [
							{
								name: 'January',
								value: '01',
							},
							{
								name: 'February',
								value: '02',
							},
							{
								name: 'March',
								value: '03',
							},
							{
								name: 'April',
								value: '04',
							},
							{
								name: 'May',
								value: '05',
							},
							{
								name: 'June',
								value: '06',
							},
							{
								name: 'July',
								value: '07',
							},
							{
								name: 'August',
								value: '08',
							},
							{
								name: 'September',
								value: '09',
							},
							{
								name: 'October',
								value: '10',
							},
							{
								name: 'November',
								value: '11',
							},
							{
								name: 'December',
								value: '12',
							},
						],
						required: true,
					},
					{
						type: ApplicationCommandOptionType.Integer,
						name: 'year',
						description: 'Year of birthday',
					},
				],
			},
			{
				type: 1,
				name: 'list',
				description: 'List all Birthdays in this Discord server',
			},
			{
				type: 1,
				name: 'remove',
				description: 'Remove a birthday - MANAGER ONLY',
				options: [
					{
						type: 6,
						name: 'user',
						description: 'The user you want to remove the birthday from',
						required: true,
					},
				],
			},
			{
				type: 1,
				name: 'show',
				description: 'Show the Birthday of you or a other person',
				options: [
					{
						type: 6,
						name: 'user',
						description: 'Show the birthday of a specific User',
					},
				],
			},
			{
				type: 1,
				name: 'test',
				description: 'Test your current birthday configurations',
			},
		],
	};
}
