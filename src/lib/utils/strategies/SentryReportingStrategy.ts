import * as Sentry from '@sentry/node';
import { BaseError, DiscordError, isBaseError } from '../../errors/index';
import type { ErrorReportingStrategy, ErrorReportingContext } from '../types/ErrorReporting';

/**
 * Sentry implementation of error reporting strategy.
 *
 * Reports errors to Sentry with intelligent filtering of expected Discord errors,
 * automatic context enrichment, and unique fingerprinting for better issue grouping.
 *
 * @example
 * ```typescript
 * const strategy = new SentryReportingStrategy({ enabled: envIsDefined('SENTRY_DSN') });
 * container.errorLogger.setErrorReportingStrategy(strategy);
 * ```
 */
export class SentryReportingStrategy implements ErrorReportingStrategy {
	private enabled: boolean;

	/**
	 * Creates a new Sentry reporting strategy
	 *
	 * @param options Configuration options
	 * @param options.enabled Whether Sentry reporting is enabled (default: auto-detect from SENTRY_DSN)
	 */
	public constructor(options?: { enabled?: boolean }) {
		this.enabled = options?.enabled ?? false;
	}

	/**
	 * Set whether Sentry reporting is enabled
	 *
	 * @param enabled New enabled state
	 */
	public setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}

	/**
	 * Report an error to Sentry with full context
	 *
	 * Intelligently filters expected Discord errors and creates unique fingerprints
	 * for better grouping in Sentry.
	 *
	 * @param error The error to report
	 * @param context Optional context information (interaction, userId, guildId, taskName, requestId)
	 */
	public async report(error: BaseError | Error, context?: ErrorReportingContext): Promise<void> {
		if (!this.enabled) return;

		// Don't report expected Discord errors
		if (error instanceof DiscordError && error.isExpected) {
			return;
		}

		const baseError = error as BaseError;

		return new Promise((resolve) => {
			Sentry.withScope((scope) => {
				this.configureSeverity(scope, error);
				this.configureErrorCode(scope, error);
				this.configureInteractionContext(scope, context);
				this.configureUserGuildContext(scope, context);
				this.configureTaskContext(scope, context);
				this.configureRequestId(scope, context);

				this.configureFingerprint(scope, error, baseError);
				Sentry.captureException(error);
				resolve();
			});
		});
	}

	private configureSeverity(scope: Sentry.Scope, error: BaseError | Error): void {
		if (isBaseError(error)) {
			const baseError = error;
			scope.setLevel(baseError.code.includes('ERROR') ? 'error' : 'warning');
		} else {
			scope.setLevel('error');
		}
	}

	private configureErrorCode(scope: Sentry.Scope, error: BaseError | Error): void {
		if (isBaseError(error)) {
			const baseError = error;
			scope.setTag('error_code', baseError.code);
		}
	}

	private configureInteractionContext(scope: Sentry.Scope, context?: ErrorReportingContext): void {
		if (!context?.interaction) return;

		const { interaction } = context;
		scope.setTags({
			commandName: interaction.commandName,
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			userId: interaction.user.id,
		});

		scope.setContext('interaction', {
			commandName: interaction.commandName,
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			userId: interaction.user.id,
			username: interaction.user.username,
			deferred: interaction.deferred,
			replied: interaction.replied,
			locale: interaction.locale,
		});

		scope.setUser({
			id: interaction.user.id,
			username: interaction.user.username,
		});
	}

	private configureUserGuildContext(scope: Sentry.Scope, context?: ErrorReportingContext): void {
		if (context?.userId && !context?.interaction) {
			scope.setTag('userId', context.userId);
			scope.setUser({ id: context.userId });
		}

		if (context?.guildId && !context?.interaction) {
			scope.setTag('guildId', context.guildId);
		}
	}

	private configureTaskContext(scope: Sentry.Scope, context?: ErrorReportingContext): void {
		if (!context?.taskName) return;

		scope.setTag('task_name', context.taskName);
		scope.setContext('task', {
			name: context.taskName,
		});
	}

	private configureRequestId(scope: Sentry.Scope, context?: ErrorReportingContext): void {
		if (context?.requestId) {
			scope.setTag('request_id', context.requestId);
		}
	}

	private configureFingerprint(scope: Sentry.Scope, error: BaseError | Error, baseError: BaseError): void {
		if (isBaseError(error)) {
			scope.setContext('error_context', baseError.getSentryContext());

			const fingerprint: string[] = [baseError.code];
			if (error instanceof DiscordError) {
				fingerprint.push(String(error.discordCode));
			}
			scope.setFingerprint(fingerprint);
		} else {
			scope.setFingerprint([error.message ?? 'unknown error']);
		}
	}
}
