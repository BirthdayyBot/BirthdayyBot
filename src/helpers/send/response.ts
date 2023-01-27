import type { Command } from '@sapphire/framework';
import type { InteractionReplyOptions } from 'discord.js';
import { DEBUG } from '../provide/environment';

/**
 * Sends a message to a Discord channel with the given content and optional embeds and components
 *
 * @param interaction
 * @param  args
 * @property {string} content - The content of the message to send
 * @property {Array<Object>} [embeds] - An array of embed objects to include in the message
 * @property {Array<Object>} [components] - An array of components to include in the message
 * @property {boolean} [ephemeral=false] - Whether the message should be an ephemeral message
 *
 */
export default async function replyToInteraction(
	interaction: Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction,
	args: {
		content?: string;
		embeds?: any[];
		components?: any[];
		ephemeral?: boolean;
	}
): Promise<void> {
	const { content, embeds, components, ephemeral } = args;

	const response: InteractionReplyOptions = {
		content: content ?? '',
		embeds: embeds ?? [],
		components: components ?? [],
		ephemeral: ephemeral ?? false
	};

	console.log(DEBUG ? 'ephemeral: ' + response.ephemeral : '');

	if (interaction.replied || interaction.deferred) {
		interaction.editReply(response);
		return;
	}
	try {
		console.log('IsNotRepliedOrDeferred');
		interaction.reply(response);
		console.log(DEBUG ? 'replied' : '');
		return;
	} catch (error) {
		console.warn(error);
		interaction.editReply(response);
		return;
	}
}
