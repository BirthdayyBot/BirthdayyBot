import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { container } from '@sapphire/pieces';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { inlineCode } from 'discord.js';
import generateEmbed from '../../../helpers/generate/embed';
import { ARROW_RIGHT, BOOK, FAIL, IMG_CAKE } from '../../../helpers/provide/environment';
import { hasUserGuildPermissions } from '../../../helpers/provide/permission';
import replyToInteraction from '../../../helpers/send/response';
import { formatDateForDisplay } from '../../../helpers/utils/date';
import getDateFromInteraction from '../../../helpers/utils/getDateFromInteraction';
import thinking from '../../../lib/discord/thinking';
import { applyLocalizedBuilder } from '@sapphire/plugin-i18next';

@RegisterSubCommand('birthday', (builder) =>
	applyLocalizedBuilder(
		builder,
		'commands/birthday:subcommand.register.name',
		'commands/birthday:subcommand.register.description',
	)
		.addIntegerOption((option) =>
			option.setName('day').setDescription('Day of birthday').setRequired(true).setMinValue(1).setMaxValue(31),
		)
		.addStringOption((option) =>
			option.setName('month').setDescription('Month of birthday').setRequired(true).addChoices(
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
			),
		)
		.addIntegerOption((option) =>
			option
				.setName('year')
				.setDescription('Year of birthday')
				.setRequired(true)
				.setMinValue(1900)
				.setMaxValue(new Date().getFullYear()),
		)
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('Set a birthday for another Person - MANAGER ONLY')
				.setRequired(false),
		),
)
export class ListCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const targetUser = interaction.options.getUser('user') ?? interaction.user;

		if (
			interaction.user.id !== targetUser.id &&
			!(await hasUserGuildPermissions({ interaction, user: interaction.user, permissions: ['ManageRoles'] }))
		) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode(
							"You don't have the permission to register other users birthdays.",
						)}`,
					}),
				],
				ephemeral: true,
			});
		}

		const date = getDateFromInteraction(interaction);
		if (isNullOrUndefinedOrEmpty(date) || !date.isValidDate) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('The date you entered is not valid.')}`,
					}),
				],
				ephemeral: true,
			});
		}

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(
			interaction.guildId,
			targetUser.id,
		);

		if (!isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} This user's birthday is already registerd. Use </birthday update:${935174192389840896n}>`,
					}),
				],
				ephemeral: true,
			});
		}

		try {
			await container.utilities.birthday.create(date.date, interaction.guildId, targetUser);

			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${BOOK} Birthday Registered`,
						description: `${ARROW_RIGHT} ${inlineCode(
							`The birthday of ${targetUser.username} was successfully registered.`,
						)}`,
						fields: [
							{
								name: 'Date',
								value: formatDateForDisplay(date.date),
								inline: true,
							},
						],
						thumbnail_url: IMG_CAKE,
					}),
				],
				ephemeral: true,
			});
		} catch (error: any) {
			container.logger.error(error);
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('An error occured while registering the birthday.')}`,
					}),
				],
				ephemeral: true,
			});
		}
	}
}
