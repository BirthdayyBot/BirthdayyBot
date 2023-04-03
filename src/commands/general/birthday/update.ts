import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import generateBirthdayList from '../../../helpers/generate/birthdayList';
import generateEmbed from '../../../helpers/generate/embed';
import replyToInteraction from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';

@RegisterSubCommand('birthday', (builder) =>
	builder
		.setName('update')
		.setDescription('Update your birthday - MANAGER ONLY')
		.addUserOption((option) =>
			option.setName('user').setDescription('Update a Birthday for a Person - MANAGER ONLY').setRequired(true),
		)
		.addIntegerOption((option) =>
			option.setName('day').setDescription('Day of birthday').setRequired(true).setMinValue(1).setMaxValue(31),
		)
		.addStringOption((option) =>
			option
				.setName('month')
				.setDescription('Month of birthday')
				.addChoices(
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
				)
				.setRequired(true),
		)
		.addIntegerOption((option) =>
			option
				.setName('year')
				.setDescription('Year of birthday')
				.setRequired(true)
				.setMinValue(1900)
				.setMaxValue(2021),
		),
)
export class UpdateCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const { embed, components } = await generateBirthdayList(1, interaction.guildId);

		const generatedEmbed = generateEmbed(embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed], components });
	}
}
