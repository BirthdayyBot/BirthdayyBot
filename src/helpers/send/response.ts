import type { ChatInputOrContextMenuCommandInteraction } from '@sapphire/discord.js-utilities';
import type { InteractionEditReplyOptions, InteractionReplyOptions, MessagePayload } from 'discord.js';

/**
 * It replies to an interaction, and if the interaction has already been replied to, it edits the reply instead
 * @param  interaction - The interaction object that was passed to your command handler.
 * @param  options - The options to pass to the reply method.
 * @returns A promise that resolves to the message that was sent.
 */
export async function reply(
	interaction: ChatInputOrContextMenuCommandInteraction,
	options: string | InteractionReplyOptions,
) {
	if (interaction.replied || interaction.deferred) {
		const editOptions: string | MessagePayload | InteractionEditReplyOptions =
			typeof options === 'string' ? options : { ...options };
		return interaction.editReply(editOptions);
	}
	return interaction.reply(options);
}
