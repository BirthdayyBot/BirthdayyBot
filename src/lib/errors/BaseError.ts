/**
 * Base error class for all application errors
 * Provides consistent error structure and metadata
 */
export abstract class BaseError extends Error {
	/**
	 * Error code for categorization and i18n
	 */
	public readonly code: string = 'UNKNOWN_ERROR';

	/**
	 * Whether this error should be reported to Sentry
	 */
	public abstract readonly shouldReportToSentry: boolean;

	/**
	 * Whether this error should be shown to the user
	 */
	public abstract readonly shouldShowToUser: boolean;

	/**
	 * HTTP status code (for API errors)
	 */
	public statusCode = 500;

	/**
	 * Additional context for debugging
	 */
	public readonly context: Record<string, unknown> = {};

	/**
	 * Original error that caused this error
	 */
	public readonly cause?: Error;

	public constructor(message: string, cause?: Error, context?: Record<string, unknown>) {
		super(message);
		this.name = this.constructor.name;
		this.cause = cause;
		if (context) this.context = context;

		// Capture stack trace
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	/**
	 * Get a user-friendly error message
	 */
	public abstract getUserMessage(): string;

	/**
	 * Get metadata for Sentry reporting
	 */
	public getSentryContext() {
		return {
			code: this.code,
			context: this.context,
			message: this.message,
		};
	}

	/**
	 * Check if this is an instance of a specific error type
	 */
	public isType(type: typeof BaseError): boolean {
		return this instanceof type;
	}
}
