import { container } from '@sapphire/framework';
import { envIsDefined } from '@skyra/env-utilities';
import type {
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	DiscordAPIError,
	WebhookClient,
} from 'discord.js';
import { DEBUG } from '../../helpers/provide/environment';
import { BaseError, DiscordError, EXPECTED_DISCORD_ERROR_CODES, isBaseError, normalizeError } from '../errors/index';
import type { ErrorType } from '../types/errors';
import { ErrorFormatter, type ErrorFormatterOptions } from './ErrorFormatter';
import type { AdminNotificationContext } from './types/AdminNotification';
import type { AdminNotificationStrategy } from './strategies/AdminNotificationStrategy';
import { WebhookAdminNotificationStrategy } from './strategies/WebhookAdminNotificationStrategy';
import { SentryReportingStrategy } from './strategies/SentryReportingStrategy';
import type { ErrorReportingStrategy, ErrorReportingContext } from './types/ErrorReporting';
import type { PieceContext } from './helpers/PieceContext';
import { extractPieceContext, formatPieceContext } from './helpers/PieceContext';

export interface ErrorLoggerOptions {
	enableSentry?: boolean;
	enableLogging?: boolean;
	debug?: boolean;
	defaultSeverity?: ErrorType;
	adminNotificationStrategy?: AdminNotificationStrategy | null;
	errorReportingStrategy?: ErrorReportingStrategy;
	errorFormatterOptions?: ErrorFormatterOptions;
}

/**
 * Source of the error for context tracking
 */
export type ErrorSource = 'command' | 'task' | 'listener' | 'route' | 'process' | 'interaction' | 'custom';

/**
 * Configuration options for error handling
 *
 * Provides comprehensive context about where and how the error occurred,
 * with automatic extraction from Discord interactions.
 */
export interface ErrorHandlerOptions {
	/**
	 * Discord interaction that triggered the error (auto-extracts userId, guildId)
	 */
	interaction?: ChatInputCommandInteraction | ContextMenuCommandInteraction;

	/**
	 * Sapphire Piece instance (Command, Listener, Task, etc.)
	 * Auto-extracts piece metadata using @sapphire/pieces API
	 */
	piece?: unknown;

	/**
	 * Background task name (for non-interaction errors)
	 */
	taskName?: string;

	/**
	 * User ID for context (auto-extracted from interaction if provided)
	 */
	userId?: string;

	/**
	 * Guild ID for context (auto-extracted from interaction if provided)
	 */
	guildId?: string;

	/**
	 * Request ID for distributed tracing
	 */
	requestId?: string;

	/**
	 * Log severity level (default: 'error')
	 */
	logSeverity?: ErrorType;

	/**
	 * Source of the error for better categorization
	 */
	source?: ErrorSource;

	/**
	 * Force reporting even if shouldReportToSentry is false
	 */
	forceReport?: boolean;
}

/**
 * Enhanced error logger with structured logging and Sentry integration.
 *
 * Provides a centralized error handling system that:
 * - Normalizes any error type to structured BaseError instances
 * - Logs errors to the Sapphire container logger
 * - Reports errors to Sentry (when configured)
 * - Sends user-friendly error messages to Discord interactions
 * - Notifies admins via pluggable notification strategies
 *
 * @example
 * ```typescript
 * // Handle an error from a command
 * const normalized = container.errorLogger.handle(error, {
 *     interaction,
 *     logSeverity: 'error'
 * });
 *
 * // Send response to user
 * await container.errorLogger.sendErrorToUser(interaction, normalized);
 *
 * // Notify admins using the configured strategy
 * await container.errorLogger.notifyAdmin(normalized, {
 *     commandName: interaction.commandName,
 *     userId: interaction.user.id
 * });
 * ```
 */
export class ErrorLogger {
	private readonly options: ErrorLoggerOptions;
	private readonly formatter: ErrorFormatter;

	/**
	 * Creates a new ErrorLogger instance.
	 *
	 * @param options Configuration options
	 * @param options.enableSentry Whether to report to Sentry (auto-detected from SENTRY_DSN)
	 * @param options.enableLogging Whether to log to Sapphire container (default: true)
	 * @param options.debug Whether to enable debug logging (default: DEBUG env)
	 * @param options.defaultSeverity Default log severity level (default: 'error')
	 * @param options.adminNotificationStrategy Strategy for admin notifications (default: null)
	 * @param options.errorReportingStrategy Strategy for error reporting (default: SentryReportingStrategy)
	 * @param options.errorFormatterOptions Options to configure the ErrorFormatter
	 */
	public constructor(options: ErrorLoggerOptions = {}) {
		const enableSentry = options.enableSentry ?? envIsDefined('SENTRY_DSN');

		this.options = {
			enableSentry,
			enableLogging: options.enableLogging ?? true,
			debug: options.debug ?? DEBUG,
			defaultSeverity: options.defaultSeverity ?? 'error',
			adminNotificationStrategy: options.adminNotificationStrategy ?? null,
			errorReportingStrategy:
				options.errorReportingStrategy ?? new SentryReportingStrategy({ enabled: enableSentry }),
		};

		this.formatter = new ErrorFormatter(options.errorFormatterOptions);
	}

