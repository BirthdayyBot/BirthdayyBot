import { RequiresUserPermissionsIfTargetIsNotAuthor } from '#lib/structures/preconditions/requiresUserPermissionsIfTargetIsNotAuthor';
import { defaultClientPermissions, defaultUserPermissions, PrismaErrorCodeEnum } from '#lib/types';
import updateBirthdayOverview from '#lib/utils/birthday/overview';
import { getDateFromInteraction } from '#lib/utils/common';
import { interactionProblem, interactionSuccess } from '#lib/utils/embed';
import { resolveOnErrorCodesPrisma } from '#lib/utils/functions/promises';
import { reply, resolveTarget } from '#lib/utils/utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions, RequiresGuildContext } from '@sapphire/decorators';
import { resolveKey } from '@sapphire/plugin-i18next';
import { BirthdayApplicationCommandMentions, registerBirthdaySubCommand } from './birthday';

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

		const alreadyRegistered = await resolveKey(interaction, 'commands/birthday:register.alreadyRegistered', {
			command: BirthdayApplicationCommandMentions.Update,
		});

		if (!birthday) return reply(interaction, interactionProblem(alreadyRegistered));

		const success = await resolveKey(interaction, 'commands/birthday:register.success', options);

		await updateBirthdayOverview(birthday.guildId);
		return reply(interaction, interactionSuccess(success));
	}
}
