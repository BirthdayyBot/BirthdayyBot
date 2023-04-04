import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { container } from '@sapphire/pieces';
import { applyLocalizedBuilder } from '@sapphire/plugin-i18next';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { inlineCode } from 'discord.js';
import generateEmbed from '../../../helpers/generate/embed';
import { ARROW_RIGHT, BOOK, FAIL, IMG_CAKE } from '../../../helpers/provide/environment';
import { hasUserGuildPermissions } from '../../../helpers/provide/permission';
import replyToInteraction from '../../../helpers/send/response';
import updateBirthdayOverview from '../../../helpers/update/overview';
import { formatDateForDisplay } from '../../../helpers/utils/date';
import getDateFromInteraction from '../../../helpers/utils/getDateFromInteraction';
import thinking from '../../../lib/discord/thinking';

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
		const { guildId } = interaction;
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

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(guildId, targetUser.id);

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
			await container.utilities.birthday.create(date.date, guildId, targetUser);
			await updateBirthdayOverview(guildId);
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
