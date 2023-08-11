import { PrismaErrorCodeEnum, defaultClientPermissions, defaultUserPermissions } from '#lib/types';
import { formatDateForDisplay } from '#lib/utils/common';
import { defaultEmbed, interactionProblem } from '#lib/utils/embed';
import { BirthdayyEmojis } from '#lib/utils/environment';
import { resolveOnErrorCodesPrisma } from '#lib/utils/functions';
import { reply, resolveTarget } from '#lib/utils/utils';
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
				interaction,
				interactionProblem(
					await resolveKey(interaction, 'commands/birthday:show.notRegistered', {
						command: BirthdayApplicationCommandMentions.Register,
						...options,
					}),
				),
			);
		}

		const title = await resolveKey(interaction, 'commands/birthday:show.title', {
			emoji: BirthdayyEmojis.Book,
		});

		const description = await resolveKey(interaction, 'commands/birthday:show.description', {
			date: bold(formatDateForDisplay(birthday.birthday)),
			emoji: BirthdayyEmojis.ArrowRight,
			...options,
		});

		return reply(interaction, {
			embeds: [
				{
					...defaultEmbed(),
					description,
					title,
				},
			],
		});
	}
}
