import thinking from '#lib/discord/thinking';
import { RequiresUserPermissionsIfTargetIsNotAuthor } from '#lib/structures';
import { defaultClientPermissions, defaultUserPermissions } from '#lib/types';
import { PrismaErrorCodeEnum, interactionProblem, interactionSuccess, resolveTarget } from '#utils';
import { updateBirthdayOverview } from '#utils/birthday';
import { formatDateForDisplay, getDateFromInteraction } from '#utils/common';
import { resolveOnErrorCodesPrisma } from '#utils/functions/promises';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions, RequiresGuildContext } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
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

		const result = await resolveOnErrorCodesPrisma(
			container.prisma.birthday.update({ data: { birthday }, where }),
			PrismaErrorCodeEnum.NotFound,
		);

		if (isNullish(result)) {
			return interactionProblem(interaction, 'commands/birthday:update.notRegistered', {
				command: BirthdayApplicationCommandMentions.Register,
			});
		}

		await updateBirthdayOverview(interaction.guildId);
		return interactionSuccess(interaction, 'commands/birthday:update.success', {
			date: bold(formatDateForDisplay(birthday, true)),
			...options,
		});
	}
}
