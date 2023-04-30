import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { Result } from '@sapphire/result';
import { channelMention, ChannelType } from 'discord.js';
import { generateBirthdayList } from '../../../helpers/generate/birthdayList';
import { hasBotChannelPermissions } from '../../../helpers/provide/permission';
import { reply } from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';
import { generateDefaultEmbed, interactionProblem, interactionSuccess } from '../../../lib/utils/embed';

@RegisterSubCommand('config', (builder) =>
	builder
		.setName('overview-channel')
		.setDescription('List all Birthdays on the Server in that channel and updates it on changes')
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription('Channel where the overview should get sent and updated in')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText),
		),
)
export class OverviewChannelCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const channel = interaction.options.getChannel<ChannelType.GuildText>('channel', true);
		const hasWritingPermissionsInChannel = await hasBotChannelPermissions({
			interaction,
			channel,
			permissions: ['ViewChannel', 'SendMessages'],
		});

		if (!hasWritingPermissionsInChannel) {
			return reply(
				interaction,
				interactionProblem(`I don't have permission to send messages in ${channelMention(channel.id)}.`),
			);
		}

		const birthdayList = await generateBirthdayList(1, interaction.guildId);
		const birthdayListEmbed = generateDefaultEmbed(birthdayList.embed);

		const message = await channel.send({
			embeds: [birthdayListEmbed],
			components: birthdayList.components,
		});

		const result = await Result.fromAsync(() =>
			this.container.prisma.guild.update({
				where: { guildId: interaction.guildId },
				data: { overviewMessage: message.id, overviewChannel: channel.id },
			}),
		);

		if (result.isErr()) {
			return reply(
				interaction,
				interactionProblem(`An error occurred while trying to update the config. Please try again later.`),
			);
		}

		return reply(
			interaction,
			interactionSuccess(
				`Successfully set the overview channel to ${channelMention(channel.id)} and the message to ${
					message.url
				}.`,
			),
		);
	}
}