	/**
	 * Log error to Sapphire container logger.
	 *
	 * @param error The error to log
	 * @param severity Log level (default: 'error')
	 */
	public logToContainer(error: Error, severity: ErrorType = this.options.defaultSeverity ?? 'error'): void {
		if (!this.options.enableLogging) return;
		const formattedError = this.formatErrorForLog(error);
		container.logger[severity](formattedError);
	}

	/**
	 * Get the error formatter instance.
	 *
	 * Use this to access the formatter for building embeds manually
	 * when you need more control over formatting.
	 *
	 * @returns The ErrorFormatter instance
	 *
	 * @example
	 * ```typescript
	 * const embed = container.errorLogger.getFormatter().buildErrorEmbed(error);
	 * const updatedEmbed = container.errorLogger.getFormatter().addContextToEmbed(embed, context);
	 * ```
	 */
	public getFormatter(): ErrorFormatter {
		return this.formatter;
	}

	/**
	 * Report error using the configured error reporting strategy.
	 *
	 * Intelligently filters expected Discord errors and creates unique
	 * fingerprints for better grouping in monitoring systems.
	 *
	 * @param error The error to report
	 * @param context Additional context for the error
	 * @param context.interaction Discord interaction context
	 * @param context.userId User ID for context
	 * @param context.guildId Guild ID for context
	 * @param context.taskName Name of background task (if applicable)
	 * @param context.requestId Request ID for tracing
	 */
	public async reportToSentry(error: BaseError | Error, context?: ErrorReportingContext): Promise<void> {
		await this.options.errorReportingStrategy?.report(error, context);
	}

	/**
	 * Main entry point for error handling.
	 *
	 * Normalizes the error, logs it, and optionally reports to the configured
	 * error reporting strategy based on the error's shouldReportToSentry property.
	 *
	 * Automatically extracts context from Discord interactions and builds complete
	 * context for logging and reporting. Handles async reporting without blocking
	 * the main execution.
	 *
	 * @param error The error to handle (any type)
	 * @param options Handling options
	 * @returns Normalized BaseError instance
	 *
	 * @example
	 * ```typescript
	 * // From command
	 * const normalized = container.errorLogger.handle(error, {
	 *     interaction,
	 *     source: 'command'
	 * });
	 *
	 * // From task with custom source
	 * const normalized = container.errorLogger.handle(error, {
	 *     taskName: 'BirthdayReminder',
	 *     source: 'task'
	 * });
	 *
	 * // With Sapphire Piece for auto-metadata extraction
	 * const normalized = container.errorLogger.handle(error, {
	 *     interaction,
	 *     piece: this // Extracts Command:commandName automatically
	 * });
	 *
	 * // Force reporting regardless of error type
	 * const normalized = container.errorLogger.handle(error, {
	 *     interaction,
	 *     forceReport: true
	 * });
	 * ```
	 */
	public handle(error: unknown, options: ErrorHandlerOptions = {}): BaseError {
		// Normalize the error
		const normalizedError = isBaseError(error) ? error : normalizeError(error);

		// Extract piece context if provided
		const pieceContext = options.piece ? extractPieceContext(options.piece) : undefined;

		// Build complete context (auto-extract from interaction if provided)
		const context = this.buildErrorContext(options);

		// Log the error (respects enableLogging option)
		const logSeverity = options.logSeverity ?? this.options.defaultSeverity ?? 'error';
		this.logErrorWithContext(normalizedError, context, pieceContext, logSeverity);

		// Report using the configured strategy if needed (fire and forget)
		const shouldReport = options.forceReport || normalizedError.shouldReportToSentry;
		if (shouldReport) {
			// Run reporting asynchronously without blocking
			this.reportToSentry(normalizedError, {
				interaction: options.interaction,
				userId: context.userId,
				guildId: context.guildId,
				taskName: options.taskName,
				requestId: options.requestId,
			}).catch((error_) => {
				container.logger.warn(
					`[ErrorLogger.handle] Failed to report error: ${
						error_ instanceof Error ? error_.message : String(error_)
					}`,
				);
			});
		}

		return normalizedError;
	}

