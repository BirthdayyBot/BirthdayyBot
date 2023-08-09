import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { bold, userMention } from 'discord.js';
import { BirthdayyEmojis, formatDateForDisplay, reply } from '../../../helpers';
import { BIRTHDAY_REGISTER, showBirthdaySubCommand } from '../../../lib/commands';
import { defaultEmbed, interactionProblem } from '../../../lib/utils/embed';
import { resolveTarget } from '../../../lib/utils/functions';
import { Result } from '@sapphire/result';
import { resolveKey } from '@sapphire/plugin-i18next';

@RegisterSubCommand('birthday', (builder) => showBirthdaySubCommand(builder))
export class ShowCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const { target, targetIsAuthor } = resolveTarget(interaction);
		const { birthday } = this.container.prisma;
		const context = targetIsAuthor ? 'author' : 'target';

		const result = await Result.fromAsync(
			birthday.findUniqueOrThrow({
				where: {
					userId_guildId: {
						userId: target.id,
						guildId: interaction.guildId,
					},
				},
			}),
		);

		return result.match({
			ok: async (birthday) => {
				const title = await resolveKey(interaction, 'commands/birthday:show.title', {
					emoji: BirthdayyEmojis.Book,
				});
				const description = await resolveKey(interaction, 'commands/birthday:show.description', {
					target: userMention(target.id),
					emoji: BirthdayyEmojis.ArrowRight,
					date: bold(formatDateForDisplay(birthday.birthday)),
					context,
				});

				return reply(interaction, {
					embeds: [
						{
							...defaultEmbed(),
							title,
							description,
						},
					],
				});
			},
			err: async () => {
				return reply(
					interaction,
					interactionProblem(
						await resolveKey(interaction, 'commands/birthday:show.notRegistered', {
							context,
							command: BIRTHDAY_REGISTER,
							target: userMention(target.username),
						}),
					),
				);
			},
		});
	}
}
