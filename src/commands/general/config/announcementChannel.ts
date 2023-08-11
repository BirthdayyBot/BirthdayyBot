import thinking from '#lib/discord/thinking';
import { PrismaErrorCodeEnum } from '#lib/types';
import { interactionProblem, interactionSuccess } from '#lib/utils/embed';
import { resolveOnErrorCodesPrisma } from '#lib/utils/functions';
import { reply } from '#lib/utils/utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { ChannelType, channelMention } from 'discord.js';

@RegisterSubCommand('config', (builder) =>
	builder
		.setName('announcement-channel')
		.setDescription("Announce if its somebody's birthday today")
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription('Channel where the announcement should get sent')
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(true),
		),
)
export class AnnouncementChannelCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);
		const guildClient = await interaction.guild.members.fetchMe();
		const hasPermissionInNewChannel = channel.permissionsFor(guildClient).has(['ViewChannel', 'SendMessages']);

		if (!hasPermissionInNewChannel) {
			return reply(
				interaction,
				interactionProblem(` I don't have permission to send messages in ${channelMention(channel.id)}.`),
			);
		}

		const birthday = await resolveOnErrorCodesPrisma(
			this.container.prisma.guild.update({
				where: { guildId: interaction.guildId },
				data: { announcementChannel: channel.id },
			}),
			PrismaErrorCodeEnum.NotFound,
		);

		if (isNullOrUndefinedOrEmpty(birthday)) {
			return reply(
				interaction,
				interactionProblem(`An error occurred while trying to update the config. Please try again later.`),
			);
		}

		return reply(
			interaction,
			interactionSuccess(`Successfully set the announcement channel to ${channelMention(channel.id)}.`),
		);
	}
}
