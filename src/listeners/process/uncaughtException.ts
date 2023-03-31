import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { SENTRY_DSN } from '../../helpers/provide/environment';
import * as Sentry from '@sentry/node';
import { logErrorToContainer } from '../../lib/utils/errorHandling';

@ApplyOptions<Listener.Options>({ emitter: process, event: 'uncaughtException' })
export class uncaughtExceptionEvent extends Listener {

	public async run(error: Error) {
		if (SENTRY_DSN) {
			Sentry.withScope(scope => {
				scope.setLevel('error');
				scope.setFingerprint([error.name]);
				scope.setTransactionName('uncaughtExceptionEvent');
				Sentry.captureException(error);
			});
		}

		return logErrorToContainer({ error, loggerSeverityLevel: 'error' });
	}
}