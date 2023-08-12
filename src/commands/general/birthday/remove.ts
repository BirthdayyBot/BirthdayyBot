import { RequiresUserPermissionsIfTargetIsNotAuthor } from '#lib/structures';
import { defaultClientPermissions, defaultUserPermissions, PrismaErrorCodeEnum } from '#lib/types';
import { updateBirthdayOverview } from '#utils/birthday';
import { interactionProblem, interactionSuccess } from '#utils/embed';
import { resolveOnErrorCodesPrisma } from '#utils/functions';
import { reply, resolveTarget } from '#utils/utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions, RequiresGuildContext } from '@sapphire/decorators';
import { container } from '@sapphire/pieces';
import { resolveKey } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import { removeBirthdaySubCommand } from './birthday';

@RegisterSubCommand('birthday', (builder) => removeBirthdaySubCommand(builder))
export class ListCommand extends Command {
	@RequiresGuildContext()
	@RequiresClientPermissions(defaultClientPermissions)
	@RequiresUserPermissionsIfTargetIsNotAuthor('commands/birthday:remove', defaultUserPermissions.add('ManageRoles'))
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const { user, options } = resolveTarget(interaction);

		const data = { userId_guildId: { guildId: interaction.guildId, userId: user.id } };

		const birthday = await resolveOnErrorCodesPrisma(
			container.prisma.birthday.delete({ where: data }),
			PrismaErrorCodeEnum.NotFound,
		);

		if (isNullish(birthday)) {
			const message = await resolveKey(interaction, 'commands/birthday:remove.notRegistered', options);
			return reply(interactionProblem(message));
		}

		await updateBirthdayOverview(birthday.guildId);
		return reply(interactionSuccess(await resolveKey(interaction, 'commands/birthday:remove.success', options)));
	}
}
