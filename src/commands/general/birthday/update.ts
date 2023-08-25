import thinking from '#lib/discord/thinking';
import { RequiresUserPermissionsIfTargetIsNotAuthor } from '#lib/structures';
import { defaultClientPermissions, defaultUserPermissions } from '#lib/types';
import { PrismaErrorCodeEnum, interactionProblem, interactionSuccess, reply, resolveTarget } from '#utils';
import { updateBirthdayOverview } from '#utils/birthday';
import { formatDateForDisplay, getDateFromInteraction } from '#utils/common';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import type { Prisma } from '@prisma/client';
import { RequiresClientPermissions, RequiresGuildContext } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { Result } from '@sapphire/result';
import { bold } from 'colorette';
import { BirthdayApplicationCommandMentions, updateBirthdaySubCommand } from './birthday.js';

@RegisterSubCommand('birthday', (builder) => updateBirthdaySubCommand(builder))
export class UpdateCommand extends Command {
	@RequiresGuildContext()
	@RequiresClientPermissions(defaultClientPermissions)
	@RequiresUserPermissionsIfTargetIsNotAuthor('commands/birthday:update', defaultUserPermissions.add('ManageRoles'))
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const { user, options } = resolveTarget(interaction);
		const birthday = getDateFromInteraction(interaction);

		const where = { userId_guildId: { guildId: interaction.guildId, userId: user.id } };

		const result = await Result.fromAsync(container.prisma.birthday.update({ data: { birthday }, where }));

		return result.match({
			err: async (error: Prisma.PrismaClientKnownRequestError) => {
				if (error.code === PrismaErrorCodeEnum.NotFound) {
					const message = await resolveKey(interaction, 'commands/birthday:update.notRegistered', {
						command: BirthdayApplicationCommandMentions.Register,
					});
					return reply(interaction, interactionProblem(message));
				}

				return reply(
					interaction,
					interactionProblem(await resolveKey(interaction, 'commands/birthday:update.notUpdated')),
				);
			},
			ok: async (birthday) => {
				await updateBirthdayOverview(interaction.guildId);
				return reply(
					interaction,
					interactionSuccess(
						await resolveKey(interaction, 'commands/birthday:update.success', {
							date: bold(formatDateForDisplay(birthday.birthday, true)),
							...options,
						}),
					),
				);
			},
		});
	}
}
