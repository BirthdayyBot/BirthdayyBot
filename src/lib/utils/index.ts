/**
 * Error handling and utility modules.
 *
 * Core exports:
 * - `ErrorLogger` - Main error handling orchestrator
 * - `ErrorFormatter` - Discord embed formatting for errors (instance-based for extensibility)
 * - `AdminNotificationStrategy` - Base interface for admin notification handlers
 * - `WebhookAdminNotificationStrategy` - Discord webhook implementation
 * - `ErrorReportingStrategy` - Base interface for error reporting handlers
 * - `SentryReportingStrategy` - Sentry implementation
 * - `ConsoleReportingStrategy` - Console/logger implementation
 * - `extractPieceContext` / `formatPieceContext` - Sapphire Piece metadata extraction
 * - Type definitions for error handling configuration
 *
 * @example
 * ```typescript
 * import { ErrorLogger, ErrorFormatter, WebhookAdminNotificationStrategy, extractPieceContext } from '@lib/utils';
 *
 * // Initialize with custom formatter options
 * const logger = new ErrorLogger({
 *     errorFormatterOptions: {
 *         showStackInProduction: false,
 *         maxStackLength: 2048
 *     }
 * });
 *
 * // Use the formatter
 * const embed = logger.getFormatter().buildErrorEmbed(error);
 *
 * // Or create standalone formatter
 * const formatter = new ErrorFormatter({
 *     errorColor: 0xFF0000,
 *     includeContextByDefault: true
 * });
 * ```
 */

export {
	ErrorLogger,
	type ErrorLoggerOptions,
	type ErrorHandlerOptions,
	type ErrorSource,
	fromDiscordAPIError,
	isExpectedDiscordError,
} from './ErrorLogger';
export { ErrorFormatter, type ErrorFormatterOptions } from './ErrorFormatter';
export type { AdminNotificationContext } from './types/AdminNotification';
export type { AdminNotificationStrategy } from './strategies/AdminNotificationStrategy';
export { WebhookAdminNotificationStrategy } from './strategies/WebhookAdminNotificationStrategy';
export type { ErrorReportingContext, ErrorReportingStrategy } from './types/ErrorReporting';
export { SentryReportingStrategy } from './strategies/SentryReportingStrategy';
export { ConsoleReportingStrategy } from './strategies/ConsoleReportingStrategy';
export type { PieceContext } from './helpers/PieceContext';
export { extractPieceContext, isPiece, formatPieceContext } from './helpers/PieceContext';
export { isDevelopment } from './env';
