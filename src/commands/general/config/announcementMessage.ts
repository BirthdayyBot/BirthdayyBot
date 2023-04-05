import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { EmbedLimits } from '@sapphire/discord.js-utilities';
import { Result } from '@sapphire/result';
import generateEmbed from '../../../helpers/generate/embed';
import { ARROW_RIGHT, PLUS, PREMIUM_URL } from '../../../helpers/provide/environment';
import replyToInteraction from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';

@RegisterSubCommand('config', (builder) =>
	builder
		.setName('announcement-message')
		.setDescription('Add a custom birthday announcement message.')
		.addStringOption((option) =>
			option
				.setName('message')
				.setDescription('{MENTION}, {USERNAME}, {DISCRIMINATOR}, {LINE_BREAK}, {SERVERNAME}')
				.setRequired(true),
		),
)
export class AnnouncementMessageCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const message = interaction.options.getString('message', true);
		const isPremium = await this.container.utilities.guild.check.isGuildPremium(interaction.guildId);

		if (!isPremium) {
			const embed = generateEmbed({
				title: `${PLUS} Early access only`,
				description: `${ARROW_RIGHT} This feature is currently in __Beta Stage__ and **Birthdayy Premium Only**.
				If you are interested in using this and future features now already, you can support the Development on [Patreon](${PREMIUM_URL}).`,
			});

			return replyToInteraction(interaction, { embeds: [embed] });
		}

		if (message.length > EmbedLimits.MaximumDescriptionLength - 500) {
			const embed = generateEmbed({
				title: `${PLUS} Message too long`,
				description: `${ARROW_RIGHT} The message you provided is too long. Please try again with a shorter message.`,
			});

			return replyToInteraction(interaction, { embeds: [embed] });
		}

		const result = await Result.fromAsync(() =>
			this.container.prisma.guild.update({
				where: { guildId: interaction.guildId },
				data: { overviewMessage: message },
			}),
		);

		if (result.isErr()) {
			const embed = generateEmbed({
				title: `${PLUS} Error`,
				description: `${ARROW_RIGHT} An error occured while trying to update the config. Please try again later.`,
			});

			return replyToInteraction(interaction, { embeds: [embed] });
		}

		const embed = generateEmbed({
			title: `${PLUS} Success`,
			description: `${ARROW_RIGHT} You have successfully updated the announcement message.`,
		});

		return replyToInteraction(interaction, { embeds: [embed] });
	}
}
