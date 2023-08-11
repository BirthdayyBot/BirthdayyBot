import { RequiresUserPermissionsIfTargetIsNotAuthor } from '#lib/structures/preconditions/requiresUserPermissionsIfTargetIsNotAuthor';
import { PrismaErrorCodeEnum, defaultClientPermissions, defaultUserPermissions } from '#lib/types';
import { interactionProblem, interactionSuccess } from '#lib/utils/embed';
import { resolveOnErrorCodesPrisma } from '#lib/utils/functions';
import { reply, resolveTarget } from '#lib/utils/utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions } from '@sapphire/decorators';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { userMention } from 'discord.js';
import { removeBlacklistSubCommand } from './blacklist';

@RegisterSubCommand('blacklist', (builder) => removeBlacklistSubCommand(builder))
export class RemoveCommand extends Command {
	@RequiresClientPermissions(defaultClientPermissions)
	@RequiresUserPermissionsIfTargetIsNotAuthor('commands/blacklist:remove', defaultUserPermissions.add('ManageGuild'))
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const { user } = resolveTarget(interaction);

		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.blacklist.delete({
				where: {
					userId_guildId: {
						guildId: interaction.guildId,
						userId: user.id,
					},
				},
			}),
			PrismaErrorCodeEnum.NotFound,
		);

		if (isNullOrUndefinedOrEmpty(result))
			return reply(interaction, interactionProblem(`${userMention(user.id)} is not blacklisted.`, true));

		return reply(interaction, interactionSuccess(`Removed ${userMention(user.id)} from the blacklist.`, true));
	}
}
