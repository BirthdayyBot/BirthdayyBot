import { createFunctionPrecondition } from '@sapphire/decorators';
import {
	Command,
	container,
	type ChatInputCommandSuccessPayload,
	type ContextMenuCommandSuccessPayload,
	type MessageCommandSuccessPayload,
	ApplicationCommandRegistry,
} from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { cyan } from 'colorette';
import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	Guild,
	Message,
	MessagePayload,
	User,
	userMention,
	type APIUser,
	type InteractionReplyOptions,
	CommandInteraction,
	SlashCommandBuilder,
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

export function logSuccessCommand(
	payload: ContextMenuCommandSuccessPayload | ChatInputCommandSuccessPayload | MessageCommandSuccessPayload,
): void {
	let successLoggerData: ReturnType<typeof getSuccessLoggerData>;

	if ('interaction' in payload) {
		successLoggerData = getSuccessLoggerData(payload.interaction.guild, payload.interaction.user, payload.command);
	} else {
		successLoggerData = getSuccessLoggerData(payload.message.guild, payload.message.author, payload.command);
	}

	container.logger.debug(
		`${successLoggerData.shard} - ${successLoggerData.commandName} ${successLoggerData.author} ${successLoggerData.sentAt}`,
	);
}

export function getSuccessLoggerData(guild: Guild | null, user: User, command: Command) {
	const shard = getShardInfo(guild?.shardId ?? 0);
	const commandName = getCommandInfo(command);
	const author = getAuthorInfo(user);
	const sentAt = getGuildInfo(guild);

	return { shard, commandName, author, sentAt };
}

export function parseBoolean(bool: string | boolean): boolean {
	if (typeof bool === 'boolean') return bool;
	return ['true', 't', '1', 'yes', 'y'].includes(bool.toLowerCase());
}

function getShardInfo(id: number) {
	return `[${cyan(id.toString())}]`;
}

function getCommandInfo(command: Command) {
	return cyan(command.name);
}

function getAuthorInfo(author: User | APIUser) {
	return `${author.username}[${cyan(author.id)}]`;
}

function getGuildInfo(guild: Guild | null) {
	if (guild === null) return 'Direct Messages';
	return `${guild.name}[${cyan(guild.id)}]`;
}

export function resolveTarget(interaction: ChatInputCommandInteraction) {
	let context: string | undefined;
	const user = interaction.options.getUser('user') ?? interaction.user;
	const target = userMention(user.id);
	const targetIsNotAuthor = user !== interaction.user;
	if (targetIsNotAuthor) context = 'target';
	return { user, options: { target, context } };
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
