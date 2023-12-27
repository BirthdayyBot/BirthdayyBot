import { OWNERS } from '#root/config';
import { rootFolder } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import {
	ArgumentError,
	ChatInputCommandErrorPayload,
	Command,
	ContextMenuCommandErrorPayload,
	Events,
	Listener,
	UserError,
} from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { NonNullObject, codeBlock, cutText } from '@sapphire/utilities';
import { captureException } from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import { Colors, CommandInteraction, DiscordAPIError, EmbedBuilder, HTTPError, Message } from 'discord.js';
import type { TFunction } from 'i18next';

const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandError, name: 'ChatInputCommandError' })
export class ChatInputCommandError extends Listener<typeof Events.ChatInputCommandError> {
	private readonly sentry = envIsDefined('SENTRY_URL');

	public async run(
		error: Error,
		{ interaction, command }: ChatInputCommandErrorPayload | ContextMenuCommandErrorPayload,
	) {
		// If the error was a string or an UserError, send it to the user:
		const message = await interaction.fetchReply();
		const t = await fetchT(interaction);
		if (typeof error === 'string') return this.stringError(message, t, error);
		if (error instanceof ArgumentError) return this.argumentError(message, t, error);
		if (error instanceof UserError) return this.userError(message, t, error);

		const { client, logger } = this.container;
		// If the error was an AbortError or an Internal Server Error, tell the user to re-try:
		if (error.name === 'AbortError' || error.message === 'Internal Server Error') {
			logger.warn(`${this.getWarnError(interaction)} (${message.author.id}) | ${error.constructor.name}`);
			return message.edit(t('system:discordAbortError'));
		}

		// Extract useful information about the DiscordAPIError
		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			if (ignoredCodes.includes(Number(error instanceof DiscordAPIError && error.code))) return;
			client.emit(Events.Error, error);
		} else {
			logger.warn(`${this.getWarnError(interaction)} (${message.author.id}) | ${error.constructor.name}`);
		}

		// Send a detailed message:
		await this.sendErrorChannel(message, command, error);

		// Emit where the error was emitted
		logger.fatal(`[COMMAND] ${command.location.full}\n${error.stack || error.message}`);
		try {
			await message.edit(this.generateUnexpectedErrorMessage(interaction, t, error));
		} catch (err) {
			client.emit(Events.Error, err);
		}

		return undefined;
	}

	private generateUnexpectedErrorMessage(interaction: CommandInteraction, t: TFunction, error: Error) {
		if (OWNERS.includes(interaction.user.id)) return codeBlock('js', error.stack!);
		if (!this.sentry) return t('events/errors:unexpectedError');

		try {
			const report = captureException(error, { tags: { command: interaction.command?.name } });
			return t('events/errors:unexpectedErrorWithContext', { report });
		} catch (error) {
			this.container.client.emit(Events.Error, error);
			return t('events/errors:string');
		}
	}

	private stringError(message: Message, t: TFunction, error: string) {
		return this.alert(message, t('events/errors:string', { mention: message.author.id, message: error }));
	}

	private argumentError(message: Message, t: TFunction, error: ArgumentError<unknown>) {
		const argument = error.argument.name;
		const parameter = error.parameter.replaceAll('`', '῾');
		return this.alert(
			message,
			t(error.identifier, {
				...error,
				...(error.context as NonNullObject),
				argument,
				parameter: cutText(parameter, 50),
			}),
		);
	}

	private userError(message: Message, t: TFunction, error: UserError) {
		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(error.context), 'silent')) return;

		return this.alert(message, t(error.identifier, error.context as Record<string, unknown>));
	}

	private alert(message: Message, content: string) {
		return message.edit(content);
	}

	private async sendErrorChannel(message: Message, command: Command, error: Error) {
		const webhook = this.container.client.webhookError;
		if (webhook === null) return;

		const lines = [this.getLinkLine(message.url), this.getCommandLine(command), this.getErrorLine(error)];

		// If it's a DiscordAPIError or a HTTPError, add the HTTP path and code lines after the second one.
		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			lines.splice(2, 0, this.getPathLine(error), this.getCodeLine(error));
		}

		const embed = new EmbedBuilder().setDescription(lines.join('\n')).setColor(Colors.Red).setTimestamp();
		try {
			await webhook.send({ embeds: [embed] });
		} catch (err) {
			this.container.client.emit(Events.Error, err);
		}
	}

	/**
	 * Formats a message url line.
	 * @param url The url to format.
	 */
	private getLinkLine(url: string): string {
		return `[**Jump to Message!**](${url})`;
	}

	/**
	 * Formats a command line.
	 * @param command The command to format.
	 */
	private getCommandLine(command: Command): string {
		return `**Command**: ${command.location.full.slice(rootFolder.length)}`;
	}

	/**
	 * Formats an error path line.
	 * @param error The error to format.
	 */
	private getPathLine(error: DiscordAPIError | HTTPError): string {
		return `**Path**: ${error.method.toUpperCase()} ${new URL(error.url).pathname}`;
	}

	/**
	 * Formats an error code line.
	 * @param error The error to format.
	 */
	private getCodeLine(error: DiscordAPIError | HTTPError): string {
		return `**Code**: ${error.status}`;
	}

	/**
	 * Formats an error codeblock.
	 * @param error The error to format.
	 */
	private getErrorLine(error: Error): string {
		return `**Error**: ${codeBlock('js', error.stack || error.toString())}`;
	}

	private getWarnError(message: CommandInteraction) {
		return `ERROR: /${message.guild ? `${message.guild.id}/${message.channelId}` : `DM/${message.user.id}`}/${
			message.id
		}`;
	}
}

@ApplyOptions<Listener.Options>({ event: Events.ContextMenuCommandError, name: 'ContextMenuCommandError' })
export class ContextMenuCommandError extends Listener<typeof Events.ContextMenuCommandError> {
	public async run(error: Error, payload: ContextMenuCommandErrorPayload) {
		return ChatInputCommandError.prototype.run(error, payload);
	}
}
