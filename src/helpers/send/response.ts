import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, InteractionReplyOptions, MessagePayload } from 'discord.js';


/**
 * It replies to an interaction, and if the interaction has already been replied to, it edits the reply
 * instead
 * @param {Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction} interaction -
 * The interaction object that was passed to your command handler.
 * @param {string | MessagePayload | InteractionReplyOptions} options - string | MessagePayload |
 * InteractionReplyOptions
 * @returns A promise that resolves to the message that was sent.
 */
export default async function replyToInteraction(
	interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
	options: string | MessagePayload | InteractionReplyOptions,
) {
	return await interaction[(interaction.replied || interaction.deferred) ? 'editReply' : 'reply'](options);
}
