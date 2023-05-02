import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { container } from '@sapphire/framework';
import dayjs from 'dayjs';
import { bold, userMention } from 'discord.js';
import { formatDateForDisplay, getDateFromInteraction, reply } from '../../../helpers';
import updateBirthdayOverview from '../../../helpers/update/overview';
import { BIRTHDAY_REGISTER } from '../../../lib/commands';
import thinking from '../../../lib/discord/thinking';
import { interactionProblem, interactionSuccess } from '../../../lib/utils/embed';

const currentYear = dayjs().year();
const minYear = currentYear - 100;

@RegisterSubCommand('birthday', (builder) =>
	builder
		.setName('update')
		.setDescription('Update your birthday - MANAGER ONLY')
		.addUserOption((option) =>
			option.setName('user').setDescription('Update a Birthday for a Person - MANAGER ONLY'),
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
						name: 'January | 1',
						value: '01',
					},
					{
						name: 'February | 2',
						value: '02',
					},
					{
						name: 'March | 3',
						value: '03',
					},
					{
						name: 'April | 4',
						value: '04',
					},
					{
						name: 'May | 5',
						value: '05',
					},
					{
						name: 'June | 6',
						value: '06',
					},
					{
						name: 'July | 7',
						value: '07',
					},
					{
						name: 'August | 8',
						value: '08',
					},
					{
						name: 'September | 9',
						value: '09',
					},
					{
						name: 'October | 10',
						value: '10',
					},
					{
						name: 'November | 11',
						value: '11',
					},
					{
						name: 'December | 12',
						value: '12',
					},
				)
				.setRequired(true),
		)
		.addIntegerOption((option) =>
			option
				.setName('year')
				.setDescription('Year of birthday')
				.setRequired(false)
				.setMinValue(minYear)
				.setMaxValue(currentYear),
		),
)
export class UpdateCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const targetUser = interaction.options.getUser('user') ?? interaction.user;
		const { guildId, memberPermissions } = interaction;
		const authorIsTarget = interaction.user.id === targetUser.id;

		if (!authorIsTarget && !memberPermissions.has('ManageRoles')) {
			return reply(
				interaction,
				interactionProblem("You don't have the permission to update other users birthdays."),
			);
		}

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(guildId, targetUser.id);

		if (!birthday) {
			return reply(
				interaction,
				interactionProblem(
					`I couldn't find a birthday for ${userMention(
						targetUser.id,
					)}. Use ${BIRTHDAY_REGISTER} to register a birthday.`,
				),
			);
		}

		const date = getDateFromInteraction(interaction);

		if (!date.isValidDate) {
			return reply(interaction, interactionProblem('Please provide a valid date'));
		}

		const updateBirthday = await container.utilities.birthday.update
			.BirthdayByUserAndGuild(guildId, targetUser.id, date.date)
			.catch(() => null);

		if (!updateBirthday) {
			return reply(
				interaction,
				interactionProblem(
					`I couldn't update the birthday for ${userMention(targetUser.id)} to the ${bold(
						formatDateForDisplay(date.date),
					)}.`,
				),
			);
		}

		await updateBirthdayOverview(guildId);
		return reply(
			interaction,
			interactionSuccess(
				`${authorIsTarget ? 'Your' : `${targetUser.username}'s`} birthday has been updated to the ${bold(
					formatDateForDisplay(date.date),
				)}.`,
			),
		);
	}
}
