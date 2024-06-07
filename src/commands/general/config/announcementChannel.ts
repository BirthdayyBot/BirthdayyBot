import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { ChannelType, channelMention } from 'discord.js';
import { reply } from '../../../helpers';
import thinking from '../../../lib/discord/thinking';
import { interactionProblem, interactionSuccess } from '../../../lib/utils/embed';
import { canSendEmbeds } from '@sapphire/discord.js-utilities';

const channelTypes = [
	ChannelType.GuildText,
	ChannelType.GuildAnnouncement,
	ChannelType.GuildForum,
	ChannelType.PublicThread,
	ChannelType.PrivateThread,
	ChannelType.AnnouncementThread,
]as const;

@RegisterSubCommand('config', (builder) =>
	builder
		.setName('announcement-channel')
		.setDescription("Announce if its somebody's birthday today")
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription('Channel where the announcement should get sent')
				.addChannelTypes(...channelTypes)
				.setRequired(true),
		),
)
export class AnnouncementChannelCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const channel = interaction.options.getChannel<typeof channelTypes[number]>('channel', true);

		if (!canSendEmbeds(channel)) {
			return reply(
				interaction,
				interactionProblem(` I don't have permission to send messages in ${channelMention(channel.id)}.`),
			);
		}

		return this.container.prisma.guild
			.update({
				where: { guildId: interaction.guildId },
				data: { announcementChannel: channel.id },
			})
			.then((birthday) => {
				if (!birthday) {
					return reply(
						interaction,
						interactionProblem(
							`An error occurred while trying to update the config. Please try again later.`,
						),
					);
				}
				return reply(
					interaction,
					interactionSuccess(`Successfully set the announcement channel to ${channelMention(channel.id)}.`),
				);
			})
			.catch(() => {
				return reply(
					interaction,
					interactionProblem(`An error occurred while trying to update the config. Please try again later.`),
				);
			});
	}
}
