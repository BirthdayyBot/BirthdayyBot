import { RequiresUserPermissionsIfTargetIsNotAuthor } from '#lib/structures';
import { defaultClientPermissions, defaultUserPermissions, PrismaErrorCodeEnum } from '#lib/types';
import { interactionProblem, interactionSuccess } from '#utils/embed';
import { reply, resolveTarget } from '#utils/utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import type { Prisma } from '@prisma/client';
import { RequiresClientPermissions, RequiresGuildContext } from '@sapphire/decorators';
import { resolveKey } from '@sapphire/plugin-i18next';
import { Result } from '@sapphire/result';
import { addBlacklistSubCommand } from './blacklist';

@RegisterSubCommand('blacklist', (builder) => addBlacklistSubCommand(builder))
export class AddlacklistCommand extends Command {
	@RequiresGuildContext()
	@RequiresClientPermissions(defaultClientPermissions)
	@RequiresUserPermissionsIfTargetIsNotAuthor('commands/blacklist:add', defaultUserPermissions.add('ManageGuild'))
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const { user, options } = resolveTarget(interaction);

		if (options.context === 'author') {
			const message = await resolveKey(interaction, 'commands/blacklist:add.cannotBlacklistSelf');
			return reply(interactionProblem(message, true));
		}

		const data = { guildId: interaction.guildId, userId: user.id };

		const result = await Result.fromAsync(await this.container.prisma.blacklist.create({ data }));

		return result.match({
			err: async (error: Prisma.PrismaClientKnownRequestError) => {
				if (error.code === PrismaErrorCodeEnum.UniqueConstraintFailed) {
					const message = await resolveKey(interaction, 'commands/blacklist:add.alReadyBlacklisted', options);
					return reply(interactionProblem(message));
				}
				return reply(interactionProblem(await resolveKey(interaction, 'commands/blacklist:add.notAdded')));
			},
			ok: async () => {
				const message = await resolveKey(interaction, 'commands/blacklist:add.success', options);
				return reply(interactionSuccess(message));
			},
		});
	}
}
