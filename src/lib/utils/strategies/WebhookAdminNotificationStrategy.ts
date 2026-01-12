import { container } from '@sapphire/framework';
import type { WebhookClient } from 'discord.js';
import { ErrorFormatter } from '../ErrorFormatter';
import type { BaseError } from '../../errors/index';
import type { AdminNotificationContext } from '../types/AdminNotification';
import type { AdminNotificationStrategy } from './AdminNotificationStrategy';

/**
 * Discord webhook implementation of admin notification strategy.
 *
 * Sends formatted error embeds with context to a Discord webhook for admin monitoring.
 *
 * @example
 * ```typescript
 * const webhook = new WebhookClient({ id: 'xxx', token: 'yyy' });
 * const strategy = new WebhookAdminNotificationStrategy(webhook);
 * container.errorLogger.setAdminNotificationStrategy(strategy);
 * ```
 */
export class WebhookAdminNotificationStrategy implements AdminNotificationStrategy {
	private readonly formatter: ErrorFormatter;

	/**
	 * Creates a new webhook notification strategy
	 *
	 * @param webhook Discord webhook client (or null to disable notifications)
	 */
	public constructor(private readonly webhook: WebhookClient | null) {
		this.formatter = new ErrorFormatter();
	}

	/**
	 * Send error notification via Discord webhook
	 *
	 * @param error The error to notify about
	 * @param context Optional context information (commandName, userId, guildId, taskName)
	 */
	public async notify(error: BaseError | Error, context?: AdminNotificationContext): Promise<void> {
		if (!this.webhook) {
			container.logger.warn('[WebhookAdminNotificationStrategy.notify] No webhook client available');
			return;
		}

		const embed = this.formatter.buildErrorEmbed(error, true, true);

		if (context) {
			const contextData: Record<string, string | undefined> = {};
			for (const [key, value] of Object.entries(context)) {
				if (value !== undefined) {
					contextData[key] = typeof value === 'string' ? value : JSON.stringify(value);
				}
			}
			this.formatter.addContextToEmbed(embed, contextData);
		}

		try {
			await this.webhook.send({
				embeds: [embed],
			});
		} catch (err) {
			container.logger.warn(`[WebhookAdminNotificationStrategy.notify] Failed to send webhook: ${String(err)}`);
		}
	}
}
