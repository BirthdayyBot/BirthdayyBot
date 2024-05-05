import { translate } from '#lib/i18n/translate';
import { OWNERS } from '#root/config';
import { getCodeStyle, getLogPrefix } from '#utils/functions';
import { ArgumentError, ResultError, UserError, container, type Command } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { cutText } from '@sapphire/utilities';
import { captureException } from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import { DiscordAPIError, HTTPError, RESTJSONErrorCodes, codeBlock, type Snowflake } from 'discord.js';
import { exists } from 'i18next';

export function resolveError(t: TFunction, error: UserError | string) {
	return typeof error === 'string' ? resolveStringError(t, error) : resolveUserError(t, error);
}

function resolveStringError(t: TFunction, error: string) {
	return exists(error) ? (t(error) as string) : error;
}

function resolveUserError(t: TFunction, error: UserError) {
	const identifier = translate(error.identifier);
	return t(
		identifier,
		error instanceof ArgumentError
			? {
					...error,
					...(error.context as object),
					argument: error.argument.name,
					parameter: cutText(error.parameter.replaceAll('`', '῾'), 50)
				}
			: (error.context as any)
	) as string;
}

export function flattenError(command: Command | Subcommand, error: unknown): UserError | string | null {
	if (typeof error === 'string') return error;

	if (!(error instanceof Error)) {
		container.logger.fatal(getLogPrefix(command), 'Unknown unhandled error:', error);
		return null;
	}

	if (error instanceof ResultError) return flattenError(command, error.value);
	if (error instanceof UserError) return error;

	if (error instanceof DiscordAPIError) {
		container.logger.error(getLogPrefix(command), getCodeStyle(error.code.toString()), 'Unhandled error:', error);
		return getDiscordError(error.code as number);
	}

	if (error instanceof HTTPError) {
		container.logger.error(getLogPrefix(command), getCodeStyle(error.status.toString()), 'Unhandled error:', error);
		return getHttpError(error.status);
	}

	if (error.name === 'AbortError') {
		return 'system:discordAbortError';
	}

	container.logger.fatal(getLogPrefix(command), error);
	return null;
}

const sentry = envIsDefined('SENTRY_URL');
export function generateUnexpectedErrorMessage(
	userId: Snowflake,
	command: Command | Subcommand,
	t: TFunction,
	error: unknown
) {
	if (OWNERS.includes(userId)) return codeBlock('js', String(error));
	if (!sentry) return t('events/errors:unexpectedError');

	try {
		const report = captureException(error, { tags: { command: command.name } });
		return t('events/errors:unexpectedErrorWithContext', { report });
	} catch (error) {
		return t('events/errors:unexpectedError');
	}
}

function getDiscordError(code: RESTJSONErrorCodes) {
	switch (code) {
		case RESTJSONErrorCodes.UnknownChannel:
			return 'errors:genericUnknownChannel';
		case RESTJSONErrorCodes.UnknownGuild:
			return 'errors:genericUnknownGuild';
		case RESTJSONErrorCodes.UnknownMember:
			return 'errors:genericUnknownMember';
		case RESTJSONErrorCodes.UnknownMessage:
			return 'errors:genericUnknownMessage';
		case RESTJSONErrorCodes.UnknownRole:
			return 'errors:genericUnknownRole';
		case RESTJSONErrorCodes.MissingAccess:
			return 'errors:genericMissingAccess';
		default:
			return null;
	}
}

function getHttpError(status: number) {
	switch (status) {
		case 500:
			return 'errors:genericDiscordInternalServerError';
		case 502:
		case 504:
			return 'errors:genericDiscordGateway';
		case 503:
			return 'errors:genericDiscordUnavailable';
		default:
			return null;
	}
}
