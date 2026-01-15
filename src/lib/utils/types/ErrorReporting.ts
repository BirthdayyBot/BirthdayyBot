import type { ChatInputCommandInteraction, ContextMenuCommandInteraction } from 'discord.js';
import type { BaseError } from '../../errors/index';
import type { Awaitable } from '@sapphire/utilities';

/**
 * Context information for error reporting
 *
 * @example
 * ```typescript
 * const context: ErrorReportingContext = {
 *     interaction,
 *     userId: '123456789',
 *     guildId: '987654321',
 * };
 * ```
 */
export interface ErrorReportingContext {
	interaction?: ChatInputCommandInteraction | ContextMenuCommandInteraction;
	userId?: string;
	guildId?: string;
	taskName?: string;
	requestId?: string;
	[key: string]: unknown;
}

/**
 * Strategy interface for error reporting (e.g., Sentry, Datadog, etc.)
 *
 * Implement this interface to create custom error reporting handlers
 *
 * @example
 * ```typescript
 * export class DatadogReportingStrategy implements ErrorReportingStrategy {
 *     constructor(private readonly client: DatadogClient) {}
 *
 *     async report(error: BaseError | Error, context?: ErrorReportingContext): Promise<void> {
 *         await this.client.captureException(error, { context });
 *     }
 * }
 * ```
 */
export interface ErrorReportingStrategy {
	/**
	 * Report an error for monitoring and debugging
	 *
	 * @param error The error to report
	 * @param context Optional context information
	 */
	report(error: BaseError | Error, context?: ErrorReportingContext): Awaitable<void>;
}
