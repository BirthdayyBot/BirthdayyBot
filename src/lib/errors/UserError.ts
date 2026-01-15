import { BaseError } from './BaseError';

/**
 * Error caused by user input or action
 * Should be shown to user but not reported to Sentry unless critical
 */
export class UserError extends BaseError {
	public readonly code: string = 'USER_ERROR';
	public readonly shouldReportToSentry = false;
	public readonly shouldShowToUser = true;
	public statusCode = 400;

	public constructor(message: string, context?: Record<string, unknown>) {
		super(message, undefined, context);
	}

	public getUserMessage(): string {
		return this.message;
	}
}

/**
 * Validation error
 * Triggered when input validation fails
 */
export class ValidationError extends UserError {
	public readonly code: string = 'VALIDATION_ERROR';
	public statusCode = 422;

	public constructor(
		public readonly field: string,
		message: string,
		context?: Record<string, unknown>,
	) {
		super(message, { ...context, field });
	}
}

/**
 * Permission error
 * Triggered when user lacks required permissions
 */
export class PermissionError extends UserError {
	public readonly code: string = 'PERMISSION_DENIED';
	public statusCode = 403;

	public constructor(
		public readonly requiredPermission: string,
		context?: Record<string, unknown>,
	) {
		super(`You don't have permission to perform this action. Required: ${requiredPermission}`, {
			...context,
			requiredPermission,
		});
	}

	public getUserMessage(): string {
		return this.message;
	}
}

/**
 * Not found error
 * Triggered when a resource doesn't exist
 */
export class NotFoundError extends UserError {
	public readonly code: string = 'NOT_FOUND';
	public statusCode = 404;

	public constructor(
		public readonly resourceType: string,
		public readonly resourceId: string | number,
		context?: Record<string, unknown>,
	) {
		super(`${resourceType} with ID ${resourceId} not found`, { ...context, resourceType, resourceId });
	}
}
