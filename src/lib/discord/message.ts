import { isTextChannel } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/pieces';
import type { MessageCreateOptions, MessageEditOptions, MessagePayload } from 'discord.js';

export async function fetchMessage(channel_id: string, message_id: string) {
	const channel = await container.client.channels.fetch(channel_id);
	if (!channel?.isTextBased() || channel.isDMBased()) return null;
	return channel.messages.fetch(message_id);
}

export function sendMessage(channel_id: string, options: string | MessagePayload | MessageCreateOptions) {
	const channel = container.client.channels.resolve(channel_id);
	if (!isTextChannel(channel)) return null;
	return channel.send(options);
}

export async function editMessage(
	channel_id: string,
	message_id: string,
	options: string | MessageEditOptions | MessagePayload
) {
	const message = await fetchMessage(channel_id, message_id);
	return message?.edit(options);
}

export async function sendDMMessage(user_id: string, options: string | MessagePayload | MessageCreateOptions) {
	const user = await container.client.users.fetch(user_id);
	return user.dmChannel?.send(options) ?? user.createDM().then((channel) => channel.send(options));
}
