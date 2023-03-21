import { container } from '@sapphire/framework';
import type { TextBasedChannel } from 'discord.js';

export async function getTextChannel(channel_id: string): Promise<TextBasedChannel> {
	const channel = await container.client.channels.fetch(channel_id);
	if (!channel) {
		throw new Error('Channel not found');
	}
	if (!channel.isTextBased()) {
		throw new Error('Channel is not text based');
	}
	return channel;
}
