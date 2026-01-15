import type { SeverityLevel } from '@sentry/types';
import type { ApiRequest, ApiResponse } from '@sapphire/plugin-api';
import type { Scope } from '@sentry/node';
import type { Command } from '@sapphire/framework';

export type ErrorType = 'trace' | 'debug' | 'info' | 'warn' | 'error';

/**
 * Error handling options for consistent error handling
 */
export interface ErrorHandlerOptions {
	interaction?: Command.ChatInputCommandInteraction;
	error: Error;
	loggerSeverityLevel?: ErrorType;
	sentrySeverityLevel?: SeverityLevel;
}

/**
 * Error logging options
 */
export interface ErrorLoggingOptions {
	interaction?: Command.ChatInputCommandInteraction;
	taskName?: string;
	userId?: string;
	guildId?: string;
	requestId?: string;
	logSeverity?: ErrorType;
}

/**
 * Sentry scope setup options
 */
export interface ErrorDefaultSentryScope {
	scope: Scope;
	error: Error;
	sentrySeverityLevel: SeverityLevel;
}

/**
 * Route API error handling options
 */
export interface RouteApiErrorHandler extends ErrorHandlerOptions {
	request: ApiRequest;
	response: ApiResponse;
}
