import { BaseError } from './BaseError';

/**
 * Unknown/Unexpected error
 * Should always be reported to Sentry
 */
export class UnexpectedError extends BaseError {
	public readonly code = 'UNEXPECTED_ERROR';
	public readonly shouldReportToSentry = true;
	public readonly shouldShowToUser = false;
	public readonly statusCode = 500;

	public constructor(message: string, cause?: Error, context?: Record<string, unknown>) {
		super(message, cause, context);
	}

	public getUserMessage(): string {
		return 'An unexpected error occurred. Our team has been notified. Please try again later.';
	}
}

/**
 * Configuration error
 * Triggered during initialization/setup
 */
export class ConfigurationError extends BaseError {
	public readonly code = 'CONFIG_ERROR';
	public readonly shouldReportToSentry = true;
	public readonly shouldShowToUser = false;
	public readonly statusCode = 500;

	public constructor(
		public readonly configKey: string,
		message: string,
		context?: Record<string, unknown>,
	) {
		super(message, undefined, { ...context, configKey });
	}

	public getUserMessage(): string {
		return 'Application configuration error. Please contact support.';
	}
}

/**
 * External API error
 * Error from third-party API
 */
export class ExternalAPIError extends BaseError {
	public readonly code = 'EXTERNAL_API_ERROR';
	public readonly shouldReportToSentry = true;
	public readonly shouldShowToUser = false;
	public readonly statusCode = 502;

	public constructor(
		public readonly apiName: string,
		message: string,
		cause?: Error,
		context?: Record<string, unknown>,
	) {
		super(message, cause, { ...context, apiName, statusCode: 502 });
	}

	public getUserMessage(): string {
		return 'Unable to reach external service. Please try again later.';
	}
}
