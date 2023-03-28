import * as Sentry from '@sentry/node';
import { container } from '@sapphire/framework';

type LoggerWithoutLevel = Omit<typeof container.logger, 'LogLevel' | 'write' | 'has'>;

export class CustomError extends Error {
	public name: string;
	public message: string;
	public stack?: string;
	public cause?: unknown;

	constructor(error: Error, level: { logger: keyof LoggerWithoutLevel, sentry: Sentry.SeverityLevel}) {
		super(error.message);
		this.name = error.name;
		this.message = error.message;
		this.stack = error.stack;
		this.cause = error.cause;

		this.logger(level.logger);
		this.captureToSentry(level.sentry);
	}

	private logger(level: keyof LoggerWithoutLevel) {
		container.logger[level](this);
	}

	private captureToSentry(level: Sentry.SeverityLevel): void {
		Sentry.withScope((scope) => {
			scope.setExtra('error', {
				name: this.name,
				message: this.message,
				stack: this.stack,
				cause: this.cause,
			});
			scope.setLevel(level);
			Sentry.captureException(this);
		});
	}
}
