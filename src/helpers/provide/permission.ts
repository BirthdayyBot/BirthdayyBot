import { container } from '@sapphire/pieces';
import type { Channel, Interaction, PermissionResolvable, User } from 'discord.js';

interface Options {
	interaction: Interaction<'cached'>;
	permissions: PermissionResolvable[];
	channel: string | Channel;
	user: string | User;
}

export async function hasGuildPermissions({ interaction, permissions }: Omit<Options, 'channel' | 'user'>): Promise<boolean> {
	const client = await interaction.guild.members.fetch(interaction.client.user.id);
	return client.permissions.has(permissions);
}

export async function hasChannelPermissions({ interaction, channel: _channel, permissions }: Omit<Options, 'user'>): Promise<boolean> {
	const member = await interaction.guild.members.fetch(interaction.client.user.id);
	const channel = await container.client.channels.fetch(typeof _channel === 'string' ? _channel : _channel.id);
	if (!channel || !channel.isTextBased() || channel.isDMBased()) return false;
	return channel.permissionsFor(member).has(permissions);
}

export async function hasUserGuildPermissions({ interaction, user, permissions }: Omit<Options, 'channel'>): Promise<boolean> {
	const member = await interaction.guild.members.fetch(user);
	return member.permissions.has(permissions);
}

export async function hasUserChannelPermissions({ interaction, user, channel: channelID, permissions }: Options): Promise<boolean> {
	const member = await interaction.guild.members.fetch(user);
	const target_channel = await container.client.channels.fetch(typeof channelID === 'string' ? channelID : channelID.id);
	if (!target_channel || !target_channel.isTextBased() || target_channel.isDMBased()) return false;
	return target_channel.permissionsFor(member).has(permissions);
}

