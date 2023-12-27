import { type ErrorDefaultSentryScope, type ErrorHandlerOptions, type RouteApiErrorHandler } from '#lib/types';
import { BrandingColors } from '#utils/constants';
import { generateDefaultEmbed } from '#utils/embed';
import { isDevelopment } from '#utils/env';
import { DEBUG } from '#utils/environment';
import { reply } from '#utils/utils';
import { container } from '@sapphire/framework';
import { captureException, withScope } from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import { codeBlock, type APIEmbed } from 'discord.js';

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
	return captureException(error);
}

export function captureCommandErrorToSentry({
	interaction,
	error,
	sentrySeverityLevel,
}: Omit<ErrorHandlerOptions, 'loggerSeverityLevel'>): void {
	return withScope((scope) => {
		scope.setTags({
			channelId: interaction.channelId,
			guildId: interaction.guildId,
			userId: interaction.member?.user.id ?? interaction.user.id,
		});
		return defaultScope({ error, scope, sentrySeverityLevel });
	});
}

export function captureRouteApiErrorToSentry({
	request,
	error,
	sentrySeverityLevel,
}: Omit<RouteApiErrorHandler, 'response' | 'loggerSeverityLevel'>): void {
	return withScope((scope) => {
		scope.setTag('method', request.method);
		return defaultScope({ error, scope, sentrySeverityLevel });
	});
}

function sendErrorMessageToUser({ interaction, error }: Pick<ErrorHandlerOptions, 'interaction' | 'error'>) {
	let errorString = `Command: ${interaction.commandName}\n`;
	if (error.message) errorString += `Error: ${error.message}\n`;
	if (error.cause) errorString += `Cause: ${JSON.stringify(error.cause)}\n`;
	if (error.stack && isDevelopment) errorString += `Stack: ${JSON.stringify(error.stack)}`;

	const errorMessageEmbed = generateDefaultEmbed({
		color: BrandingColors.BirthdayyDev,
		description: `${codeBlock(`js`, errorString)}`,
		title: 'An error has occured',
	});

	reply(interaction, { embeds: [errorMessageEmbed], ephemeral: !interaction.replied || !interaction.deferred }).catch(
		() => interaction.user.send({ embeds: [errorMessageEmbed] }),
	);

	return sendErrorMessageToAdmin(errorMessageEmbed);
}

function sendErrorMessageToAdmin(embed: APIEmbed) {
	const webhook = container.client.webhookError;
	if (webhook === null) return;
	return webhook.send({ embeds: [embed] });
}

export function handleCommandErrorAndSendToUser({
	interaction,
	error,
	loggerSeverityLevel,
	sentrySeverityLevel,
}: ErrorHandlerOptions) {
	if (envIsDefined('SENTRY_URL')) captureCommandErrorToSentry({ error, interaction, sentrySeverityLevel });
	if (DEBUG) logErrorToContainer({ error, loggerSeverityLevel });
	return sendErrorMessageToUser({ error, interaction });
}

export function handleRouteApiError({
	request,
	response,
	error,
	loggerSeverityLevel,
	sentrySeverityLevel,
}: RouteApiErrorHandler): void {
	if (envIsDefined('SENTRY_URL')) captureRouteApiErrorToSentry({ error, request, sentrySeverityLevel });
	if (DEBUG) logErrorToContainer({ error, loggerSeverityLevel });
	return response.status(500).json({ error: error.message });
}
