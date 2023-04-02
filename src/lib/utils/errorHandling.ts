import * as Sentry from '@sentry/node';
import { container } from '@sapphire/framework';
import type { APIEmbed } from 'discord.js';
import { codeBlock } from '@sapphire/utilities';
import generateEmbed from '../../helpers/generate/embed';
import { DEBUG, SENTRY_DSN } from '../../helpers/provide/environment';
import type { ErrorDefaultSentryScope, ErrorHandlerOptions, RouteApiErrorHandler } from '../types/errorHandling';

export function logErrorToContainer({
	error,
	loggerSeverityLevel,
}: Pick<ErrorHandlerOptions, 'error' | 'loggerSeverityLevel'>): void {
	container.logger[loggerSeverityLevel](error);
}

export function defaultScope({ scope, error, sentrySeverityLevel }: ErrorDefaultSentryScope) {
	scope.setFingerprint([error.name, error.message]),
		scope.setTransactionName(error.name),
		scope.setLevel(sentrySeverityLevel);
	return Sentry.captureException(error);
}

export function captureCommandErrorToSentry({
	interaction,
	error,
	sentrySeverityLevel,
}: Omit<ErrorHandlerOptions, 'loggerSeverityLevel'>): void {
	return Sentry.withScope((scope) => {
		scope.setTags({
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			userId: interaction.member?.user.id ?? interaction.user.id,
		});
		return defaultScope({ scope, error, sentrySeverityLevel });
	});
}

export function captureRouteApiErrorToSentry({
	request,
	error,
	sentrySeverityLevel,
}: Omit<RouteApiErrorHandler, 'response' | 'loggerSeverityLevel'>): void {
	return Sentry.withScope((scope) => {
		scope.setTag('method', request.method);
		return defaultScope({ scope, error, sentrySeverityLevel });
	});
}

function sendErrorMessageToUser({ interaction, error }: Pick<ErrorHandlerOptions, 'interaction' | 'error'>): void {
	const errorMessageEmbed = generateEmbed({
		title: 'An error has occured',
		description: codeBlock(
			'shell',
			`Command : ${interaction.isChatInputCommand() ? interaction.commandName : 'Unknown'}\nErreur : ${
				error.message
			}`,
		),
		color: 'RED',
	});

	if (interaction.replied || interaction.deferred) {
		interaction
			.editReply({ embeds: [errorMessageEmbed] })
			.catch(() => interaction.user.send({ embeds: [errorMessageEmbed] }));
	} else {
		interaction
			.reply({ embeds: [errorMessageEmbed], ephemeral: true })
			.catch(() => interaction.user.send({ embeds: [errorMessageEmbed] }));
	}

	sendErrorMessageToAdmin(errorMessageEmbed);
}

function sendErrorMessageToAdmin(embed: APIEmbed): void {
	const { webhook } = container;
	if (webhook === null) return;
	void webhook.send({ embeds: [embed] });
}

export function handleCommandErrorAndSendToUser({
	interaction,
	error,
	loggerSeverityLevel,
	sentrySeverityLevel,
}: ErrorHandlerOptions): void {
	if (SENTRY_DSN) captureCommandErrorToSentry({ interaction, error, sentrySeverityLevel });
	if (DEBUG) logErrorToContainer({ error, loggerSeverityLevel });
	return sendErrorMessageToUser({ interaction, error });
}

export function handleRouteApiError({
	request,
	response,
	error,
	loggerSeverityLevel,
	sentrySeverityLevel,
}: RouteApiErrorHandler): void {
	if (SENTRY_DSN) captureRouteApiErrorToSentry({ request, error, sentrySeverityLevel });
	if (DEBUG) logErrorToContainer({ error, loggerSeverityLevel });
	return response.status(500).json({ error: error.message });
}
