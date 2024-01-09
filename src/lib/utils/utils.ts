import { type PreconditionEntryResolvable } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { SubcommandMappingArray } from '@sapphire/plugin-subcommands';
import {
	ChatInputCommandInteraction,
	CommandInteraction,
	EmbedBuilder,
	Message,
	MessagePayload,
	userMention,
	type InteractionReplyOptions,
} from 'discord.js';

/**
 * Picks a random item from an array
 * @param array - The array to pick a random item from
 * @example
 * const randomEntry = pickRandom([1, 2, 3, 4]) // 1
 */
export function pickRandom<T>(array: readonly T[]): T {
	const { length } = array;
	return array[Math.floor(Math.random() * length)];
}

/**
 * Sends a loading message to the current channel
 * @param message - The message data for which to send the loading message
 */
export function sendLoadingMessage(message: Message): Promise<typeof message> {
	const RandomLoadingMessage = ['Loading...', 'Please wait...', 'Fetching...', 'Processing...'];
	return send(message, {
		embeds: [new EmbedBuilder().setDescription(pickRandom(RandomLoadingMessage)).setColor('#FF0000')],
	});
}

export function resolveTarget(interaction: ChatInputCommandInteraction) {
	const user = interaction.options.getUser('user') ?? interaction.user;
	const target = userMention(user.id);
	return { user, options: { target, context: user === interaction.user ? '' : 'target' } };
}

/**
 * It replies to an interaction, and if the interaction has already been replied to, it edits the reply instead
 * @param  interaction - The interaction object that was passed to your command handler.
 * @param  options - The options to pass to the reply method.
 * @returns A promise that resolves to the message that was sent.
 */
export function reply(interaction: CommandInteraction, options: string | MessagePayload | InteractionReplyOptions) {
	return interaction[interaction.replied || interaction.deferred ? 'editReply' : 'reply'](options);
}

export interface Mapps {
	name: string;
	preconditions: readonly PreconditionEntryResolvable[];
}

export function createSubcommandMappings(...subcommands: Array<string | Mapps>): SubcommandMappingArray {
	return subcommands.map((subcommand) => {
		if (typeof subcommand === 'string') return { name: subcommand, chatInputRun: snakeToCamel(subcommand) };
		return {
			name: subcommand.name,
			preconditions: subcommand.preconditions,
			chatInputRun: snakeToCamel(subcommand.name),
		};
	});
}

export function snakeToCamel(str: string) {
	return str.replace(/([-_][a-z])/g, (ltr) => ltr.toUpperCase()).replace(/[^a-zA-Z]/g, '');
}
