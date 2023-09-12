import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import * as Sentry from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import { logErrorToContainer } from '#utils/functions/errorHandling';

@ApplyOptions<Listener.Options>({ emitter: process, event: 'uncaughtException' })
export class uncaughtExceptionEvent extends Listener {
	public run(error: Error) {
		if (envIsDefined('SENTRY_DSN')) {
			Sentry.withScope((scope) => {
				scope.setLevel('error');
				scope.setFingerprint([error.name]);
				scope.setTransactionName('uncaughtExceptionEvent');
				Sentry.captureException(error);
			});
		}

		return logErrorToContainer({ error, loggerSeverityLevel: 'error' });
	}
}