	/**
	 * Set the admin notification strategy at runtime.
	 *
	 * Allows changing the notification handler without creating a new ErrorLogger instance.
	 *
	 * @param strategy New admin notification strategy (or null to disable admin notifications)
	 *
	 * @example
	 * ```typescript
	 * // Switch from webhook to email notifications
	 * const emailStrategy = new EmailAdminNotificationStrategy(emailService);
	 * container.errorLogger.setAdminNotificationStrategy(emailStrategy);
	 * ```
	 */
	public setAdminNotificationStrategy(strategy: AdminNotificationStrategy | null): void {
		this.options.adminNotificationStrategy = strategy;
	}

	/**
	 * Set the error reporting strategy at runtime.
	 *
	 * Allows changing the error reporting handler (e.g., from Sentry to Datadog).
	 *
	 * @param strategy New error reporting strategy
	 *
	 * @example
	 * ```typescript
	 * // Switch from Sentry to custom reporting
	 * const customStrategy = new CustomReportingStrategy();
	 * container.errorLogger.setErrorReportingStrategy(customStrategy);
	 * ```
	 */
	public setErrorReportingStrategy(strategy: ErrorReportingStrategy): void {
		this.options.errorReportingStrategy = strategy;
	}

	/**
	 * Notify admins about an error using the configured strategy.
	 *
	 * Uses the current admin notification strategy (webhook, email, etc.) to send
	 * detailed error information to admins for monitoring and debugging.
	 *
	 * @param error The error to report to admins
	 * @param context Additional context to include in the notification
	 *
	 * @example
	 * ```typescript
	 * await container.errorLogger.notifyAdmin(error, {
	 *     commandName: 'birthday-set',
	 *     userId: interaction.user.id,
	 *     guildId: interaction.guildId
	 * });
	 * ```
	 */
	public async notifyAdmin(error: BaseError | Error, context?: AdminNotificationContext): Promise<void> {
		if (!this.options.adminNotificationStrategy) {
			return;
		}

		await this.options.adminNotificationStrategy.notify(error, context);
	}

	/**
	 * @deprecated Use {@link notifyAdmin} with a strategy instead.
	 *
	 * Notify admins via Discord webhook with detailed error information.
	 *
	 * Sends a formatted error embed with stack trace and context to the
	 * configured error webhook for admin monitoring and debugging.
	 *
	 * @param webhook Discord webhook client (from container.webhook)
	 * @param error The error to report
	 * @param context Additional context to include in the webhook message
	 * @param context.commandName Name of the command that failed
	 * @param context.userId ID of the user who triggered the error
	 * @param context.guildId ID of the guild where error occurred
	 * @param context.taskName Name of background task (if applicable)
	 *
	 * @example
	 * ```typescript
	 * // Old way (deprecated):
	 * await container.errorLogger.notifyAdminViaWebhook(container.webhook, error, {
	 *     commandName: 'birthday-set',
	 *     userId: interaction.user.id,
	 *     guildId: interaction.guildId
	 * });
	 *
	 * // New way (recommended):
	 * const strategy = new WebhookAdminNotificationStrategy(container.webhook);
	 * container.errorLogger.setAdminNotificationStrategy(strategy);
	 * await container.errorLogger.notifyAdmin(error, {
	 *     commandName: 'birthday-set',
	 *     userId: interaction.user.id,
	 *     guildId: interaction.guildId
	 * });
	 * ```
	 */
	public async notifyAdminViaWebhook(
		webhook: WebhookClient | null,
		error: BaseError | Error,
		context?: {
			commandName?: string;
			userId?: string;
			guildId?: string;
			taskName?: string;
		},
	): Promise<void> {
		// Delegate to strategy for backwards compatibility
		const strategy = new WebhookAdminNotificationStrategy(webhook);
		await strategy.notify(error, context);
	}

