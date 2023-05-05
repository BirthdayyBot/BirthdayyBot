import { container } from '@sapphire/pieces';
import type { TextBasedChannel, VoiceBasedChannel } from 'discord.js';

export async function getTextChannel(channel_id: string): Promise<TextBasedChannel | null> {
	const channel = await container.client.channels.fetch(channel_id);
	return channel?.isTextBased() ? channel : null;
}

export async function getVoiceChannel(channel_id: string): Promise<VoiceBasedChannel | null> {
	const channel = await container.client.channels.fetch(channel_id);
	return channel?.isVoiceBased() ? channel : null;
}
