import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { Result } from '@sapphire/result';
import { channelMention } from 'discord.js';
import generateEmbed from '../../../helpers/generate/embed';
import { ARROW_RIGHT, FAIL, SUCCESS } from '../../../helpers/provide/environment';
import replyToInteraction from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';

@RegisterSubCommand('config', (builder) =>
	builder
		.setName('announcement-channel')
		.setDescription("Announce if its somebody's birthday today")
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription('Channel where the announcement should get sent')
				.setRequired(true),
		),
)
export class AnnouncementChannelCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const channel = interaction.options.getChannel('channel', true);
		const guildClient = await interaction.guild.members.fetchMe();
		const hasPermissionInNewChannel = channel.permissionsFor(guildClient).has(['ViewChannel', 'SendMessages']);

		if (!hasPermissionInNewChannel) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failure`,
						description: `${ARROW_RIGHT} I don't have the permission to see & send messages in ${channelMention(
							channel.id,
						)}.`,
					}),
				],
			});
		}

		const result = await Result.fromAsync(() =>
			this.container.prisma.guild.update({
				where: { guildId: interaction.guildId },
				data: { announcementChannel: channel.id },
			}),
		);

		if (result.isErr()) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failure`,
						description: `${ARROW_RIGHT} An error occurred while updating the database.`,
					}),
				],
			});
		}

		return replyToInteraction(interaction, {
			embeds: [
				generateEmbed({
					title: `${SUCCESS} Success`,
					description: `${ARROW_RIGHT} The announcement channel has been set to ${channelMention(
						channel.id,
					)}.`,
				}),
			],
		});
	}
}
