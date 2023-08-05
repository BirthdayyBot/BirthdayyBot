import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { Result, container } from '@sapphire/framework';
import { bold, userMention } from 'discord.js';
import { formatDateForDisplay, getDateFromInteraction, reply } from '../../../helpers';
import updateBirthdayOverview from '../../../helpers/update/overview';
import { BIRTHDAY_REGISTER, updateBirthdaySubCommand } from '../../../lib/commands';
import thinking from '../../../lib/discord/thinking';
import { interactionProblem, interactionSuccess } from '../../../lib/utils/embed';
import { resolveTarget } from '../../../lib/utils/functions';
import { RequiresUserPermissionsIfTargetIsNotAuthor } from '../../../lib/utils/preconditions';
import { resolveKey } from '@sapphire/plugin-i18next';

@RegisterSubCommand('birthday', (builder) => updateBirthdaySubCommand(builder))
export class UpdateCommand extends Command {
	@RequiresUserPermissionsIfTargetIsNotAuthor('commands/birthday:update', 'ManageRoles')
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const { target, targetIsAuthor } = resolveTarget(interaction);
		const { birthday } = container.prisma;
		const context = targetIsAuthor ? 'author' : 'target';

		const where = { userId: target.id, guildId: interaction.guildId };

		const resultRegistred = await Result.fromAsync(
			birthday.findUniqueOrThrow({
				where: { userId_guildId: where },
			}),
		);

		if (resultRegistred.isErr()) {
			return reply(
				interaction,
				interactionProblem(
					await resolveKey(interaction, 'commands/birthday:update.notRegistered', {
						context,
						command: BIRTHDAY_REGISTER,
						target: userMention(target.username),
					}),
				),
			);
		}

		const { isValidDate, date } = getDateFromInteraction(interaction);

		if (!isValidDate) {
			return reply(interaction, interactionProblem('Please provide a valid date'));
		}

		const result = await Result.fromAsync(
			birthday.update({
				where: { userId_guildId: where },
				data: {
					birthday: date,
				},
			}),
		);

		return result.match({
			ok: async () => {
				await updateBirthdayOverview(interaction.guildId);
				return reply(
					interaction,
					interactionSuccess(
						await resolveKey(interaction, 'commands/birthday:update.success', {
							context,
							target: userMention(target.id),
							date: bold(formatDateForDisplay(date)),
						}),
					),
				);
			},
			err: async () => {
				return reply(
					interaction,
					interactionProblem(await resolveKey(interaction, 'commands/birthday:update.notUpdated')),
				);
			},
		});
	}
}
