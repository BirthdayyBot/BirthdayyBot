import { container } from '@sapphire/framework';
import type { Channel } from 'discord.js';
import { getTextChannel } from './channel';
import { DEBUG } from '../../helpers/provide/environment';

export async function fetchMessage(channel_id: string, message_id: string) {
	const channel: Channel | null = await container.client.channels.fetch(channel_id);
	if (channel == null || !channel.isTextBased()) {
		throw new Error('Channel is not text based');
	}
	try {
		return await channel.messages.fetch(message_id);
	} catch (error) {
		throw new Error('Message not found');
	}
}

export async function sendMessage(channel_id: string, options: { content?: string; embeds?: any[]; components?: any[] }) {
	const channel = await getTextChannel(channel_id);
	return await channel.send(options);
}

export async function editMessage(channel_id: string, message_id: string, options: { content?: string; embeds?: any[]; components?: any[] }) {
	const message = await fetchMessage(channel_id, message_id);
	return await message.edit(options);
}

export async function sendDMMessage(user_id: string, options: { content?: string; embeds?: any[]; components?: any[] }) {
	const user = await container.client.users.fetch(user_id);
	try {
		return await user.send(options);
	} catch (error) {
		if (DEBUG) container.logger.error(error);
		container.logger.error('Couldn\'t send DM to user with id: ' + user_id);
		return;
	}
}
