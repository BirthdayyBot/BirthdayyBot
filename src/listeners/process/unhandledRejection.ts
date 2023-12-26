import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import * as Sentry from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import { logErrorToContainer } from '#utils/functions/errorHandling';

@ApplyOptions<Listener.Options>({ emitter: process, event: 'unhandledRejection' })
export class unhandledRejectionEvent extends Listener {
	public run(error: Error) {
		if (envIsDefined('SENTRY_URL')) {
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
