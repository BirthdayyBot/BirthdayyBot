import { container, type Awaitable } from '@sapphire/framework';
import { BaseError, DiscordError, isBaseError } from '../../errors/index';
import type { ErrorReportingStrategy, ErrorReportingContext } from '../types/ErrorReporting';
import type { ErrorType } from '../../types/errors';

/**
 * Console/Logger implementation of error reporting strategy.
 *
 * Reports errors to the Sapphire container logger with context information.
 * Useful for development, testing, or as a fallback logging mechanism.
 *
 * @example
 * ```typescript
 * const strategy = new ConsoleReportingStrategy({ severity: 'error' });
 * container.errorLogger.setErrorReportingStrategy(strategy);
 * ```
 */
export class ConsoleReportingStrategy implements ErrorReportingStrategy {
	private severity: ErrorType;

	/**
	 * Creates a new console reporting strategy
	 *
	 * @param options Configuration options
	 * @param options.severity Log severity level (default: 'error')
	 */
	public constructor(options?: { severity?: ErrorType }) {
		this.severity = options?.severity ?? 'error';
	}

	/**
	 * Set the log severity level
	 *
	 * @param severity New severity level
	 */
	public setSeverity(severity: ErrorType): void {
		this.severity = severity;
	}

	/**
	 * Report an error to the console/container logger with context
	 *
	 * Formats the error with context information and logs it to the Sapphire logger.
	 * Filters expected Discord errors automatically.
	 *
	 * @param error The error to report
	 * @param context Optional context information (interaction, userId, guildId, taskName, requestId)
	 */
	public report(error: BaseError | Error, context?: ErrorReportingContext): Awaitable<void> {
		// Don't report expected Discord errors
		if (error instanceof DiscordError && error.isExpected) {
			return;
		}

		const timestamp = new Date().toISOString();
		const errorType = error.constructor.name;
		const errorMessage = error.message;
		const errorStack = error.stack ?? 'No stack trace';

		// Build the log message
		let logMessage = `[${timestamp}] ${errorType}: ${errorMessage}`;

		// Add context if available
		if (context) {
			const contextParts = this.buildContextParts(error, context);
			if (contextParts.length > 0) {
				logMessage += ` [${contextParts.join(', ')}]`;
			}
		}

		// Add stack trace
		logMessage += `\n${errorStack}`;

		// Log to container
		container.logger[this.severity](logMessage);
	}

	/**
	 * Build context parts from error and context information
	 *
	 * @param error The error to extract code from
	 * @param context The context information
	 * @returns Array of formatted context strings
	 */
	private buildContextParts(error: BaseError | Error, context: ErrorReportingContext): string[] {
		const contextParts: string[] = [];

		this.addInteractionContext(context, contextParts);
		this.addUserContext(context, contextParts);
		this.addGuildContext(context, contextParts);
		this.addTaskContext(context, contextParts);
		this.addRequestContext(context, contextParts);
		this.addErrorCode(error, contextParts);

		return contextParts;
	}

	/**
	 * Add interaction context information
	 */
	private addInteractionContext(context: ErrorReportingContext, parts: string[]): void {
		if (!context.interaction) {
			return;
		}

		const interactionParts = [`command=${context.interaction.commandName}`, `user=${context.interaction.user.id}`];

		if (context.interaction.guildId) {
			interactionParts.push(`guild=${context.interaction.guildId}`);
		}

		parts.push(...interactionParts);
	}

	/**
	 * Add user context information
	 */
	private addUserContext(context: ErrorReportingContext, parts: string[]): void {
		if (context.userId && !context.interaction) {
			parts.push(`user=${context.userId}`);
		}
	}

	/**
	 * Add guild context information
	 */
	private addGuildContext(context: ErrorReportingContext, parts: string[]): void {
		if (context.guildId && !context.interaction) {
			parts.push(`guild=${context.guildId}`);
		}
	}

	/**
	 * Add task context information
	 */
	private addTaskContext(context: ErrorReportingContext, parts: string[]): void {
		if (context.taskName) {
			parts.push(`task=${context.taskName}`);
		}
	}

	/**
	 * Add request context information
	 */
	private addRequestContext(context: ErrorReportingContext, parts: string[]): void {
		if (context.requestId) {
			parts.push(`request=${context.requestId}`);
		}
	}

	/**
	 * Add error code if available
	 */
	private addErrorCode(error: BaseError | Error, parts: string[]): void {
		if (isBaseError(error)) {
			parts.push(`code=${error.code}`);
		}
	}
}
