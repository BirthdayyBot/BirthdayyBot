import { defaultClientPermissions, defaultUserPermissions, hasBotChannelPermissions } from '#lib/types/permissions';
import { interactionProblem, interactionSuccess } from '#utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions, RequiresUserPermissions } from '@sapphire/decorators';
import { ChannelType, channelMention, type PermissionResolvable } from 'discord.js';
import { announcementChannelConfigSubCommand } from './config.js';

@RegisterSubCommand('config', (builder) => announcementChannelConfigSubCommand(builder))
export class UserCommand extends Command {
	@RequiresClientPermissions(defaultClientPermissions)
	@RequiresUserPermissions(defaultUserPermissions.add('ManageGuild'))
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);
		const permissions: PermissionResolvable[] = ['ViewChannel', 'SendMessages'];
		const options = { channel: channelMention(channel.id) };

		if (!hasBotChannelPermissions({ interaction, channel, permissions })) {
			return interactionProblem(interaction, `commands/config:announcementChannel.cannotPermissions`, options);
		}

		await this.container.prisma.guild.upsert({
			where: { guildId: interaction.guildId },
			create: { guildId: interaction.guildId, announcementChannel: channel.id },
			update: { announcementChannel: channel.id },
		});

		return interactionSuccess(interaction, `commands/config:announcementChannel.success`, options);
	}
}
