import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { Result } from '@sapphire/result';
import { inlineCode } from 'discord.js';
import generateEmbed from '../../../helpers/generate/embed';
import { ARROW_RIGHT, FAIL, SUCCESS } from '../../../helpers/provide/environment';
import replyToInteraction from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';

@RegisterSubCommand('config', (builder) =>
	builder
		.setName('timezone')
		.setDescription('Change the Timezone when Birthdayy wishes Happy Birthday.')
		.addIntegerOption((option) =>
			option.setName('timezone').setDescription('The Timezone to set.').setRequired(true).addChoices(
				{
					name: 'Greenwich Mean Time | GMT | UTC',
					value: 0,
				},
				{
					name: 'European Central Time | ECT | UTC+1:00',
					value: 1,
				},
				{
					name: 'Eastern European Time | EET | UTC+2:00',
					value: 2,
				},
				{
					name: 'Eastern African Time | EAT | UTC+3:00',
					value: 3,
				},
				{
					name: 'Near East Time | NET | UTC+4:00',
					value: 4,
				},
				{
					name: 'Pakistan Lahore Time | PLT | UTC+5:00',
					value: 5,
				},
				{
					name: 'Bangladesh Standard Time | BST | UTC+6:00',
					value: 6,
				},
				{
					name: 'Vietnam Standard Time | VST | UTC+7:00',
					value: 7,
				},
				{
					name: 'China Taiwan Time | CTT | UTC+8:00',
					value: 8,
				},
				{
					name: 'Japan Standard Time | JST | UTC+9:00',
					value: 9,
				},
				{
					name: 'Australia Eastern Time | AET | UTC+10:00',
					value: 10,
				},
				{
					name: 'Solomon Standard Time | SST | UTC+11:00',
					value: 11,
				},
				{
					name: 'New Zealand Standard Time | NST | UTC+12:00',
					value: 12,
				},
				{
					name: 'Midway Islands Time | MIT | UTC-11:00',
					value: -11,
				},
				{
					name: 'Hawaii Standard Time | HST | UTC-10:00',
					value: -10,
				},
				{
					name: 'Alaska Standard Time | AST | UTC-9:00',
					value: -9,
				},
				{
					name: 'Pacific Standard Time | PST | UTC-8:00',
					value: -8,
				},
				{
					name: 'Phoenix Standard Time | PNT | UTC-7:00',
					value: -7,
				},
				{
					name: 'Central Standard Time | CST | UTC-6:00',
					value: -6,
				},
				{
					name: 'Eastern Standard Time | EST | UTC-5:00',
					value: -5,
				},
				{
					name: 'Puerto Rico and US Virgin Islands Time | PRT | UTC-4:00',
					value: -4,
				},
				{
					name: 'Brazil Eastern Time | BET | UTC-2:00',
					value: -2,
				},
			),
		),
)
export class TimezoneCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const timezone = interaction.options.getInteger('timezone', true);

		const result = await Result.fromAsync(() =>
			this.container.prisma.guild.update({ where: { guildId: interaction.guildId }, data: { timezone } }),
		);

		if (result.isErr()) {
			const embed = generateEmbed({
				title: `${FAIL} Failure`,
				description: 'An error occurred while trying to set the timezone.',
			});

			return replyToInteraction(interaction, { embeds: [embed] });
		}

		const embed = generateEmbed({
			title: `${SUCCESS} Success`,
			description: `${ARROW_RIGHT} You set the **Timezone** to ${inlineCode(
				timezone < 0 ? `UTC${timezone}` : `UTC+${timezone}`,
			)}`,
		});

		return replyToInteraction(interaction, { embeds: [embed] });
	}
}
