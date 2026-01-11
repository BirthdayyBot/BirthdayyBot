import { container } from '@sapphire/framework';
import type { DiscordAPIError } from 'discord.js';

export interface LogContext {
	guild_id?: string;
	guildName?: string;
	channel_id?: string;
	channelName?: string;
	user_id?: string;
	userName?: string;
	message_id?: string;
}

/**
 * Contextual logger with automatic formatting
 * Provides consistent, enriched logging across the entire application
 *
 * Features:
 * - Auto-formatting of guild/channel/user context
 * - Configurable prefix per instance
 * - Discord error detection and logging
 * - Stack trace logging for debugging
 *
 * @example
 * ```ts
 * const logger = new ContextualLogger('[BIRTHDAY REMINDER]');
 * logger.info('Sent birthday message', { guild_id, guildName, user_id, userName });
 * logger.error('Failed to send DM', { user_id, userName }, error);
 * ```
 */
export class ContextualLogger {
	public constructor(private readonly prefix: string) {}

	public info(message: string, context?: LogContext): void {
		container.logger.info(this.formatMessage(message, context));
	}

	public warn(message: string, context?: LogContext): void {
		container.logger.warn(this.formatMessage(message, context));
	}

	public error(message: string, context?: LogContext, error?: Error | DiscordAPIError): void {
		container.logger.error(this.formatMessage(message, context));

		if (error) {
			this.logErrorDetails(error);
		}
	}

	public success(action: string, context?: LogContext): void {
		this.info(action, context);
	}

	private formatMessage(message: string, context?: LogContext): string {
		if (!context) {
			return `${this.prefix} ${message}`;
		}

		const parts: string[] = [this.prefix, message];
		const { guildInfo, channelInfo, userInfo } = this.formatContext(context);

		if (channelInfo) parts.push(`in ${channelInfo}`);
		if (userInfo) parts.push(`for user ${userInfo}`);
		if (guildInfo) parts.push(`in guild ${guildInfo}`);

		return parts.join(' ');
	}

	private formatContext(context: LogContext): {
		guildInfo?: string;
		channelInfo?: string;
		userInfo?: string;
	} {
		let guildInfo: string | undefined;
		if (context.guild_id) {
			guildInfo = context.guildName ? `${context.guildName} (${context.guild_id})` : context.guild_id;
		}

		let channelInfo: string | undefined;
		if (context.channel_id) {
			channelInfo = context.channelName ? `#${context.channelName} (${context.channel_id})` : context.channel_id;
		}

		let userInfo: string | undefined;
		if (context.user_id) {
			userInfo = context.userName ? `${context.userName} (${context.user_id})` : context.user_id;
		}

		return { guildInfo, channelInfo, userInfo };
	}

	private logErrorDetails(error: Error | DiscordAPIError): void {
		if ('code' in error && 'status' in error) {
			container.logger.error(`${this.prefix} Error code: ${error.code}, Status: ${error.status}`);
		}
		if (error.stack) {
			container.logger.error(`${this.prefix} Stack: ${error.stack}`);
		}
	}
}

/**
 * Pre-configured loggers for common use cases
 */
export const overviewLogger = new ContextualLogger('[OVERVIEW UPDATE]');
export const birthdayLogger = new ContextualLogger('[BIRTHDAY REMINDER]');
export const announcementLogger = new ContextualLogger('[ANNOUNCEMENT]');
