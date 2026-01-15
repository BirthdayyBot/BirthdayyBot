/**
 * @deprecated This module is deprecated. Use ErrorLogger and ErrorFormatter instead.
 *
 * Migration guide:
 *
 * Old API:
 * ```typescript
 * import { buildErrorEmbed, sendErrorResponse, notifyAdminOfError } from './UserErrorResponse';
 *
 * const embed = buildErrorEmbed(error);
 * await sendErrorResponse({ interaction, error });
 * await notifyAdminOfError(error, { commandName: 'test' });
 * ```
 *
 * New API:
 * ```typescript
 * import { container } from '@sapphire/framework';
 * import { ErrorFormatter } from './ErrorFormatter';
 *
 * const embed = ErrorFormatter.buildErrorEmbed(error);
 * await container.errorLogger.sendErrorToUser(interaction, error);
 * await container.errorLogger.notifyAdminViaWebhook(container.webhook, error, { commandName: 'test' });
 * ```
 *
 */

// For backwards compatibility, re-export from the new locations
export { ErrorFormatter } from './ErrorFormatter';
export type { ErrorLoggerOptions } from './ErrorLogger';
