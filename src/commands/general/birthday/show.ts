import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { container } from '@sapphire/pieces';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { inlineCode, userMention } from 'discord.js';
import generateEmbed from '../../../helpers/generate/embed';
import { ARROW_RIGHT, BOOK, FAIL, IMG_CAKE } from '../../../helpers/provide/environment';
import replyToInteraction from '../../../helpers/send/response';
import { formatDateForDisplay } from '../../../helpers/utils/date';
import thinking from '../../../lib/discord/thinking';

@RegisterSubCommand('birthday', (builder) =>
	builder
		.setName('show')
		.setDescription('Show the Birthday of you or a other person')
		.addUserOption((option) =>
			option.setName('user').setDescription('Show the birthday of a specific User').setRequired(false),
		),
)
export class ShowCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const targetUser = interaction.options.getUser('user') ?? interaction.user;

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(
			interaction.guildId,
			targetUser.id,
		);

		if (isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode("This user doesn't have a birthday registered.")}`,
					}),
				],
				ephemeral: true,
			});
		}

		const embed = generateEmbed({
			title: `${BOOK} Birthday`,
			description: `${ARROW_RIGHT} ${userMention(birthday.userId)}'s birthday is at the ${formatDateForDisplay(
				birthday.birthday,
			)}.`,
			thumbnail_url: IMG_CAKE,
		});

		return replyToInteraction(interaction, { embeds: [embed], ephemeral: true });
	}
}
