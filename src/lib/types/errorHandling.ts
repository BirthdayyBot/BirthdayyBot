import type * as Sentry from '@sentry/node';
import type { container } from '@sapphire/pieces';
import type { ApiRequest, ApiResponse } from '@sapphire/plugin-api';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction } from 'discord.js';

export interface ErrorHandlerOptions {
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction ;
    error: Error;
    loggerSeverityLevel: keyof Omit<typeof container.logger, 'LogLevel' | 'write' | 'has'>;
    sentrySeverityLevel: Sentry.SeverityLevel;
}

export type ErrorDefaultSentryScope = {
    error: Error;
    sentrySeverityLevel: Sentry.SeverityLevel;
    scope: Sentry.Scope;
};

export type RouteApiErrorHandler = {
    error: Error;
    loggerSeverityLevel: keyof Omit<typeof container.logger, 'LogLevel' | 'write' | 'has'>;
    sentrySeverityLevel: Sentry.SeverityLevel;
} & { request: ApiRequest; response: ApiResponse; };