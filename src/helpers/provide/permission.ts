import { container } from '@sapphire/pieces';
import type { Channel, Interaction, PermissionResolvable, User } from 'discord.js';

interface Options {
	interaction: Interaction<'cached'>;
	permissions: PermissionResolvable[];
	channel: string | Channel;
	user: string | User;
}

export async function hasBotGuildPermissions({
	interaction,
	permissions,
}: Omit<Options, 'channel' | 'user'>): Promise<boolean> {
	const bot = await interaction.guild.members.fetchMe();
	return bot.permissions.has(permissions);
}

export async function hasBotChannelPermissions({
	interaction,
	channel,
	permissions,
}: Omit<Options, 'user'>): Promise<boolean> {
	const bot = await interaction.guild.members.fetchMe();
	const channelData = await container.client.channels.fetch(typeof channel === 'string' ? channel : channel.id);
	if (!channelData || !channelData.isTextBased() || channelData.isDMBased()) return false;
	return channelData.permissionsFor(bot).has(permissions);
}

export async function hasUserGuildPermissions({
	interaction,
	user,
	permissions,
}: Omit<Options, 'channel'>): Promise<boolean> {
	const member = await interaction.guild.members.fetch(user);
	return member.permissions.has(permissions);
}

export async function hasUserChannelPermissions({
	interaction,
	user,
	channel,
	permissions,
}: Options): Promise<boolean> {
	const member = await interaction.guild.members.fetch(user);
	const channelData = await container.client.channels.fetch(typeof channel === 'string' ? channel : channel.id);
	if (!channelData || !channelData.isTextBased() || channelData.isDMBased()) return false;
	return channelData.permissionsFor(member).has(permissions);
}
