import { container } from '@sapphire/framework';
import type { GuildChannel, Interaction, PermissionResolvable } from 'discord.js';

export async function hasGuildPermissions(interaction: Interaction, permissions: PermissionResolvable[]): Promise<boolean> {
	const bot_user = await interaction.guild!.members.fetch(interaction.client.user.id);
	return bot_user.permissions.has(permissions);
}

export async function hasChannelPermissions(interaction: Interaction, permissions: PermissionResolvable[], channel_id: string): Promise<boolean> {
	const bot_user = await interaction.guild!.members.fetch(interaction.client.user.id);
	const target_channel = (await container.client.channels.fetch(channel_id)) as GuildChannel;
	const bot_permissions = target_channel.permissionsFor(bot_user);
	return bot_permissions.has(permissions);
}
