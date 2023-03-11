import { Command, container } from '@sapphire/framework';
import type { ActionRowData, APIEmbed, InteractionReplyOptions, JSONEncodable, MessageActionRowComponentData } from 'discord.js';
import { DEBUG } from '../provide/environment';

/**
 * Sends a message to a Discord channel with the given content and optional embeds and components
 *
 * @param interaction
 * @param args
 * @property {string} args.content - The content of the message to send
 * @property {JSONEncodable<APIEmbed> | APIEmbed} args.embeds - An array of embed objects to include in the message
 * @property {ActionRowData<MessageActionRowComponentData>} args.components - An array of components to include in the message
 * @property {boolean} args.ephemeral - Whether the message should be an ephemeral message
 * @returns {void}
 *
 */
export default async function replyToInteraction(
    interaction: Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction,
    args: {
		content?: string;
		embeds?: (JSONEncodable<APIEmbed> | APIEmbed)[];
		components?: ActionRowData<MessageActionRowComponentData>[];
		ephemeral?: boolean;
	},
): Promise<void> {
    const { content, embeds, components, ephemeral } = args;

    // Define the response object, which will be used to send the reply to the interaction
    const response: InteractionReplyOptions = {
        content: content ?? '',
        embeds: embeds,
        components: components,
        ephemeral: ephemeral ?? false,
    };

    // If the interaction has already been replied to, or deferred, edit the reply instead
    if (interaction?.replied || interaction?.deferred) {
        container.logger.info('repliedOrDeferred');
        interaction.editReply(response);
        return;
    }

    // If the interaction has not been replied to or deferred, reply to the interaction
    try {
        container.logger.info('IsNotRepliedOrDeferred');
        await interaction.reply(response);
        container.logger.info(DEBUG ? 'replied' : '');
        return;
    } catch (error) {
        // If the interaction has already been replied to or deferred, edit the reply instead
        container.logger.warn(error);
        container.logger.info('editReply');
        await interaction.editReply(response);
        return;
    }
}
