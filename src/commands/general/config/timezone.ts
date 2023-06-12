import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { Result } from '@sapphire/result';
import { reply } from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';
import { interactionProblem, interactionSuccess } from '../../../lib/utils/embed';

@RegisterSubCommand('config', (builder) =>
	builder
		.setName('timezone')
		.setDescription('Change the Timezone when Birthdayy wishes Happy Birthday.')
		.addIntegerOption((option) =>
			option
				.setName('timezone')
				.setDescription('The Timezone to set.')
				.addChoices(
					{
						name: 'Niue Time | NUT | UTC -11',
						value: -11,
					},
					{
						name: 'Hawaii-Aleutian Standard Time | HST | UTC -10',
						value: -10,
					},
					{
						name: 'Alaska Standard Time | AKST | UTC -9',
						value: -9,
					},
					{
						name: 'Pacific Standard Time | PST | UTC -8',
						value: -8,
					},
					{
						name: 'Mountain Standard Time | MST | UTC -7',
						value: -7,
					},
					{
						name: 'Central Standard Time | CST | UTC -6',
						value: -6,
					},
					{
						name: 'Eastern Standard Time | EST | UTC -5',
						value: -5,
					},
					{
						name: 'Atlantic Standard Time | AST | UTC -4',
						value: -4,
					},
					{
						name: 'Amazon Time Zone | AMT | UTC -3',
						value: -3,
					},
					{
						name: 'Fernando de Noronha Time | FNT | UTC -2',
						value: -2,
					},
					{
						name: 'Azores Time | AZOT | UTC -1',
						value: -1,
					},
					{
						name: 'Greenwich Mean Time | GMT | UTC +0',
						value: 0,
					},
					{
						name: 'Central European Time | CET | UTC +1',
						value: 1,
					},
					{
						name: 'Eastern European Time | EET | UTC +2',
						value: 2,
					},
					{
						name: 'Moscow Standard Time | MSK | UTC +3',
						value: 3,
					},
					{
						name: 'Gulf Standard Time | GST | UTC +4',
						value: 4,
					},
					{
						name: 'Pakistan Standard Time | PKT | UTC +5',
						value: 5,
					},
					{
						name: 'Bangladesh Standard Time | BST | UTC +6',
						value: 6,
					},
					{
						name: 'Indochina Time | ICT | UTC +7',
						value: 7,
					},
					{
						name: 'China Standard Time | CST | UTC +8',
						value: 8,
					},
					{
						name: 'Japan Standard Time | JST | UTC +9',
						value: 9,
					},
					{
						name: 'Australian Eastern Standard Time | AEST | UTC +10',
						value: 10,
					},
					{
						name: 'Solomon Island Time | SBT | UTC +11',
						value: 11,
					},
					{
						name: 'New Zealand Standard Time | NZST | UTC +12',
						value: 12,
					},
				)
				.setRequired(true),
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
			return reply(interaction, interactionProblem("I couldn't set the **Timezone**."));
		}

		return reply(
			interaction,
			interactionSuccess(`The **Timezone** has been set to UTC${timezone >= 0 ? `+${timezone}` : timezone}.`),
		);
	}
}
