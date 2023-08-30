import { defaultClientPermissions, defaultUserPermissions } from '#lib/types/permissions';
import { Emojis, PrismaErrorCodeEnum, interactionProblem, resolveTarget } from '#utils';
import { formatDateForDisplay } from '#utils/common';
import { resolveOnErrorCodesPrisma } from '#utils/functions';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions, RequiresGuildContext, RequiresUserPermissions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import { bold } from 'discord.js';
import { BirthdayApplicationCommandMentions, showBirthdaySubCommand } from './birthday.js';
import { replyToInteraction } from '#lib/discord/interaction';

@RegisterSubCommand('birthday', (builder) => showBirthdaySubCommand(builder))
export class ShowCommand extends Command {
	@RequiresGuildContext()
	@RequiresUserPermissions(defaultUserPermissions)
	@RequiresClientPermissions(defaultClientPermissions)
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const { user, options } = resolveTarget(interaction);

		const where = { guildId: interaction.guildId, userId: user.id };

		const birthday = await resolveOnErrorCodesPrisma(
			container.prisma.birthday.findFirstOrThrow({ where }),
			PrismaErrorCodeEnum.NotFound,
		);

		if (isNullish(birthday)) {
			return interactionProblem(interaction, 'commands/birthday:show.notRegistered', {
				command: BirthdayApplicationCommandMentions.Register,
				...options,
			});
		}

		const description = await resolveKey(interaction, 'commands/birthday:show.description', {
			date: bold(formatDateForDisplay(birthday.birthday)),
			emoji: Emojis.ArrowRight,
			...options,
		});

		return replyToInteraction(interaction, description);
	}
}
