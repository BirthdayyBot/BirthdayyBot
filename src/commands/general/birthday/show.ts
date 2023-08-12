import { PrismaErrorCodeEnum, defaultClientPermissions, defaultUserPermissions } from '#lib/types';
import { formatDateForDisplay } from '#utils/common';
import { defaultEmbed, interactionProblem } from '#utils/embed';
import { Emojis } from '#utils/environment';
import { resolveOnErrorCodesPrisma } from '#utils/functions';
import { reply, resolveTarget } from '#utils/utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions, RequiresGuildContext, RequiresUserPermissions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import { bold } from 'discord.js';
import { BirthdayApplicationCommandMentions, showBirthdaySubCommand } from './birthday';

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
			return reply(
				interactionProblem(
					await resolveKey(interaction, 'commands/birthday:show.notRegistered', {
						command: BirthdayApplicationCommandMentions.Register,
						...options,
					}),
				),
			);
		}

		const [title, description] = await Promise.all([
			await resolveKey(interaction, 'commands/birthday:show.title', {
				emoji: Emojis.Book,
			}),
			await resolveKey(interaction, 'commands/birthday:show.description', {
				date: bold(formatDateForDisplay(birthday.birthday)),
				emoji: Emojis.ArrowRight,
				...options,
			}),
		]);

		return reply({
			embeds: [
				{
					...defaultEmbed(),
					title,
					description,
				},
			],
		});
	}
}
