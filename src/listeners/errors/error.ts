import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import * as Sentry from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import { logErrorToContainer } from '#utils/functions/errorHandling';

@ApplyOptions<Listener.Options>({ event: Events.Error })
export class ErrorEvent extends Listener<typeof Events.Error> {
	public run(error: Error) {
		const SendErrorToSentry = () =>
			Sentry.withScope((scope) => {
				scope.setLevel('error');
				scope.setFingerprint([error.name]);
				scope.setTransactionName('ErrorEvent');
				Sentry.captureException(error);
			});

		if (envIsDefined('SENTRY_URL')) return SendErrorToSentry;

		return logErrorToContainer({ error, loggerSeverityLevel: 'error' });
	}
}
