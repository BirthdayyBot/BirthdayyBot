import thinking from '#lib/discord/thinking';
import { defaultClientPermissions, defaultUserPermissions, hasBotChannelPermissions } from '#lib/types';
import { PrismaErrorCodeEnum, generateDefaultEmbed, interactionProblem, interactionSuccess, reply } from '#utils';
import { generateBirthdayList } from '#utils/birthday';
import { resolveOnErrorCodesPrisma } from '#utils/functions';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions, RequiresUserPermissions } from '@sapphire/decorators';
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
				interactionProblem(`An error occurred while trying to update the config. Please try again later.`),
			);
		}

		return reply(
			interactionSuccess(
				`Successfully set the overview channel to ${channelMention(channel.id)} and the message to ${
					message.url
				}.`,
			),
		);
	}
}
