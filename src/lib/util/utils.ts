import { type GuildMessage } from '#lib/types';
import { type PreconditionEntryResolvable } from '@sapphire/framework';
import { type TFunction } from '@sapphire/plugin-i18next';
import type { SubcommandMappingArray } from '@sapphire/plugin-subcommands';
import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	Message,
	MessagePayload,
	userMention,
	type Interaction,
	type InteractionEditReplyOptions,
	type InteractionReplyOptions
} from 'discord.js';
import { ClientColor } from './constants.js';

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
export function sendLoadingMessage<T extends GuildMessage | Message>(
	message: T,
	t: TFunction
): Promise<typeof message> {
	const loadingMessages = t('system:loadingMessages', { returnObjects: true }) as string[];
	const embed = new EmbedBuilder().setDescription(pickRandom(loadingMessages)).setColor(ClientColor);
	return message.reply({ embeds: [embed] }) as Promise<T>;
}

export function resolveTarget(interaction: ChatInputCommandInteraction) {
	const user = interaction.options.getUser('user') ?? interaction.user;
	const target = userMention(user.id);
	return { user, options: { target, context: user === interaction.user ? '' : 'target' } };
}

/**
 * Replies to an interaction, or edits the reply if it has already been replied to or deferred.
 * Ensures type safety and correct handling of interactions.
 *
 * @param interaction - The Discord interaction object to reply to.
 * @param options - The options for the reply or edit.
 *
 * @returns A promise that resolves to the reply message or void.
 */
export async function reply(
	interaction: Interaction,
	options: string | MessagePayload | InteractionReplyOptions
): Promise<void> {
	if (!interaction.isRepliable()) {
		throw new Error('This interaction cannot be replied to.');
	}

	if (interaction.replied || interaction.deferred) {
		// Type assertion ensures only `InteractionEditReplyOptions` compatible fields are passed
		const editOptions = options as string | MessagePayload | InteractionEditReplyOptions;
		await interaction.editReply(editOptions);
	} else {
		await interaction.reply(options);
	}
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
			chatInputRun: snakeToCamel(subcommand.name)
		};
	});
}

export function snakeToCamel(str: string) {
	return str.replace(/([-_][a-z])/g, (ltr) => ltr.toUpperCase()).replace(/[^a-zA-Z]/g, '');
}
