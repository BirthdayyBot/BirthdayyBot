import { container } from '@sapphire/pieces';

export async function getTextChannel(channel_id: string) {
	const channel = await container.client.channels.fetch(channel_id);
	return channel?.isTextBased() ? channel : null;
}
