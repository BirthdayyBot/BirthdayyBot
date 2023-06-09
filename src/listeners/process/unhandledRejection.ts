import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import * as Sentry from '@sentry/node';
import { logErrorToContainer } from '../../lib/utils/errorHandling';
import { envIsDefined } from '@skyra/env-utilities';

@ApplyOptions<Listener.Options>({ emitter: process, event: 'unhandledRejection' })
export class unhandledRejectionEvent extends Listener {
	public run(error: Error) {
		if (envIsDefined('SENTRY_DSN')) {
			Sentry.withScope((scope) => {
				scope.setLevel('error');
				scope.setFingerprint([error.name]);
				scope.setTransactionName('unhandledRejectionEvent');
				Sentry.captureException(error);
			});
		}

		return logErrorToContainer({ error, loggerSeverityLevel: 'error' });
	}
}
