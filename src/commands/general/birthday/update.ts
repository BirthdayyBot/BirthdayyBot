import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { container } from '@sapphire/framework';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { inlineCode, userMention } from 'discord.js';
import generateEmbed from '../../../helpers/generate/embed';
import { ARROW_RIGHT, FAIL, SUCCESS } from '../../../helpers/provide/environment';
import { hasUserGuildPermissions } from '../../../helpers/provide/permission';
import replyToInteraction from '../../../helpers/send/response';
import updateBirthdayOverview from '../../../helpers/update/overview';
import { formatDateForDisplay } from '../../../helpers/utils/date';
import getDateFromInteraction from '../../../helpers/utils/getDateFromInteraction';
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
				.setRequired(true)
				.setMinValue(1900)
				.setMaxValue(2021),
		),
)
export class UpdateCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const targetUser = interaction.options.getUser('user') ?? interaction.user;
		const { guildId } = interaction;
		if (
			interaction.user.id !== targetUser.id &&
			!(await hasUserGuildPermissions({ interaction, user: targetUser.id, permissions: ['ManageRoles'] }))
		) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode(
							"You don't have the permission to update other users birthdays.",
						)}`,
					}),
				],
				ephemeral: true,
			});
		}

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(guildId, targetUser.id);

		if (isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode("This user doesn't have a birthday registered.")}`,
					}),
				],
				ephemeral: true,
			});
		}

		const date = getDateFromInteraction(interaction);

		if (isNullOrUndefinedOrEmpty(date.date)) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('Please provide a valid date')}`,
					}),
				],
				ephemeral: true,
			});
		}

		try {
			await container.utilities.birthday.update.BirthdayByUserAndGuild(guildId, targetUser.id, date.date);

			await updateBirthdayOverview(guildId);
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${SUCCESS} Success`,
						description: `${ARROW_RIGHT} I updated the Birthday from ${userMention(
							birthday.userId,
						)} to the ${formatDateForDisplay(date.date)}. 🎂`,
					}),
				],
			});
		} catch (error: any) {
			container.logger.error(error);
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('An error occurred while updating the birthday.')}`,
					}),
				],
				ephemeral: true,
			});
		}
	}
}
