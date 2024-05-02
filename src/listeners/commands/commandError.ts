import { isGuildMessage } from '#lib/utils/common/guards';
import { OWNERS } from '#root/config';
import { rootFolder } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import {
	ArgumentError,
	type ChatInputCommandErrorPayload,
	Command,
	type ContextMenuCommandErrorPayload,
	Events,
	Listener,
	UserError,
	container
} from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { type NonNullObject, codeBlock, cutText } from '@sapphire/utilities';
import { captureException } from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import { Colors, CommandInteraction, DiscordAPIError, EmbedBuilder, HTTPError, Message } from 'discord.js';
import type { TFunction } from 'i18next';

const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandError, name: 'ChatInputCommandError' })
export class ChatInputCommandError extends Listener<typeof Events.ChatInputCommandError> {
	public async run(error: Error, payload: ChatInputCommandErrorPayload | ContextMenuCommandErrorPayload) {
		return sharedRun(error, payload);
	}
}

@ApplyOptions<Listener.Options>({ event: Events.ContextMenuCommandError, name: 'ContextMenuCommandError' })
export class ContextMenuCommandError extends Listener<typeof Events.ContextMenuCommandError> {
	public async run(error: Error, payload: ContextMenuCommandErrorPayload) {
		return sharedRun(error, payload);
	}
}

async function sharedRun(
	error: Error,
	{ interaction, command }: ChatInputCommandErrorPayload | ContextMenuCommandErrorPayload
) {
	// If the error was a string or an UserError, send it to the user:
	const message = await interaction.fetchReply();
	const t = await fetchT(interaction);
	if (typeof error === 'string') return stringError(message, t, error);
	if (error instanceof ArgumentError) return argumentError(message, t, error);
	if (error instanceof UserError) return userError(message, t, error);

	const { client, logger } = container;
	// If the error was an AbortError or an Internal Server Error, tell the user to re-try:
	if (error.name === 'AbortError' || error.message === 'Internal Server Error') {
		logger.warn(`${getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
		return message.edit(t('system:discordAbortError'));
	}

	// Extract useful information about the DiscordAPIError
	if (error instanceof DiscordAPIError || error instanceof HTTPError) {
		if (ignoredCodes.includes(Number(error instanceof DiscordAPIError && error.code))) return;
		client.emit(Events.Error, error);
	} else {
		logger.warn(`${getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
	}

	// Send a detailed message:
	await sendErrorChannel(message, command, error);

	// Emit where the error was emitted
	logger.fatal(`[COMMAND] ${command.location.full}\n${error.stack || error.message}`);
	try {
		await message.edit(generateUnexpectedErrorMessage(interaction, t, error));
	} catch (err) {
		client.emit(Events.Error, err);
	}

	return undefined;
}

function generateUnexpectedErrorMessage(interaction: CommandInteraction, t: TFunction, error: Error) {
	if (OWNERS.includes(interaction.user.id)) return codeBlock('js', error.stack!);
	if (!envIsDefined('SENTRY_URL')) return t('events/errors:unexpectedError');

	try {
		const report = captureException(error, { tags: { command: interaction.command?.name } });
		return t('events/errors:unexpectedErrorWithContext', { report });
	} catch (error) {
		container.client.emit(Events.Error, error);
		return t('events/errors:string');
	}
}

function stringError(message: Message, t: TFunction, error: string) {
	return alert(message, t('events/errors:string', { mention: message.author.id, message: error }));
}

function argumentError(message: Message, t: TFunction, error: ArgumentError<unknown>) {
	const argument = error.argument.name;
	const parameter = error.parameter.replaceAll('`', '῾');
	return alert(
		message,
		t(error.identifier, {
			...error,
			...(error.context as NonNullObject),
			argument,
			parameter: cutText(parameter, 50)
		})
	);
}

function userError(message: Message, t: TFunction, error: UserError) {
	// `context: { silent: true }` should make UserError silent:
	// Use cases for this are for example permissions error when running the `eval` command.
	if (Reflect.get(Object(error.context), 'silent')) return;

	return alert(message, t(error.identifier, error.context as Record<string, unknown>));
}

function alert(message: Message, content: string) {
	return message.edit(content);
}

async function sendErrorChannel(message: Message, command: Command, error: Error) {
	const webhook = container.client.webhookError;
	if (webhook === null) return;

	const lines = [getLinkLine(message.url), getCommandLine(command), getErrorLine(error)];

	// If it's a DiscordAPIError or a HTTPError, add the HTTP path and code lines after the second one.
	if (error instanceof DiscordAPIError || error instanceof HTTPError) {
		lines.splice(2, 0, getPathLine(error), getCodeLine(error));
	}

	const embed = new EmbedBuilder().setDescription(lines.join('\n')).setColor(Colors.Red).setTimestamp();
	try {
		await webhook.send({ embeds: [embed] });
	} catch (err) {
		container.client.emit(Events.Error, err);
	}
}

/**
 * Formats a message url line.
 * @param url The url to format.
 */
function getLinkLine(url: string): string {
	return `[**Jump to Message!**](${url})`;
}

/**
 * Formats a command line.
 * @param command The command to format.
 */
function getCommandLine(command: Command): string {
	return `**Command**: ${command.location.full.slice(rootFolder.length)}`;
}

/**
 * Formats an error path line.
 * @param error The error to format.
 */
function getPathLine(error: DiscordAPIError | HTTPError): string {
	return `**Path**: ${error.method.toUpperCase()} ${new URL(error.url).pathname}`;
}

/**
 * Formats an error code line.
 * @param error The error to format.
 */
function getCodeLine(error: DiscordAPIError | HTTPError): string {
	return `**Code**: ${error.status}`;
}

/**
 * Formats an error codeblock.
 * @param error The error to format.
 */
function getErrorLine(error: Error): string {
	return `**Error**: ${codeBlock('js', error.stack || error.toString())}`;
}

function getWarnError(message: Message) {
	return `ERROR: /${
		isGuildMessage(message) ? `${message.guild.id}/${message.channelId}` : `DM/${message.author.id}`
	}/${message.id}`;
}