	/**
	 * Send error response to user via Discord interaction.
	 *
	 * Sends a formatted error embed to the user. Automatically handles
	 * replied/deferred interactions by editing the original reply. Falls
	 * back to DM if initial send fails.
	 *
	 * @param interaction Discord interaction to send response to
	 * @param error The error to display to the user
	 * @param options Display options
	 * @param options.showStack Whether to include stack trace (default: true)
	 * @param options.ephemeral Whether message is ephemeral (default: true)
	 *
	 * @example
	 * ```typescript
	 * await container.errorLogger.sendErrorToUser(interaction, error, {
	 *     ephemeral: true,
	 *     showStack: isDevelopment
	 * });
	 * ```
	 */
	public async sendErrorToUser(
		interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
		error: Error | BaseError,
		options?: {
			showStack?: boolean;
			ephemeral?: boolean;
		},
	): Promise<void> {
		const { showStack = true, ephemeral = true } = options ?? {};
		const embed = this.formatter.buildErrorEmbed(error, showStack, false);

		try {
			if (interaction.replied || interaction.deferred) {
				await interaction.editReply({
					embeds: [embed],
					content: undefined,
				});
			} else {
				await interaction.reply({
					embeds: [embed],
					ephemeral,
				});
			}
		} catch {
			// If we can't send a message, try to DM the user
			try {
				await interaction.user.send({
					embeds: [embed],
				});
			} catch {
				// Last resort: just log it (expected if DMs are disabled)
				container.logger.warn(
					`[ErrorLogger.sendErrorToUser] Failed to send error message to user ${interaction.user.id}`,
				);
			}
		}
	}

	/**
	 * Build complete context from options and interaction
	 *
	 * @private
	 */
	private buildErrorContext(options: {
		interaction?: ChatInputCommandInteraction | ContextMenuCommandInteraction;
		taskName?: string;
		userId?: string;
		guildId?: string;
		requestId?: string;
		source?: string;
	}): { userId?: string; guildId?: string } {
		// Auto-extract from interaction if available
		const userId = options.userId || options.interaction?.user.id;
		const guildId = options.guildId || options.interaction?.guildId || undefined;

		return { userId, guildId };
	}

	/**
	 * Log error with formatted context information
	 *
	 * @private
	 */
	private logErrorWithContext(
		error: BaseError,
		context: { userId?: string; guildId?: string },
		pieceContext: PieceContext | undefined,
		severity: ErrorType,
	): void {
		if (!this.options.enableLogging) return;

		const timestamp = new Date().toISOString();
		const errorCode = isBaseError(error) ? error.code : 'UNKNOWN_ERROR';
		const errorMessage = error.message;
		const errorStack = error.stack ?? 'No stack trace';

		// Build context string
		const contextParts: string[] = [];
		if (pieceContext) {
			contextParts.push(`piece=${formatPieceContext(pieceContext) ?? 'unknown'}`);
		}
		if (context.userId) contextParts.push(`user=${context.userId}`);
		if (context.guildId) contextParts.push(`guild=${context.guildId}`);

		const contextStr = contextParts.length > 0 ? ` [${contextParts.join(', ')}]` : '';

		const logMessage = `[${timestamp}] ${errorCode}: ${errorMessage}${contextStr}\n${errorStack}`;

		container.logger[severity](logMessage);
	}

	/**
	 * Format error for structured logging
	 */
	private formatErrorForLog(error: Error): string {
		const timestamp = new Date().toISOString();
		const errorType = error.constructor.name;
		const errorMessage = error.message;
		const errorStack = error.stack ?? 'No stack trace';

		return `[${timestamp}] ${errorType}: ${errorMessage}\n${errorStack}`;
	}
}

/**
 * Convert Discord.js DiscordAPIError to custom DiscordError for consistent error handling.
 *
 * @param error Discord.js API error to convert
 * @param context Optional context information to attach to the error
 * @returns Converted DiscordError instance
 *
 * @example
 * ```typescript
 * try {
 *     await interaction.reply({ content: 'test' });
 * } catch (error) {
 *     const discordError = fromDiscordAPIError(error as DiscordAPIError);
 *     container.errorLogger.handle(discordError);
 * }
 * ```
 */
export function fromDiscordAPIError(error: DiscordAPIError, context?: Record<string, unknown>): DiscordError {
	return new DiscordError(error.message, error.code as number, error, context);
}

/**
 * Check if an error is an expected Discord error that should be ignored.
 *
 * Expected errors include common issues like unknown interactions,
 * missing permissions, etc. that don't indicate application failures.
 *
 * @param error Error to check
 * @returns True if error is expected and should not trigger alerts
 */
export function isExpectedDiscordError(error: Error): boolean {
	if (error instanceof DiscordError) {
		return error.isExpected;
	}

	const errorWithCode = error as { code?: unknown };
	if ('code' in error && typeof errorWithCode.code === 'number') {
		return EXPECTED_DISCORD_ERROR_CODES.has(errorWithCode.code);
	}

	return false;
}
