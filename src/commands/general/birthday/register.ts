import { RequiresUserPermissionsIfTargetIsNotAuthor } from '#lib/structures/index';
import { defaultClientPermissions, defaultUserPermissions } from '#lib/types/permissions';
import { updateBirthdayOverview } from '#utils/birthday';
import { getDateFromInteraction } from '#utils/common';
import { resolveOnErrorCodesPrisma } from '#utils/functions';
import { PrismaErrorCodeEnum, interactionProblem, interactionSuccess, reply, resolveTarget } from '#utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions, RequiresGuildContext } from '@sapphire/decorators';
import { resolveKey } from '@sapphire/plugin-i18next';
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

		const alreadyRegistered = await resolveKey(interaction, 'commands/birthday:register.alreadyRegistered', {
			command: BirthdayApplicationCommandMentions.Update,
		});

		if (!birthday) return reply(interaction, interactionProblem(alreadyRegistered));

		const success = await resolveKey(interaction, 'commands/birthday:register.success', options);

		await updateBirthdayOverview(birthday.guildId);
		return reply(interaction, interactionSuccess(success));
	}
}
