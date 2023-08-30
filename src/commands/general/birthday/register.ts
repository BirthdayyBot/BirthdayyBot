import { RequiresUserPermissionsIfTargetIsNotAuthor } from '#lib/structures/index';
import { defaultClientPermissions, defaultUserPermissions } from '#lib/types/permissions';
import { PrismaErrorCodeEnum, interactionProblem, interactionSuccess, resolveTarget } from '#utils';
import { updateBirthdayOverview } from '#utils/birthday';
import { getDateFromInteraction } from '#utils/common';
import { resolveOnErrorCodesPrisma } from '#utils/functions';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions, RequiresGuildContext } from '@sapphire/decorators';
import { isNullish } from '@sapphire/utilities';
import { BirthdayApplicationCommandMentions, registerBirthdaySubCommand } from './birthday.js';

@RegisterSubCommand('birthday', (builder) => {
	return registerBirthdaySubCommand(builder);
})
export class ListCommand extends Command {
	@RequiresGuildContext()
	@RequiresClientPermissions(defaultClientPermissions)
	@RequiresUserPermissionsIfTargetIsNotAuthor('commands/birthday:register', defaultUserPermissions.add('ManageGuild'))
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const { user, options } = resolveTarget(interaction);

		const birthday = await resolveOnErrorCodesPrisma(
			this.container.prisma.birthday.create({
				data: {
					birthday: getDateFromInteraction(interaction),
					guildId: interaction.guildId,
					userId: user.id,
				},
			}),
			PrismaErrorCodeEnum.UniqueConstraintFailed,
		);

		if (isNullish(birthday)) {
			return interactionProblem(interaction, 'commands/birthday:register.alreadyRegistered', {
				command: BirthdayApplicationCommandMentions.Update,
			});
		}

		await updateBirthdayOverview(birthday.guildId);

		return interactionSuccess(interaction, 'commands/birthday:register.success', options);
	}
}
