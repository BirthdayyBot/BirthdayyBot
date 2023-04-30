import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { container } from '@sapphire/pieces';
import { applyLocalizedBuilder } from '@sapphire/plugin-i18next';
import { chatInputApplicationCommandMention } from 'discord.js';
import { formatDateForDisplay, getDateFromInteraction, reply } from '../../../helpers';
import updateBirthdayOverview from '../../../helpers/update/overview';
import thinking from '../../../lib/discord/thinking';
import { interactionProblem, interactionSuccess } from '../../../lib/utils/embed';
import { catchToNull } from '../../../lib/utils/promises';

@RegisterSubCommand('birthday', (builder) => {
	return applyLocalizedBuilder(
		builder,
		'commands/birthday:subcommand.register.name',
		'commands/birthday:subcommand.register.description',
	)
		.addIntegerOption((option) =>
			applyLocalizedBuilder(
				option,
				'commands/birthday:subcommand.register.options.day.name',
				'commands/birthday:subcommand.register.options.day.description',
			)
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(31),
		)
		.addStringOption((option) =>
			applyLocalizedBuilder(
				option,
				'commands/birthday:subcommand.register.options.month.name',
				'commands/birthday:subcommand.register.options.month.description',
			)
				.setRequired(true)
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
				),
		)
		.addIntegerOption((option) =>
			applyLocalizedBuilder(
				option,
				'commands/birthday:subcommand.register.options.year.name',
				'commands/birthday:subcommand.register.options.year.description',
			)
				.setMinValue(1900)
				.setMaxValue(new Date().getFullYear()),
		)
		.addUserOption((option) =>
			applyLocalizedBuilder(
				option,
				'commands/birthday:subcommand.register.options.user.name',
				'commands/birthday:subcommand.register.options.user.description',
			).setRequired(false),
		);
})
export class ListCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const targetUser = interaction.options.getUser('user') ?? interaction.user;
		const { guildId, memberPermissions } = interaction;
		const authorIsTarget = interaction.user.id === targetUser.id;

		if (!authorIsTarget && !memberPermissions.has('ManageRoles')) {
			return reply(
				interaction,
				interactionProblem("You don't have the permission to register other users birthdays."),
			);
		}

		const date = getDateFromInteraction(interaction);

		if (!date.isValidDate) return reply(interaction, interactionProblem('The date you entered is not valid.'));

		const memberBirthday = await catchToNull(
			container.prisma.birthday.findFirst({
				where: {
					userId: targetUser.id,
					guildId,
				},
			}),
		);

		if (!memberBirthday) {
			return reply(
				interaction,
				interactionProblem(
					`This user's birthday is already registered. If you want to change it, use the ${chatInputApplicationCommandMention(
						'birthday',
						'update',
						'935174192389840896',
					)}`,
				),
			);
		}

		const birthday = await catchToNull(
			container.prisma.birthday.create({
				data: {
					userId: targetUser.id,
					guildId,
					birthday: date.date,
				},
			}),
		);

		if (!birthday) {
			return reply(interaction, interactionProblem('An error occurred while registering the birthday.'));
		}

		await updateBirthdayOverview(birthday.guildId);
		return reply(
			interaction,
			interactionSuccess(
				`${
					authorIsTarget ? 'Your' : `${targetUser.username}'s`
				} birthday was been registered on ${formatDateForDisplay(date.date)}.`,
			),
		);
	}
}
