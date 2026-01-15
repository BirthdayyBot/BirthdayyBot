import type { AdminNotificationContext } from '../types/AdminNotification';
import type { BaseError } from '../../errors/index';
import type { Awaitable } from 'discord.js';

/**
 * Strategy interface for admin error notifications.
 *
 * Implement this interface to create custom notification handlers
 * (webhook, email, database, etc.)
 *
 * @example
 * ```typescript
 * export class EmailAdminNotificationStrategy implements AdminNotificationStrategy {
 *     constructor(private readonly emailService: EmailService) {}
 *
 *     async notify(error: BaseError | Error, context?: AdminNotificationContext): Promise<void> {
 *         const embed = ErrorFormatter.buildErrorEmbed(error, true, true);
 *         await this.emailService.send({
 *             subject: `Error: ${error.message}`,
 *             embeds: [embed],
 *             context
 *         });
 *     }
 * }
 * ```
 */
export interface AdminNotificationStrategy {
	/**
	 * Send admin notification for an error
	 *
	 * @param error The error to notify about
	 * @param context Optional context information
	 */
	notify(error: BaseError | Error, context?: AdminNotificationContext): Awaitable<void>;
}
