import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';
import { getLocalizedString } from '../../helpers/utils/translate';

export function BirthdayCMD(): ChatInputApplicationCommandData {
	return {
		name: getLocalizedString('en-US', 'commands/birthday:name'),
		nameLocalizations: {
			de: getLocalizedString('de-DE', 'commands/birthday:name')
		},
		description: getLocalizedString('en-US', 'commands/birthday:description'),
		descriptionLocalizations: {
			de: getLocalizedString('de-DE', 'commands/birthday:description')
		},
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: false,
		options: [
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: getLocalizedString('en-US', 'commands/birthday:subcommand.register.name'),
				nameLocalizations: {
					de: getLocalizedString('de-DE', 'commands/birthday:subcommand.register.name')
				},
				description: getLocalizedString('en-US', 'commands/birthday:subcommand.register.description'),
				descriptionLocalizations: {
					de: getLocalizedString('de-DE', 'commands/birthday:subcommand.register.descriptionde')
				},
				options: [
					{
						type: ApplicationCommandOptionType.Integer,
						name: 'day',
						description: 'Day of birthday',
						required: true,
						minValue: 1,
						maxValue: 31
					},
					{
						type: ApplicationCommandOptionType.String,
						name: 'month',
						description: 'Month of birthday',
						choices: [
							{
								name: 'January',
								value: '01'
							},
							{
								name: 'February',
								value: '02'
							},
							{
								name: 'March',
								value: '03'
							},
							{
								name: 'April',
								value: '04'
							},
							{
								name: 'May',
								value: '05'
							},
							{
								name: 'June',
								value: '06'
							},
							{
								name: 'July',
								value: '07'
							},
							{
								name: 'August',
								value: '08'
							},
							{
								name: 'September',
								value: '09'
							},
							{
								name: 'October',
								value: '10'
							},
							{
								name: 'November',
								value: '11'
							},
							{
								name: 'December',
								value: '12'
							}
						],
						required: true
					},
					{
						type: ApplicationCommandOptionType.Integer,
						name: 'year',
						description: 'Year of birthday',
						minValue: 1950,
						maxValue: 2025
					},
					{
						type: ApplicationCommandOptionType.User,
						name: 'user',
						description: 'Set a birthday for another Person - MANAGER ONLY'
					}
				]
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'update',
				description: 'Update your birthday - MANAGER ONLY',
				options: [
					{
						type: ApplicationCommandOptionType.User,
						name: 'user',
						description: 'Update a Birthday for a Person - MANAGER ONLY',
						required: true
					},
					{
						type: ApplicationCommandOptionType.Integer,
						name: 'day',
						description: 'Day of birthday',
						required: true,
						minValue: 1,
						maxValue: 31
					},
					{
						type: ApplicationCommandOptionType.String,
						name: 'month',
						description: 'Month of birthday',
						choices: [
							{
								name: 'January',
								value: '01'
							},
							{
								name: 'February',
								value: '02'
							},
							{
								name: 'March',
								value: '03'
							},
							{
								name: 'April',
								value: '04'
							},
							{
								name: 'May',
								value: '05'
							},
							{
								name: 'June',
								value: '06'
							},
							{
								name: 'July',
								value: '07'
							},
							{
								name: 'August',
								value: '08'
							},
							{
								name: 'September',
								value: '09'
							},
							{
								name: 'October',
								value: '10'
							},
							{
								name: 'November',
								value: '11'
							},
							{
								name: 'December',
								value: '12'
							}
						],
						required: true
					},
					{
						type: ApplicationCommandOptionType.Integer,
						name: 'year',
						description: 'Year of birthday',
						minValue: 1950,
						maxValue: 2025
					}
				]
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'list',
				description: 'List all Birthdays in this Discord server'
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'remove',
				description: 'Remove a birthday - MANAGER ONLY',
				options: [
					{
						type: ApplicationCommandOptionType.User,
						name: 'user',
						description: 'The user you want to remove the birthday from',
						required: true
					}
				]
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'show',
				description: 'Show the Birthday of you or a other person',
				options: [
					{
						type: ApplicationCommandOptionType.User,
						name: 'user',
						description: 'Show the birthday of a specific User'
					}
				]
			},
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'test',
				description: 'Test your current birthday configurations'
			}
		]
	};
}
