import type { Command } from '@sapphire/framework';
import type { ApiRequest, ApiResponse } from '@sapphire/plugin-api';
import type * as Sentry from '@sentry/node';
import type { ErrorType } from './errors';

export interface ErrorHandlerOptions {
	interaction: Command.ChatInputCommandInteraction | Command.ContextMenuCommandInteraction;
	error: Error;
	loggerSeverityLevel: ErrorType;
	sentrySeverityLevel: Sentry.SeverityLevel;
}

export interface ErrorDefaultSentryScope {
	error: Error;
	sentrySeverityLevel: Sentry.SeverityLevel;
	scope: Sentry.Scope;
}

export type RouteApiErrorHandler = {
	error: Error;
	loggerSeverityLevel: ErrorType;
	sentrySeverityLevel: Sentry.SeverityLevel;
} & { request: ApiRequest; response: ApiResponse };
