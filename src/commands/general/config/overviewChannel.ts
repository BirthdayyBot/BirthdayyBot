import thinking from '#lib/discord/thinking';
import {
	defaultUserPermissions,
	defaultClientPermissions,
	PrismaErrorCodeEnum,
	hasBotChannelPermissions,
} from '#lib/types';
import { generateBirthdayList } from '#lib/utils/birthday';
import { interactionProblem, generateDefaultEmbed, interactionSuccess } from '#lib/utils/embed';
import { resolveOnErrorCodesPrisma } from '#lib/utils/functions';
import { reply } from '#lib/utils/utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresUserPermissions, RequiresClientPermissions } from '@sapphire/decorators';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { ChannelType, channelMention } from 'discord.js';

@RegisterSubCommand('config', (builder) =>
	builder
		.setName('overview-channel')
		.setDescription('List all Birthdays on the Server in that channel and updates it on changes')
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription('Channel where the overview should get sent and updated in')
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(true),
		),
)
export class OverviewChannelCommand extends Command {
	@RequiresUserPermissions(defaultUserPermissions)
	@RequiresClientPermissions(defaultClientPermissions)
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

		const birthdayList = await generateBirthdayList(1, interaction.guild);
		const birthdayListEmbed = generateDefaultEmbed(birthdayList.embed);

		const message = await channel.send({
			embeds: [birthdayListEmbed],
			components: birthdayList.components,
		});

		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.guild.update({
				where: { guildId: interaction.guildId },
				data: { overviewMessage: message.id, overviewChannel: channel.id },
			}),
			PrismaErrorCodeEnum.NotFound,
		);

		if (isNullOrUndefinedOrEmpty(result)) {
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
