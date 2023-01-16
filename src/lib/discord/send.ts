import { container } from '@sapphire/framework';
import type { APIEmbed, Message } from 'discord.js';

export async function message(channel_id: string, content: string, embeds: APIEmbed[] = [], components: [] = []): Promise<Message> {
	const channel = container.client.channels.cache.get(channel_id);
	if (!channel) throw new Error('channel not found');
	if (!channel.isTextBased()) throw new Error('channel is not text based');
	return await channel.send({ content, embeds: embeds, components: components });
}

export async function text(channel_id: string, content: string): Promise<Message> {
	const channel = container.client.channels.cache.get(channel_id);
	if (!channel) throw new Error('channel not found');
	if (!channel.isTextBased()) throw new Error('channel is not text based');
	return await channel.send(content);
}

export async function embed(channel_id: string, embed: APIEmbed): Promise<Message> {
	const channel = container.client.channels.cache.get(channel_id);
	if (!channel) throw new Error('channel not found');
	if (!channel.isTextBased()) throw new Error('channel is not text based');
	return await channel.send({
		content: '',
		embeds: [embed]
	});
}

export async function embeds(channel_id: string, embeds: APIEmbed[]): Promise<Message> {
	const channel = container.client.channels.cache.get(channel_id);
	if (!channel) throw new Error('channel not found');
	if (!channel.isTextBased()) throw new Error('channel is not text based');
	return await channel.send({
		content: '',
		embeds: embeds
	});
}
