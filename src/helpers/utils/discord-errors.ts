import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import type { DiscordAPIError } from 'discord.js';

/**
 * Discord error detection utilities
 * Provides type-safe error code checking for common Discord API errors
 */

export function isMessageNotFoundError(error: DiscordAPIError): boolean {
	return error.code === RESTJSONErrorCodes.UnknownMessage;
}

export function isChannelInvalidError(error: DiscordAPIError): boolean {
	return error.code === RESTJSONErrorCodes.UnknownChannel;
}

export function isMissingPermissionsError(error: DiscordAPIError): boolean {
	return error.code === RESTJSONErrorCodes.MissingPermissions || error.code === RESTJSONErrorCodes.MissingAccess;
}

export function isRateLimitError(error: DiscordAPIError): boolean {
	return error.status === 429;
}

export function isEmptyMessageError(error: DiscordAPIError): boolean {
	// Prefer checking the stable Discord API error code when available
	if (error.code === RESTJSONErrorCodes.CannotSendAnEmptyMessage) {
		return true;
	}

	// Fallback: more robust, case-insensitive string matching on the message
	const message = (error.message ?? '').toLowerCase();
	return message.includes('empty message') || message.includes('cannot send an empty message');
}

/**
 * Check if an error is transient (temporary) and should be retried
 */
export function isTransientError(error: DiscordAPIError): boolean {
	return isRateLimitError(error);
}

/**
 * Check if an error requires configuration reset
 */
export function requiresConfigReset(error: DiscordAPIError): boolean {
	return isChannelInvalidError(error) || isMissingPermissionsError(error);
}
