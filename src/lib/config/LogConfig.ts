/**
 * Logging Configuration
 * Configuration centralisée pour le logging et Sentry
 */

export const LOG_CONFIG = {
	// Niveaux de sévérité pour Sentry
	SENTRY_LEVELS: {
		DEBUG: 'debug' as const,
		INFO: 'info' as const,
		WARNING: 'warning' as const,
		ERROR: 'error' as const,
		FATAL: 'fatal' as const,
	},

	// Codes d'erreurs personnalisées
	ERROR_CODES: {
		// User errors (400s)
		USER_ERROR: 'USER_ERROR',
		VALIDATION_ERROR: 'VALIDATION_ERROR',
		PERMISSION_DENIED: 'PERMISSION_DENIED',
		NOT_FOUND: 'NOT_FOUND',

		// Discord errors
		DISCORD_ERROR: 'DISCORD_ERROR',
		DISCORD_TIMEOUT: 'DISCORD_TIMEOUT',
		DISCORD_RATE_LIMITED: 'DISCORD_RATE_LIMITED',

		// Server errors (500s)
		DATABASE_ERROR: 'DATABASE_ERROR',
		CONFIGURATION_ERROR: 'CONFIG_ERROR',
		EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
		UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
		TIMEOUT: 'TIMEOUT',
	},

	// Discord API error codes que Sentry ne doit pas rapporter
	EXPECTED_DISCORD_CODES: {
		UNKNOWN_MESSAGE: 10008,
		UNKNOWN_INTERACTION: 10062,
		CANNOT_DM_USER: 50007,
		OPENING_DMS_TOO_FAST: 40003,
		UNAUTHORIZED: 40001,
		MISSING_ACCESS: 50001,
		MISSING_PERMISSIONS: 50013,
	},

	// Configuration de timeout
	TIMEOUTS: {
		DEFAULT_OPERATION: 10000, // 10 secondes
		DATABASE_QUERY: 5000, // 5 secondes
		DISCORD_API: 10000, // 10 secondes
		EXTERNAL_API: 15000, // 15 secondes
	},

	// Configuration de retry
	RETRY_CONFIG: {
		MAX_ATTEMPTS: 3,
		INITIAL_DELAY: 1000, // 1 seconde
		MAX_DELAY: 10000, // 10 secondes
		BACKOFF_MULTIPLIER: 2,
	},

	// Contexte à toujours inclure
	DEFAULT_CONTEXT: {
		// Ajouté automatiquement
		timestamp: true,
		environment: true,
		node_version: true,
		app_version: true,
	},
} as const;

/**
 * Mapper d'erreurs pour les utilisateurs finaux
 * Utilisé pour générer des messages user-friendly
 */
export const ERROR_USER_MESSAGES: Record<string, string> = {
	USER_ERROR: 'An error occurred with your request. Please check your input and try again.',
	VALIDATION_ERROR: 'Invalid input provided. Please check your data and try again.',
	PERMISSION_DENIED: "You don't have permission to perform this action.",
	NOT_FOUND: 'The requested item was not found.',
	DISCORD_ERROR: 'An error occurred while communicating with Discord. Please try again.',
	DATABASE_ERROR: 'A database error occurred. Please try again later.',
	CONFIGURATION_ERROR: 'Application configuration error. Please contact support.',
	EXTERNAL_API_ERROR: 'Unable to reach external service. Please try again later.',
	UNEXPECTED_ERROR: 'An unexpected error occurred. Our team has been notified.',
	TIMEOUT: 'The operation took too long. Please try again.',
};

/**
 * Émojis pour les logs (optionnel mais utile pour les couleurs de console)
 */
export const LOG_EMOJIS = {
	DEBUG: '🔍',
	INFO: 'ℹ️',
	WARN: '⚠️',
	ERROR: '❌',
	SUCCESS: '✅',
	TIMEOUT: '⏱️',
	DATABASE: '🗄️',
	DISCORD: '💬',
	EXTERNAL_API: '🌐',
} as const;
