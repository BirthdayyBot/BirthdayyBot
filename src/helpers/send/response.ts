import type { Command } from '@sapphire/framework';
import type { InteractionReplyOptions } from 'discord.js';

/**
 * Sends a message to a Discord channel with the given content and optional embeds and components
 *
 * @param  args
 * @property interaction -
 * @property {string} content - The content of the message to send
 * @property {Array<Object>} [embeds] - An array of embed objects to include in the message
 * @property {Array<Object>} [components] - An array of components to include in the message
 * @property {boolean} [ephemeral=false] - Whether the message should be an ephemeral message
 *
 */
export default async function replyToInteraction(args: {
	interaction: Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction;
	content?: string;
	embeds?: any[];
	components?: any[];
	ephemeral?: boolean;
}): Promise<void> {
	const { interaction, content, embeds, components, ephemeral } = args;

	const response: InteractionReplyOptions = {
		content: content ?? '',
		embeds: embeds ?? [],
		components: components ?? [],
		ephemeral: ephemeral ?? false
	};

	console.log('ephemeral', response.ephemeral);

	if (interaction.replied || interaction.deferred) {
		interaction.editReply(response);
		return;
	}
	interaction.reply(response);
	return;
}
