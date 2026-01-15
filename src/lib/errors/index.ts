import { BaseError } from './BaseError';
import { UserError, ValidationError, PermissionError, NotFoundError } from './UserError';
import {
	DiscordError,
	DatabaseError,
	TimeoutError,
	RateLimitError,
	EXPECTED_DISCORD_ERROR_CODES,
} from './DiscordError';
import { UnexpectedError, ConfigurationError, ExternalAPIError } from './RuntimeError';

// Export all error classes for convenience
export { BaseError };
export { UserError, ValidationError, PermissionError, NotFoundError };
export { DiscordError, DatabaseError, TimeoutError, RateLimitError, EXPECTED_DISCORD_ERROR_CODES };
export { UnexpectedError, ConfigurationError, ExternalAPIError };

/**
 * Type guard to check if an error is a BaseError
 */
export function isBaseError(error: unknown): error is BaseError {
	return error instanceof BaseError;
}

/**
 * Type guard to check if an error is a UserError
 */
export function isUserError(error: unknown): error is UserError {
	return error instanceof UserError;
}

/**
 * Type guard to check if an error is a DiscordError
 */
export function isDiscordError(error: unknown): error is DiscordError {
	return error instanceof DiscordError;
}

/**
 * Convert any error to BaseError for consistent handling
 */
export function normalizeError(error: unknown, context?: Record<string, unknown>): BaseError {
	if (isBaseError(error)) {
		return error;
	}

	if (error instanceof Error) {
		return new UnexpectedError(error.message, error, context);
	}

	return new UnexpectedError(String(error), undefined, context);
}
