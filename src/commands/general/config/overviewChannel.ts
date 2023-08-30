import { defaultClientPermissions, defaultUserPermissions, hasBotChannelPermissions } from '#lib/types';
import { generateDefaultEmbed, interactionProblem, interactionSuccess } from '#utils';
import { generateBirthdayList } from '#utils/birthday';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions, RequiresUserPermissions } from '@sapphire/decorators';
import { ChannelType, channelMention, type PermissionResolvable } from 'discord.js';
import { overviewChannelConfigSubCommand } from './config.js';

@RegisterSubCommand('config', (builder) => overviewChannelConfigSubCommand(builder))
export class OverviewChannelCommand extends Command {
	@RequiresUserPermissions(defaultUserPermissions)
	@RequiresClientPermissions(defaultClientPermissions)
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const channel = interaction.options.getChannel<ChannelType.GuildText>('channel', true);
		const permissions: PermissionResolvable[] = ['ViewChannel', 'SendMessages'];

		if (!hasBotChannelPermissions({ interaction, channel, permissions })) {
			return interactionProblem(interaction, 'commands/config:overviewChannel.cannotPermissions', {
				channel: channelMention(channel.id),
			});
		}

		const birthdayList = await generateBirthdayList(1, interaction.guild);
		const birthdayListEmbed = generateDefaultEmbed(birthdayList.embed);

		const message = await channel.send({
			embeds: [birthdayListEmbed],
			components: birthdayList.components,
		});

		await this.container.prisma.guild.upsert({
			create: { guildId: interaction.guildId, overviewMessage: message.id, overviewChannel: channel.id },
			update: { overviewMessage: message.id, overviewChannel: channel.id },
			where: { guildId: interaction.guildId },
		});

		return interactionSuccess(interaction, 'commands/config:overviewChannel:success', {
			channel: channelMention(channel.id),
			message: message.url,
		});
	}
}
