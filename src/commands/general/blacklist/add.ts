import { RequiresUserPermissionsIfTargetIsNotAuthor } from '#lib/structures';
import { defaultClientPermissions, defaultUserPermissions } from '#lib/types';
import { PrismaErrorCodeEnum, interactionProblem, interactionSuccess, resolveTarget } from '#utils';
import { resolveOnErrorCodesPrisma } from '#utils/functions/promises';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions, RequiresGuildContext } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import { addBlacklistSubCommand } from './blacklist.js';

@RegisterSubCommand('blacklist', (builder) => addBlacklistSubCommand(builder))
export class AddlacklistCommand extends Command {
	@RequiresGuildContext()
	@RequiresClientPermissions(defaultClientPermissions)
	@RequiresUserPermissionsIfTargetIsNotAuthor('commands/blacklist:add', defaultUserPermissions.add('ManageGuild'))
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const { user, options } = resolveTarget(interaction);

		if (options.context === 'author') {
			return interactionProblem(interaction, 'commands/blacklist:add.cannotBlacklistSelf');
		}

		const data = { guildId: interaction.guildId, userId: user.id };

		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.blacklist.create({ data }),
			PrismaErrorCodeEnum.UniqueConstraintFailed,
		);

		if (isNullish(result)) {
			return interactionProblem(interaction, 'commands/blacklist:add.alReadyBlacklisted', options);
		}

		return interactionSuccess(interaction, 'commands/blacklist:add.success', options);
	}
}
