import { container } from '@sapphire/framework';
import { codeBlock } from '@sapphire/utilities';
import * as Sentry from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import type { APIEmbed } from 'discord.js';
import { DEBUG } from '../../helpers/provide/environment';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import { BotColorEnum } from '../enum/BotColor.enum';
import type { ErrorDefaultSentryScope, ErrorHandlerOptions, RouteApiErrorHandler } from '../types/errorHandling';
import { isDevelopment } from './env';

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
	let errorString = `Command: ${interaction.commandName}\n`;
	if (error.message) errorString += `Error: ${error.message}\n`;
	if (error.cause) errorString += `Cause: ${JSON.stringify(error.cause)}\n`;
	if (error.stack && isDevelopment) errorString += `Stack: ${JSON.stringify(error.stack)}`;

	const errorMessageEmbed = generateDefaultEmbed({
		title: 'An error has occured',
		description: `${codeBlock(`js`, errorString)}`,
		color: BotColorEnum.BIRTHDAYY_DEV,
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
	if (envIsDefined('SENTRY_DSN')) captureCommandErrorToSentry({ interaction, error, sentrySeverityLevel });
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
	if (envIsDefined('SENTRY_DSN')) captureRouteApiErrorToSentry({ request, error, sentrySeverityLevel });
	if (DEBUG) logErrorToContainer({ error, loggerSeverityLevel });
	return response.status(500).json({ error: error.message });
}
