import { container } from '@sapphire/framework';
import type { Channel, Message } from 'discord.js';
import { getTextChannel } from './channel';

export async function fetchMessage(channel_id: string, message_id: string) {
	const channel: Channel | null = await container.client.channels.fetch(channel_id);
	if (channel == null || !channel.isTextBased()) {
		throw new Error('Channel is not text based');
	}
	await channel.messages.fetch(message_id);
	const message: Message = await channel.messages.fetch(message_id);
	return message;
}

export async function sendMessage(channel_id: string, options: { content?: string; embeds: any[]; components?: any[] }) {
	const channel = await getTextChannel(channel_id);
	return await channel.send(options);
}
