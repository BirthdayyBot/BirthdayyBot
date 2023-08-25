import { RequiresUserPermissionsIfTargetIsNotAuthor } from '#lib/structures';
import { defaultClientPermissions, defaultUserPermissions } from '#lib/types';
import { PrismaErrorCodeEnum, interactionProblem, interactionSuccess, reply, resolveTarget } from '#utils';
import { resolveOnErrorCodesPrisma } from '#utils/functions';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions } from '@sapphire/decorators';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { userMention } from 'discord.js';
import { removeBlacklistSubCommand } from './blacklist.js';

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
			return reply(interactionProblem(`${userMention(user.id)} is not blacklisted.`, true));

		return reply(interactionSuccess(`Removed ${userMention(user.id)} from the blacklist.`, true));
	}
}
