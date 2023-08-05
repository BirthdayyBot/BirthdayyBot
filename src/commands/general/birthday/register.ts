import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { container } from '@sapphire/pieces';
import { resolveKey } from '@sapphire/plugin-i18next';
import { getDateFromInteraction, reply } from '../../../helpers';
import updateBirthdayOverview from '../../../helpers/update/overview';
import { BIRTHDAY_UPDATE, registerBirthdaySubCommand } from '../../../lib/commands';
import { interactionProblem, interactionSuccess } from '../../../lib/utils/embed';
import { userMention } from 'discord.js';
import { Result } from '@sapphire/result';
import { RequiresUserPermissionsIfTargetIsNotAuthor } from '../../../lib/utils/preconditions';
import { resolveTarget } from '../../../lib/utils/functions';

@RegisterSubCommand('birthday', (builder) => {
	return registerBirthdaySubCommand(builder);
})
export class ListCommand extends Command {
	@RequiresUserPermissionsIfTargetIsNotAuthor('commands/birthday:register', 'ManageRoles')
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const { target, targetIsAuthor } = resolveTarget(interaction);

		const context = targetIsAuthor ? 'author' : 'target';

		const where = { userId: target.id, guildId: interaction.guildId };

		const { birthday } = container.prisma;

		const memberBirthday = await Result.fromAsync(
			birthday.findUniqueOrThrow({
				where: {
					userId_guildId: where,
				},
			}),
		);

		if (memberBirthday.isOk()) {
			return reply(
				interaction,
				interactionProblem(
					await resolveKey(interaction, 'commands/birthday:register.alreadyRegistered', {
						context,
						command: BIRTHDAY_UPDATE,
					}),
				),
			);
		}

		const { isValidDate, date } = getDateFromInteraction(interaction);

		if (!isValidDate) return reply(interaction, interactionProblem('The date you entered is not valid.'));

		const result = await Result.fromAsync(birthday.create({ data: { ...where, birthday: date } }));

		return result.match({
			ok: async (birthday) => {
				await updateBirthdayOverview(birthday.guildId);
				return reply(
					interaction,
					interactionSuccess(
						await resolveKey(interaction, 'commands/birthday:register.success', {
							context,
							target: userMention(target.id),
						}),
					),
				);
			},
			err: async () =>
				reply(
					interaction,
					interactionProblem(await resolveKey(interaction, 'commands/birthday:register.notCreated')),
				),
		});
	}
}
