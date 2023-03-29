import * as Sentry from '@sentry/node';
import { container } from '@sapphire/framework';
import type { AnySelectMenuInteraction, ButtonInteraction, CommandInteraction } from 'discord.js';
import { codeBlock } from '@sapphire/utilities';
import generateEmbed from '../../helpers/generate/embed';

type LoggerWithoutLogLevelAndWrite = Omit<typeof container.logger, 'LogLevel' | 'write' | 'has'>;

interface ErrorHandlingOptions {
    interaction: ButtonInteraction | AnySelectMenuInteraction | CommandInteraction;
    error: Error;
    loggerSeverity: keyof LoggerWithoutLogLevelAndWrite;
    sentrySeverity: Sentry.SeverityLevel;
}

class CustomError extends Error {
	public id: string = Math.random().toString(36).substr(2, 9);
	public name: string;
	public message: string;
	public stack?: string;
	public cause?: unknown;
	public source?: string;
	public guildId?: string;
	public userId?: string;

	constructor(error: Error, source?: string, guildId?: string, userId?: string) {
		super(error.message);
		this.name = error.name;
		this.message = error.message;
		this.stack = error.stack;
		this.cause = error.cause;
		this.source = source;
		this.guildId = guildId;
		this.userId = userId;
	}
}

function logErrorToContainer(error: CustomError, severity: ErrorHandlingOptions['loggerSeverity']): void {
	container.logger[severity](error);
}

function captureErrorToSentry(error: CustomError, severity: ErrorHandlingOptions['sentrySeverity']): void {
	Sentry.withScope((scope) => {
		scope.setExtra('error', {
			id: error.id,
			name: error.name,
			message: error.message,
			stack: error.stack,
			cause: error.cause,
			source: error.source,
			guildId: error.guildId,
			userId: error.userId,
			interaction: error.stack ? error.stack.split('\n')[1].trim() : undefined,
		});
		scope.setLevel(severity);
		Sentry.captureException(error);
	});
}

function sendErrorMessageToUser(interaction: ErrorHandlingOptions['interaction'], error: CustomError): void {
	const errorMessageEmbed = generateEmbed({
		title: 'An error has occured',
		description: codeBlock('shell', `ID: ${error.id}\nCommande : ${
			interaction.isChatInputCommand() ? interaction.commandName : 'Unknown'}\nErreur : ${error.message}`),
		color: '#ff0000',
	});

	if (interaction.replied || interaction.deferred) {
		interaction.editReply({ embeds: [errorMessageEmbed] }).catch(
			() => interaction.user.send({ embeds: [errorMessageEmbed] }),
		);
	} else {
		interaction.reply({ embeds: [errorMessageEmbed], ephemeral: true }).catch(
			() => interaction.user.send({ embeds: [errorMessageEmbed] }),
		);
	}

	container.webhook ? container.webhook.send({ embeds: [errorMessageEmbed] }) : null;
}

export function handleErrorAndSendToUser({ interaction, error, loggerSeverity, sentrySeverity }: ErrorHandlingOptions): void {
	const customError = new CustomError(error, interaction.guildId ?? '', interaction.user.id);
	logErrorToContainer(customError, loggerSeverity);
	captureErrorToSentry(customError, sentrySeverity);
	sendErrorMessageToUser(interaction, customError);
}
