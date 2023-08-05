import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { container } from '@sapphire/pieces';
import { userMention } from 'discord.js';
import { reply } from '../../../helpers';
import updateBirthdayOverview from '../../../helpers/update/overview';
import { interactionProblem, interactionSuccess } from '../../../lib/utils/embed';
import { removeBirthdaySubCommand } from '../../../lib/commands';
import { resolveTarget } from '../../../lib/utils/functions';
import { RequiresUserPermissionsIfTargetIsNotAuthor } from '../../../lib/utils/preconditions';
import { Result } from '@sapphire/result';
import { resolveKey } from '@sapphire/plugin-i18next';

@RegisterSubCommand('birthday', (builder) => removeBirthdaySubCommand(builder))
export class ListCommand extends Command {
	@RequiresUserPermissionsIfTargetIsNotAuthor('commands/birthday:remove', 'ManageRoles')
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const { target, targetIsAuthor } = resolveTarget(interaction);
		const { birthday } = container.prisma;
		const { guildId } = interaction;

		const context = targetIsAuthor ? 'author' : 'target';

		const result = await Result.fromAsync(
			birthday.delete({
				where: {
					userId_guildId: { userId: target.id, guildId },
				},
			}),
		);

		return result.match({
			ok: async () => {
				await updateBirthdayOverview(guildId);
				return reply(
					interaction,
					interactionSuccess(
						await resolveKey(interaction, 'commands/birthday:remove.success', {
							context,
							target: userMention(target.id),
						}),
					),
				);
			},
			err: async () => {
				return reply(
					interaction,
					interactionProblem(
						await resolveKey(interaction, 'commands/birthday:remove.notRegistered', {
							context,
							target: userMention(target.id),
						}),
					),
				);
			},
		});
	}
}
