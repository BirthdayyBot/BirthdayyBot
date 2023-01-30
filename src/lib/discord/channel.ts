import { container } from '@sapphire/framework';
import type { TextBasedChannel } from 'discord.js';

export default async function getTextChannel(channel_id: string): Promise<TextBasedChannel> {
	const channel = await container.client.channels.fetch(channel_id);
	if (channel == null || !channel.isTextBased()) {
		throw new Error('Channel is not text based');
	}
	return channel;
}
