import { BIRTHDAY_REGISTER } from '#lib/commands/index';
import { interactionProblem, defaultEmbed } from '#lib/utils/embed';
import { catchToNull } from '#lib/utils/promises';
import { reply, BOOK, ARROW_RIGHT, formatDateForDisplay } from '#root/helpers/index';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { bold, userMention } from 'discord.js';

@RegisterSubCommand('birthday', (builder) =>
	builder
		.setName('show')
		.setDescription('Show the Birthday of you or a other person')
		.addUserOption((option) => option.setName('user').setDescription('Show the birthday of a specific User').setRequired(false))
)
export class ShowCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const targetUser = interaction.options.getUser('user') ?? interaction.user;
		const TargetIsNotUser = targetUser.id !== interaction.user.id;

		const birthday = await catchToNull(
			this.container.prisma.birthday.findFirst({
				where: {
					userId: targetUser.id,
					guildId: interaction.guildId
				}
			})
		);

		if (!birthday) {
			return reply(interaction, interactionProblem(`This user doesn't have a birthday added. Register it with ${BIRTHDAY_REGISTER}.`));
		}

		return reply(interaction, {
			embeds: [
				{
					...defaultEmbed(),
					title: `${BOOK} Birthday`,
					description: `${ARROW_RIGHT} ${TargetIsNotUser ? `${userMention(targetUser.id)}'s` : 'Your'} birthday is at the ${bold(
						formatDateForDisplay(birthday.birthday)
					)}.`
				}
			]
		});
	}
}
