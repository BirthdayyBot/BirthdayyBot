import { BaseError } from './BaseError';
import { DiscordAPIError } from 'discord.js';

/**
 * Discord-related error
 * Usually should not be reported to Sentry unless unexpected
 */
export class DiscordError extends BaseError {
	public readonly code = 'DISCORD_ERROR';
	public readonly statusCode = 502;

	/**
	 * Discord error code (e.g., 10062 for "Unknown interaction")
	 */
	public readonly discordCode: number | undefined;

	/**
	 * Whether this is an expected Discord error that should be silently handled
	 */
	public readonly isExpected: boolean;

	public readonly shouldShowToUser = false;

	public constructor(message: string, discordCode?: number, cause?: Error, context?: Record<string, unknown>) {
		super(message, cause, context);
		this.discordCode = discordCode;

		// These Discord errors are expected and don't need Sentry reporting
		this.isExpected = discordCode !== undefined && EXPECTED_DISCORD_ERROR_CODES.has(discordCode);
	}

	public get shouldReportToSentry(): boolean {
		return !this.isExpected;
	}

	public getUserMessage(): string {
		return 'An error occurred while communicating with Discord. Please try again later.';
	}

	/**
	 * Create a DiscordError from a DiscordAPIError
	 */
	public static fromDiscordAPIError(error: DiscordAPIError, context?: Record<string, unknown>): DiscordError {
		return new DiscordError(error.message, error.code as number, error, context);
	}
}

/**
 * Discord API error codes that are expected and don't need Sentry reporting
 */
export const EXPECTED_DISCORD_ERROR_CODES = new Set([
	10008, // Unknown Message
	10062, // Unknown interaction
	50007, // Cannot send messages to this user
	40003, // Opening direct messages too fast
	40001, // Unauthorized
	50001, // Missing Access
	50013, // Missing Permissions (user DM issue)
]);

/**
 * Database-related error
 * Should always be reported to Sentry
 */
export class DatabaseError extends BaseError {
	public readonly code = 'DATABASE_ERROR';
	public readonly shouldReportToSentry = true;
	public readonly shouldShowToUser = false;
	public readonly statusCode = 500;

	public constructor(message: string, cause?: Error, context?: Record<string, unknown>) {
		super(message, cause, context);
	}

	public getUserMessage(): string {
		return 'A database error occurred. Please try again later.';
	}
}

/**
 * Timeout error
 * Operation took too long to complete
 */
export class TimeoutError extends BaseError {
	public readonly code = 'TIMEOUT';
	public readonly shouldReportToSentry = false;
	public readonly shouldShowToUser = true;
	public readonly statusCode = 504;

	public constructor(
		public readonly operationName: string,
		public readonly timeoutMs: number,
		context?: Record<string, unknown>,
	) {
		super(`Operation "${operationName}" timed out after ${timeoutMs}ms`, undefined, {
			...context,
			operationName,
			timeoutMs,
		});
	}

	public getUserMessage(): string {
		return `The operation took too long. Please try again.`;
	}
}

/**
 * Rate limit error
 * Operation rate limited by Discord
 */
export class RateLimitError extends BaseError {
	public readonly code = 'RATE_LIMITED';
	public readonly shouldReportToSentry = false;
	public readonly shouldShowToUser = true;
	public readonly statusCode = 429;

	public constructor(
		public readonly retryAfter: number,
		context?: Record<string, unknown>,
	) {
		super(`Rate limited. Please retry after ${retryAfter}ms`, undefined, { ...context, retryAfter });
	}

	public getUserMessage(): string {
		return 'Too many requests. Please wait a moment and try again.';
	}
}
